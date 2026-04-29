use proto_models::grpc::bundle_service_server::{BundleService, BundleServiceServer};
use proto_models::grpc::{
    BuiltTransaction, BundleDelta, SignedTransactions, SimulateBundleRequest, TransactionDelta,
    TransactionsBuld, TransactionsToSign, UserBundleRequest, UserBundleUpdate,
};
use solana_sdk::instruction::{AccountMeta, Instruction};
use solana_sdk::message::{Message, VersionedMessage};
use solana_sdk::pubkey::Pubkey;
use solana_sdk::transaction::VersionedTransaction;
use std::pin::Pin;
use std::str::FromStr;
use tokio::sync::mpsc;
use tokio_stream::{Stream, wrappers::ReceiverStream};
use tonic::service::LayerExt;
use tonic::{Request, Response, Status, transport::Server};

pub struct MockTransactionService;

#[tonic::async_trait]
impl BundleService for MockTransactionService {
    type SubscribeToBundlesStream =
        Pin<Box<dyn Stream<Item = Result<UserBundleUpdate, Status>> + Send + 'static>>;

    type SendTransactionsStream =
        Pin<Box<dyn Stream<Item = Result<UserBundleUpdate, Status>> + Send + 'static>>;

    async fn simulate_bundle(
        &self,
        request: Request<SimulateBundleRequest>,
    ) -> Result<Response<BundleDelta>, Status> {
        let req = request.into_inner();
        let mut swaps = vec![];

        for swap in req.swaps {
            swaps.push(TransactionDelta {
                input_mint: swap.input_mint,
                input_amount: swap.input_amount,
                output_mint: swap.output_mint,
                expected_output: swap.expected_output,
                minimum_output: (swap.expected_output as f64 * 0.99) as u64,
                jito_tip_lamports: 10000,
                network_fee_lamports: 5000,
                platform_fee_bps: 10,
                id: swap.id,
            });
        }

        Ok(Response::new(BundleDelta {
            swaps,
            jito_tip_lamports: 10000,
            total_network_fee_lamports: 5000,
        }))
    }

    async fn create_transactions(
        &self,
        request: Request<TransactionsBuld>,
    ) -> Result<Response<TransactionsToSign>, Status> {
        let req = request.into_inner();
        let mut transactions = vec![];

        let user_pk = req
            .transactions
            .first()
            .map(|t| t.user_pk.clone())
            .unwrap_or_default();

        let pubkey = Pubkey::from_str(&user_pk).unwrap_or_else(|_| Pubkey::new_unique());

        for tx_req in req.transactions {
            // Mock a valid base58 solana transaction (simple transfer)
            let ix = Instruction::new_with_bincode(
                Pubkey::new_unique(),
                &[0; 4],
                vec![AccountMeta::new(pubkey, true)],
            );
            let mut message = Message::new(&[ix], Some(&pubkey));
            message.recent_blockhash = solana_sdk::hash::Hash::new_from_array([0; 32]);

            let tx = VersionedTransaction {
                signatures: vec![solana_sdk::signature::Signature::default()],
                message: VersionedMessage::Legacy(message),
            };

            let encoded = bs58::encode(bincode::serialize(&tx).unwrap()).into_string();

            transactions.push(BuiltTransaction {
                id: tx_req.id.clone(),
                transaction_base58: encoded,
            });
        }

        // Mock Jito Tip tx
        let tip_instruction = Instruction::new_with_bincode(
            Pubkey::new_unique(),
            &[0; 4],
            vec![AccountMeta::new(pubkey, true)],
        );
        let mut tip_message = Message::new(&[tip_instruction], Some(&pubkey));
        tip_message.recent_blockhash = solana_sdk::hash::Hash::new_from_array([0; 32]);

        let tip_tx = VersionedTransaction {
            signatures: vec![solana_sdk::signature::Signature::default()],
            message: VersionedMessage::Legacy(tip_message),
        };

        let tip_encoded = bs58::encode(bincode::serialize(&tip_tx).unwrap()).into_string();

        transactions.push(BuiltTransaction {
            id: "jito-tip".to_string(),
            transaction_base58: tip_encoded,
        });

        Ok(Response::new(TransactionsToSign { transactions }))
    }

    async fn send_transactions(
        &self,
        _request: Request<SignedTransactions>,
    ) -> Result<Response<Self::SendTransactionsStream>, Status> {
        let (tx, rx) = mpsc::channel(10);
        let bundle_id = Pubkey::new_unique().to_string();

        tokio::spawn(async move {
            let stages = vec![
                (1, "Submitted"),
                (2, "In Flight"),
                (3, "Landed"),
                (4, "Confirmed"),
                (5, "Finalized"),
            ];

            for (stage, old_status) in stages {
                tokio::time::sleep(std::time::Duration::from_millis(1500)).await;
                let update = UserBundleUpdate {
                    bundle_id: bundle_id.clone(),
                    old_status: old_status.to_string(),
                    new_status: stage,
                    timestamp: 0,
                    slot: Some(100000),
                };
                if tx.send(Ok(update)).await.is_err() {
                    break;
                }
            }
        });

        Ok(Response::new(Box::pin(ReceiverStream::new(rx))))
    }

    async fn subscribe_to_bundles(
        &self,
        _request: Request<UserBundleRequest>,
    ) -> Result<Response<Self::SubscribeToBundlesStream>, Status> {
        let (_, rx) = mpsc::channel(1);
        Ok(Response::new(Box::pin(ReceiverStream::new(rx))))
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    let addr = "127.0.0.1:3000".parse().unwrap();
    tracing::info!("Mock BundleStatusService listening on {}", addr);

    let transaction_serve = tower::ServiceBuilder::new()
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_headers(tower_http::cors::Any)
                .allow_methods(tower_http::cors::Any),
        )
        .layer(tonic_web::GrpcWebLayer::new())
        .into_inner()
        .named_layer(BundleServiceServer::new(MockTransactionService));

    Server::builder()
        .accept_http1(true)
        .add_service(transaction_serve)
        .serve(addr)
        .await?;

    Ok(())
}
