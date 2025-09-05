use std::sync::Arc;

use crate::{
    proto_service::{TransactionService, service_jupiter_status},
    trader::JupiterTrader,
};
use axum::{Router, routing::get};
use proto_models::grpc::bundle_service_server::BundleServiceServer;
use solana_client::nonblocking::rpc_client::RpcClient;
use tokio::sync::Semaphore;
use tonic::transport::Server;
use tracing_subscriber::fmt::format::FmtSpan;

pub mod blockhash_data;
pub mod bundle_manager;
pub mod constant;
mod custom_builder;
pub mod proto_service;
pub mod redis_con;
pub mod test;
pub mod trader;

const SEMAPHORE_PERMITS: usize = 5;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();

    let http_addr: std::net::SocketAddr = "127.0.0.1:3001".parse().unwrap();
    let grpc_addr: std::net::SocketAddr = "127.0.0.1:3000".parse().unwrap();
    
    let redis_url = vec![
        "redis://localhost:6379".to_string(),
        "redis://localhost:6380".to_string(),
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

    let (health_reporter, health_service) = tonic_health::server::health_reporter();
    health_reporter
        .set_serving::<BundleServiceServer<TransactionService>>()
        .await;

    tokio::spawn(service_jupiter_status(health_reporter.clone()));

    let http_service = Router::new()
        .route("/", get(|| async { "Hello from Axum REST" }))
        .route("/health", get(|| async { "OK" }))
        .route("/metrics", get(|| async { "Metrics endpoint" }))
        .route("/grpc-health", get(|| async { "gRPC server running on :3001" }));

    let http_server = tokio::spawn(async move {
        let listener = tokio::net::TcpListener::bind(http_addr).await.unwrap();
        axum::serve(listener, http_service).await.unwrap();
    });
    
    let grpc_server = tokio::spawn(async move {
        
        Server::builder()
            .add_service(health_service)
            .add_service(BundleServiceServer::new(transaction_serve))
            .serve(grpc_addr)
            .await
            .unwrap();
    });

    println!("   HTTP API: http://{http_addr}");
    println!("   gRPC API: http://{grpc_addr}");

    tokio::select! {
        result = http_server => {
            if let Err(e) = result {
                eprintln!("HTTP server error: {e}");
            }
        }
        result = grpc_server => {
            if let Err(e) = result {
                eprintln!("gRPC server error: {e}");
            }
        }
    }

    Ok(())
}