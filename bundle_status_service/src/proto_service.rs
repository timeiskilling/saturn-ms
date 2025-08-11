use futures::stream::StreamExt;
use jupiter_trader_data::models::jupiter_models::SwapMode;
use std::pin::Pin;
use std::sync::Arc;

use proto_models::grpc::bundle_service_server::BundleService;
use tonic::{Request, Response, Status};

use tokio_stream::Stream;

use crate::trader::JupiterTrader;
use proto_models::grpc::{SignedTransactions, TransactionsToSign, TrasnactionInstruction};

struct TransactionService {
    trader: Arc<JupiterTrader>,
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

            trader.create_transactions(&request_clone.user_pk, quote).await.unwrap()
        }).await;


        match transactions {
            Ok(transactions) => return Ok(Response::new(TransactionsToSign { transactions })),
            Err(err) => {
                tracing::error!("Error in tokio task to create transactions");
                return Err(Status::data_loss("Loss data"));
            },
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
        unimplemented!()
    }
}
