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
    BuiltTransaction, BundleDelta, SignedTransactions, SimulateBundleRequest, TransactionsBuld,
    TransactionsToSign, UserBundleRequest,
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
    type SubscribeToBundlesStream = Pin<
        Box<
            dyn Stream<Item = Result<proto_models::grpc::UserBundleUpdate, Status>>
                + Send
                + 'static,
        >,
    >;

    type SendTransactionsStream = Pin<
        Box<
            dyn Stream<Item = Result<proto_models::grpc::UserBundleUpdate, Status>>
                + Send
                + 'static,
        >,
    >;

    async fn simulate_bundle(
        &self,
        request: Request<SimulateBundleRequest>,
    ) -> Result<Response<BundleDelta>, Status> {
        let req = request.into_inner();
        let delta = self
            .trader
            .simulate_bundle(req.swaps)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(delta))
    }

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

        let blockhash = self.cashed_blockhash.get().await.blockhash;

        let tip_tx_str = self
            .trader
            .build_tip_transaction(&user_pk, blockhash)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let tip_tx = BuiltTransaction {
            id: "jito-tip".to_string(),
            transaction_base58: tip_tx_str,
        };

        for transaction in transactions_req {
            let trader = self.trader.clone();
            let semaphore = self.rpc_semaphore.clone();

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
                let id = transaction.id.clone();

                let tx_res = trader
                    .create_transactions(
                        &transaction.user_pk,
                        jupiter_trader_data::models::jupiter_models::SwapRequestParams {
                            input_mint: &transaction.input_mint,
                            output_mint: &transaction.output_mint,
                            amount: transaction.amount,
                            slippage_bps: transaction.slippage_bps as u16,
                            options: options.into(),
                        },
                    )
                    .await
                    .map_err(|e| Status::internal(e.to_string()));

                tx_res.map(|swap_tx_str| BuiltTransaction {
                    id,
                    transaction_base58: swap_tx_str,
                })
            }));
        }
        let results = join_all(tasks).await;

        let mut all_transactions = vec![];

        for result in results {
            match result {
                Ok(Ok(built_tx)) => {
                    all_transactions.push(built_tx);
                }
                Ok(Err(e)) => {
                    tracing::error!("A task failed: {:?}", e);
                    return Err(Status::internal(e.to_string()));
                }
                Err(e) => {
                    tracing::error!("A task panicked: {:?}", e);
                    return Err(Status::internal("Critical task panic"));
                }
            }
        }

        all_transactions.push(tip_tx);

        Ok(Response::new(TransactionsToSign {
            transactions: all_transactions,
        }))
    }

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

        let user_id = transactions.user_pk.clone();
        let not_sys = self.trader.get_notification_system();

        // Fetch current statuses for the user's active bundles
        let initial_updates = not_sys
            .get_active_bundle_updates(&user_id)
            .await
            .unwrap_or_default();

        let initial_stream = tokio_stream::iter(initial_updates.into_iter().map(|u| Ok(u.into())));

        let rx = not_sys.subscribe_to_user_stream(user_id.clone());
        let user_id_for_stream = user_id.clone();
        let not_sys_clone = not_sys.clone();

        let broadcast_stream = BroadcastStream::new(rx).filter_map(move |result_from_broadcast| {
            let notification_system = not_sys_clone.clone();
            let user_id = user_id_for_stream.clone();

            async move {
                let active_bundles = match notification_system.get_user_bundles(&user_id).await {
                    Ok(bundles) => bundles,
                    Err(e) => {
                        tracing::error!(
                            "Failed to get user bundles from Redis for user {}: {}",
                            user_id,
                            e
                        );
                        vec![]
                    }
                };

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

        let stream = initial_stream.chain(broadcast_stream);
        let response_stream: Self::SendTransactionsStream = Box::pin(stream);

        Ok(Response::new(response_stream))
    }

    async fn subscribe_to_bundles(
        &self,
        request: Request<UserBundleRequest>,
    ) -> Result<Response<Self::SubscribeToBundlesStream>, Status> {
        let req = request.into_inner();
        let user_id = req.user_pk.clone();
        let target_bundle_id = req.bundle_id.clone();

        let not_sys = self.trader.get_notification_system();

        // Fetch current statuses for the user's active bundles
        let initial_updates = not_sys
            .get_active_bundle_updates(&user_id)
            .await
            .unwrap_or_default();

        let filter_id = target_bundle_id.clone();
        let initial_stream = tokio_stream::iter(
            initial_updates
                .into_iter()
                .filter(move |u| match &filter_id {
                    Some(id) if !id.is_empty() => u.bundle_id == *id,
                    _ => true,
                })
                .map(|u| Ok(u.into())),
        );

        let rx = not_sys.subscribe_to_user_stream(user_id.clone());
        let user_id_for_stream = user_id.clone();
        let not_sys_clone = not_sys.clone();

        let broadcast_stream = BroadcastStream::new(rx).filter_map(move |result_from_broadcast| {
            let notification_system = not_sys_clone.clone();
            let user_id = user_id_for_stream.clone();
            let filter_bundle_id = target_bundle_id.clone();

            async move {
                match result_from_broadcast {
                    Ok(internal_update) => {
                        let is_final_state = matches!(
                            internal_update.new_status,
                            common::bundle_stage_api::BundleStage::Finalized
                                | common::bundle_stage_api::BundleStage::Failed
                        );

                        if is_final_state {
                            match notification_system.get_user_bundles(&user_id).await {
                                Ok(bundles) => {
                                    if bundles.is_empty()
                                        || (bundles.len() == 1
                                            && bundles.contains(&internal_update.bundle_id))
                                    {
                                        tracing::info!(
                                            "User {} has no more active bundles.",
                                            user_id
                                        );
                                    }
                                }
                                Err(e) => {
                                    tracing::error!(
                                        "Failed to get user bundles from Redis for user {}: {}",
                                        user_id,
                                        e
                                    );
                                }
                            }
                        }

                        let should_emit = match &filter_bundle_id {
                            Some(id) if !id.is_empty() => internal_update.bundle_id == *id,
                            _ => true,
                        };

                        if should_emit {
                            Some(Ok(internal_update.into()))
                        } else {
                            None
                        }
                    }
                    Err(e) => {
                        tracing::error!("Stream for user {} lagged: {}", user_id, e);
                        Some(Err(Status::internal("Internal stream error")))
                    }
                }
            }
        });

        let stream = initial_stream.chain(broadcast_stream);
        let response_stream: Self::SubscribeToBundlesStream = Box::pin(stream);

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
