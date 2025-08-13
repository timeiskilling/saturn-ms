use futures::stream::StreamExt;
use std::pin::Pin;
use std::sync::Arc;

use crate::{bundle_manager::client, trader::JupiterTrader};
use proto_models::grpc::bundle_service_server::BundleService;
use proto_models::grpc::{SignedTransactions, TransactionsToSign, TrasnactionInstruction};
use tokio_stream::{Stream, wrappers::BroadcastStream};
use tonic::{Request, Response, Status};
pub struct TransactionService {
    pub trader: Arc<JupiterTrader>,
}

#[tonic::async_trait]
impl BundleService for TransactionService {
    async fn create_transactions(
        &self,
        request: Request<TrasnactionInstruction>,
    ) -> Result<Response<TransactionsToSign>, Status> {
        let trader = self.trader.clone();
        let request_clone = request.into_inner().clone();
        tracing::info!("Starting tokio task to create transactions");

        let transactions = tokio::spawn(async move {
            let options = request_clone.options.unwrap();

            let quote = trader
                .get_quote_with_options(
                    &request_clone.input_mint,
                    &request_clone.output_mint,
                    request_clone.amount,
                    request_clone.slippage_bps as u16,
                    options.into(),
                )
                .await
                .unwrap();

            let transaction = match trader
                .create_transactions(&request_clone.user_pk, quote)
                .await
            {
                Ok(account) => account,
                Err(e) => {
                    tracing::error!("Failed to get Jito tip account: {:?}", e);
                    // Повертаємо гарну gRPC помилку клієнту!
                    return Err(Status::internal(
                        "Internal service error: could not fetch Jito tip account.",
                    ));
                }
            };

            Ok(transaction)
        })
        .await;
        match transactions {
            Ok(Ok(transactions)) => {
                return Ok(Response::new(TransactionsToSign { transactions }))
            }

            Ok(Err(transaction)) => {
                return Err(transaction);
            }
                
            Err(_err) => {
                tracing::error!("Error in tokio task to create transactions");
                return Err(Status::data_loss("Loss data"));
            }
        };
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
        let continiue = self
            .trader
            .send_transactions(transactions.transactions, &transactions.user_pk)
            .await
            .unwrap();

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

impl From<client::UserBundleUpdate> for proto_models::grpc::UserBundleUpdate {
    fn from(internal: client::UserBundleUpdate) -> Self {
        proto_models::grpc::UserBundleUpdate {
            bundle_id: internal.bundle_id,
            old_status: internal.old_status,
            new_status: internal.new_status as i32,
            timestamp: internal.timestamp,
            slot: internal.slot,
        }
    }
}
