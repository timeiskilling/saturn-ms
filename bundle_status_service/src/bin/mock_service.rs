use futures::StreamExt;
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
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::broadcast;
use tokio_stream::{Stream, wrappers::BroadcastStream};
use tonic::service::LayerExt;
use tonic::{Request, Response, Status, transport::Server};

pub struct MockTransactionService {
    update_sender: broadcast::Sender<UserBundleUpdate>,
}

impl MockTransactionService {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(1024);
        Self { update_sender: tx }
    }
}

impl Default for MockTransactionService {
    fn default() -> Self {
        let (tx, _) = broadcast::channel(1024);
        Self { update_sender: tx }
    }
}

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
        let swaps = req
            .swaps
            .into_iter()
            .map(|swap| TransactionDelta {
                input_mint: swap.input_mint,
                input_amount: swap.input_amount,
                output_mint: swap.output_mint,
                expected_output: swap.expected_output,
                minimum_output: (swap.expected_output as f64 * 0.99) as u64,
                jito_tip_lamports: 10000,
                network_fee_lamports: 5000,
                platform_fee_bps: 10,
                id: swap.id,
            })
            .collect();

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
        let mut transactions = Vec::with_capacity(req.transactions.len() + 1);

        let user_pk = req
            .transactions
            .first()
            .map(|t| t.user_pk.clone())
            .unwrap_or_default();

        let pubkey = Pubkey::from_str(&user_pk).unwrap_or_else(|_| Pubkey::new_unique());
        let recent_blockhash = solana_sdk::hash::Hash::new_from_array([0; 32]);

        for tx_req in req.transactions {
            let ix = Instruction::new_with_bincode(
                Pubkey::new_unique(),
                &[0; 4],
                vec![AccountMeta::new(pubkey, true)],
            );
            let mut message = Message::new(&[ix], Some(&pubkey));
            message.recent_blockhash = recent_blockhash;

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

        let tip_instruction = Instruction::new_with_bincode(
            Pubkey::new_unique(),
            &[0; 4],
            vec![AccountMeta::new(pubkey, true)],
        );
        let mut tip_message = Message::new(&[tip_instruction], Some(&pubkey));
        tip_message.recent_blockhash = recent_blockhash;

        let tip_tx = VersionedTransaction {
            signatures: vec![solana_sdk::signature::Signature::default()],
            message: VersionedMessage::Legacy(tip_message),
        };

        transactions.push(BuiltTransaction {
            id: "jito-tip".to_string(),
            transaction_base58: bs58::encode(bincode::serialize(&tip_tx).unwrap()).into_string(),
        });

        Ok(Response::new(TransactionsToSign { transactions }))
    }

    async fn send_transactions(
        &self,
        request: Request<SignedTransactions>,
    ) -> Result<Response<Self::SendTransactionsStream>, Status> {
        let _req = request.into_inner();
        let bundle_id = Pubkey::new_unique().to_string();

        let bundle_id_for_task = bundle_id.clone();
        let tx = self.update_sender.clone();
        let rx = self.update_sender.subscribe();

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

                let timestamp = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs();

                let update = UserBundleUpdate {
                    bundle_id: bundle_id_for_task.clone(),
                    old_status: old_status.to_string(),
                    new_status: stage,
                    timestamp,
                    slot: Some(1000),
                };

                let _ = tx.send(update);
            }
        });

        let target_bundle = bundle_id;
        let stream = BroadcastStream::new(rx).filter_map(move |res| {
            let b_id = target_bundle.clone();
            async move {
                match res {
                    Ok(update) if update.bundle_id == b_id => Some(Ok(update)),
                    Ok(_) => None,
                    Err(e) => {
                        tracing::warn!("Stream lagged: {}", e);
                        Some(Err(Status::internal("Stream lagged due to slow client")))
                    }
                }
            }
        });

        Ok(Response::new(Box::pin(stream)))
    }

    async fn subscribe_to_bundles(
        &self,
        request: Request<UserBundleRequest>,
    ) -> Result<Response<Self::SubscribeToBundlesStream>, Status> {
        let req = request.into_inner();
        let target_bundle_id = req.bundle_id.clone();

        let rx = self.update_sender.subscribe();

        let stream = BroadcastStream::new(rx).filter_map(move |res| {
            let filter_id = target_bundle_id.clone();
            async move {
                match res {
                    Ok(update) => {
                        // Якщо клієнт вказав bundle_id, фільтруємо по ньому.
                        // Якщо ні - відправляємо всі (або можна додати фільтр по user_pk, якщо він є у структурі Update)
                        let should_emit = match &filter_id {
                            Some(id) if !id.is_empty() => update.bundle_id == *id,
                            _ => true,
                        };

                        if should_emit { Some(Ok(update)) } else { None }
                    }
                    Err(e) => {
                        tracing::warn!("Subscriber stream lagged: {}", e);
                        Some(Err(Status::internal("Stream lagged")))
                    }
                }
            }
        });

        Ok(Response::new(Box::pin(stream)))
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    // Слухаємо на всіх інтерфейсах для доступу ззовні (VPS)
    let addr = "0.0.0.0:3000".parse().unwrap();
    tracing::info!("Mock BundleStatusService listening on {}", addr);

    let mock_service = MockTransactionService::new();

    let transaction_serve = tower::ServiceBuilder::new()
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_headers(tower_http::cors::Any)
                .allow_methods(tower_http::cors::Any),
        )
        .layer(tonic_web::GrpcWebLayer::new())
        .into_inner()
        .named_layer(BundleServiceServer::new(mock_service));

    Server::builder()
        .accept_http1(true)
        .timeout(std::time::Duration::from_secs(30))
        .concurrency_limit_per_connection(50)
        .http2_keepalive_interval(Some(std::time::Duration::from_secs(15)))
        .http2_keepalive_timeout(Some(std::time::Duration::from_secs(5)))
        .add_service(transaction_serve)
        .serve(addr)
        .await?;

    Ok(())
}
