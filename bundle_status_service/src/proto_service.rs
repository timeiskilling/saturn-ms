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
use proto_models::grpc::{
    BuiltTransaction, BundleDelta, SignedTransactions, TransactionsBuld, TransactionsToSign,
};
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
        let mut tasks = Vec::with_capacity(transactions_req.len());

        let user_pk = transactions_req
            .first()
            .ok_or_else(|| Status::invalid_argument("No transactions provided"))?
            .user_pk
            .clone();

        let (tip_tx_str, jito_tip_lamports, tip_fee) = self
            .trader
            .build_tip_transaction(&user_pk)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let tip_tx = BuiltTransaction {
            id: "jito-tip".to_string(),
            transaction_base58: tip_tx_str,
        };

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

                let id = transaction.id.clone();
                let tx_res = trader
                    .create_transactions(&transaction.user_pk, quote, &block_hash)
                    .await
                    .map_err(|e| Status::internal(e.to_string()));

                tx_res.map(|(swap_tx_str, swap_fee, mut delta)| {
                    delta.id = id.clone();
                    let built_tx = BuiltTransaction {
                        id,
                        transaction_base58: swap_tx_str,
                    };
                    (built_tx, swap_fee, delta)
                })
            }));
        }
        let results = join_all(tasks).await;

        let mut all_transactions = vec![];
        let mut all_deltas = Vec::new();
        let mut total_swap_fees: u64 = 0;

        for result in results {
            match result {
                Ok(Ok((built_tx, swap_fee, delta))) => {
                    all_transactions.push(built_tx);
                    total_swap_fees += swap_fee;
                    all_deltas.push(delta);
                }

                Ok(Err(e)) => {
                    tracing::error!("A task panicked: {:?}", e);
                    return Err(Status::internal(
                        "A critical error occurred while processing transactions.",
                    ));
                }

                Err(e) => {
                    tracing::error!("A task panicked: {:?}", e);
                    return Err(Status::internal(
                        "A critical error occurred while processing transactions.",
                    ));
                }
            }
        }

        all_transactions.push(tip_tx);

        let total_network_fee = tip_fee + total_swap_fees;

        Ok(Response::new(TransactionsToSign {
            transactions: all_transactions,
            delta: Some(BundleDelta {
                swaps: all_deltas,
                jito_tip_lamports,
                total_network_fee_lamports: total_network_fee,
            }),
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

pub async fn service_jupiter_status(reporter: HealthReporter, api_key: String) {
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert("Accept", "application/json".parse().unwrap());
    headers.insert(
        "x-api-key",
        reqwest::header::HeaderValue::from_str(&api_key).unwrap(),
    );
    let http_client = reqwest::Client::builder()
        .default_headers(headers)
        .build()
        .unwrap();
    let mut interval = tokio::time::interval(std::time::Duration::from_secs(
        constant::GRPC_HEALTH_CHECK_INTERVAL,
    ));
    let params = [("ids", "So11111111111111111111111111111111111111112")];
    loop {
        interval.tick().await;
        let response = http_client
            .get("https://api.jup.ag/price/v3")
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
