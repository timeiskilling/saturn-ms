use crate::bundle_client::UserBundleUpdate;
use crate::prelude::*;
use futures::future::join_all;
use futures::stream::StreamExt;
use std::pin::Pin;
use tonic_health::server::HealthReporter;

use crate::blockhash_data::BlockhashCache;
use crate::constant;
use crate::trader::JupiterTrader;
use proto_models::grpc::bundle_service_server::{BundleService, BundleServiceServer};
use proto_models::grpc::{SignedTransactions, TransactionsBuld, TransactionsToSign};
use tokio_stream::{Stream, wrappers::BroadcastStream};
use tonic::{Request, Response, Status};
pub struct TransactionService {
    pub trader: Arc<JupiterTrader>,
    pub rpc_semaphore: Arc<Semaphore>,
    pub cashed_blockhash: Arc<BlockhashCache>,
}

#[tonic::async_trait]
impl BundleService for TransactionService {
    #[instrument(skip_all, level = "info")]
    async fn create_transactions(
        &self,
        request: Request<TransactionsBuld>,
    ) -> Result<Response<TransactionsToSign>, Status> {
        let transactions_req = request.into_inner().transactions;
        let mut tasks: Vec<tokio::task::JoinHandle<Result<Vec<String>, Status>>> =
            Vec::with_capacity(transactions_req.len());

        for transaction in transactions_req {
            let trader = self.trader.clone();
            let semaphore = self.rpc_semaphore.clone();
            let block_hash = self.cashed_blockhash.clone();

            tasks.push(tokio::spawn(async move {
                let permit = semaphore
                    .acquire_owned()
                    .await
                    .expect("Failed to acquire semaphore permit");

                let _permit = permit;
                let options = transaction.options.ok_or_else(|| {
                    Status::invalid_argument(
                        "Field 'options' is missing in one of the transactions.",
                    )
                })?;
                let quote = trader
                    .get_quote_with_options(
                        &transaction.input_mint,
                        &transaction.output_mint,
                        transaction.amount,
                        transaction.slippage_bps as u16,
                        options.into(),
                    )
                    .await
                    .map_err(|e| {
                        tracing::error!("Failed to get quote: {:?}", e);
                        Status::internal("Failed to get a quote for one of the transactions.")
                    })?;

                let transactions = trader
                    .create_transactions(&transaction.user_pk, quote, &block_hash)
                    .await
                    .map_err(|e| {
                        tracing::error!("Failed to create transaction: {:?}", e);
                        Status::internal("Failed to create a transaction from the quote.")
                    })?;
                Ok(transactions)
            }));
        }
        let results = join_all(tasks).await;

        let mut transactions_to_sign = Vec::new();

        for result in results {
            match result {
                Ok(transaction_result) => match transaction_result {
                    Ok(transactions) => {
                        transactions_to_sign.extend(transactions);
                    }
                    Err(status) => {
                        tracing::error!("A sub-task failed with status: {}", status.message());
                        return Err(status);
                    }
                },
                Err(e) => {
                    tracing::error!("A task panicked: {:?}", e);
                    return Err(Status::internal(
                        "A critical error occurred while processing transactions.",
                    ));
                }
            }
        }

        Ok(Response::new(TransactionsToSign {
            transactions: transactions_to_sign,
        }))
    }

    type SendTransactionsStream = Pin<
        Box<
            dyn Stream<Item = Result<proto_models::grpc::UserBundleUpdate, Status>>
                + Send
                + 'static,
        >,
    >;
    async fn send_transactions(
        &self,
        request: Request<SignedTransactions>,
    ) -> Result<Response<Self::SendTransactionsStream>, Status> {
        let transactions = request.into_inner();
        let cloned_transactions = transactions.clone();
        let trader = self.trader.clone();

        let continiue = trader
            .send_transactions(
                cloned_transactions.transactions,
                &cloned_transactions.user_pk,
            )
            .await;

        match continiue {
            Ok(uuid) => {
                tracing::info!("Uuid bundle is {}", uuid);
            }
            Err(e) => {
                tracing::error!("ERROR in send_transaction {}", e);
                return Err(Status::internal("Internal in send transaction error"));
            }
        }

        let user_id_for_stream = transactions.user_pk.clone();

        let not_sys = self.trader.get_notification_system();

        let rx = not_sys.subscribe_to_user_stream(transactions.user_pk);

        let stream = BroadcastStream::new(rx).filter_map(move |result_from_broadcast| {
            let notification_system = not_sys.clone();
            let user_id = user_id_for_stream.clone();

            async move {
                let active_bundles = notification_system.get_user_bundles(&user_id);
                if active_bundles.is_empty() {
                    tracing::info!("User {} has no more bundles, closing stream.", user_id);
                    return None;
                }
                match result_from_broadcast {
                    Ok(internal_update) => Some(Ok(internal_update.into())),
                    Err(e) => {
                        tracing::error!("Stream for user {} lagged: {}", user_id, e);
                        Some(Err(Status::internal("Internal stream error")))
                    }
                }
            }
        });

        let response_stream: Self::SendTransactionsStream = Box::pin(stream);

        Ok(Response::new(response_stream))
    }
}

impl From<UserBundleUpdate> for proto_models::grpc::UserBundleUpdate {
    fn from(internal: UserBundleUpdate) -> Self {
        proto_models::grpc::UserBundleUpdate {
            bundle_id: internal.bundle_id,
            old_status: internal.old_status,
            new_status: internal.new_status as i32,
            timestamp: internal.timestamp,
            slot: internal.slot,
        }
    }
}

pub async fn service_jupiter_status(reporter: HealthReporter) {
    let http_client = reqwest::Client::builder().build().unwrap();
    let mut interval = tokio::time::interval(std::time::Duration::from_secs(
        constant::GRPC_HEALTH_CHECK_INTERVAL,
    ));
    let params = [("ids", "So11111111111111111111111111111111111111112")];
    loop {
        interval.tick().await;
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("Accept", "application/json".parse().unwrap());
        let response = http_client
            .get("https://lite-api.jup.ag/price/v3")
            .headers(headers)
            .query(&params)
            .send()
            .await;

        match response {
            Ok(_) => {
                reporter
                    .set_serving::<BundleServiceServer<TransactionService>>()
                    .await
            }
            Err(_) => {
                reporter
                    .set_not_serving::<BundleServiceServer<TransactionService>>()
                    .await
            }
        }
    }
}
