use std::sync::Arc;

use proto_models::grpc::bundle_service_server::BundleServiceServer;
use redis::ToRedisArgs;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::pubkey::Pubkey;
use tokio::sync::Semaphore;
use tonic::{service::LayerExt, transport::Server};
use tracing_subscriber::fmt::format::FmtSpan;

use crate::{proto_service::TransactionService, trader::JupiterTrader};

pub mod blockhash_data;
pub mod bundle_manager;
pub mod constant;
pub mod proto_service;
pub mod redis_con;
pub mod trader;

const SEMAPHORE_PERMITS: usize = 5;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();

    let addr = "127.0.0.1:3000".parse().unwrap();
    let redis_url = vec![
        "redis://redis_main:6379".to_string(),
        "redis://redis_jito:6379".to_string(),
    ];
    let trader = Arc::new(
        JupiterTrader::new(
            "https://mainnet.helius-rpc.com/?api-key=bd7b24dd-d644-4612-a486-a5acb8427920",
            redis_url,
        )
        .await,
    );

    let rpc_client = Arc::new(RpcClient::new(
        "https://mainnet.helius-rpc.com/?api-key=bd7b24dd-d644-4612-a486-a5acb8427920".to_string(),
    ));
    let blockhash_cache = blockhash_data::BlockhashCache::new(rpc_client.clone());

    let trader_clone = trader.clone();

    tokio::spawn(async move {
        trader_clone.jito_tip_listener().await;
    });

    let transaction_serve = TransactionService {
        trader,
        rpc_semaphore: Arc::new(Semaphore::new(SEMAPHORE_PERMITS)),
        cashed_blockhash: Arc::new(blockhash_cache),
    };

    let transaction_serve = tower::ServiceBuilder::new()
        .layer(tower_http::cors::CorsLayer::new())
        .layer(tonic_web::GrpcWebLayer::new())
        .into_inner()
        .named_layer(BundleServiceServer::new(transaction_serve));

    println!("GreeterServer listening on {addr}");

    Server::builder()
        .accept_http1(true)
        .add_service(transaction_serve)
        .serve(addr)
        .await?;

    Ok(())
}
