use std::sync::Arc;

use config::{load};
use proto_models::grpc::bundle_service_server::BundleServiceServer;
use solana_client::nonblocking::rpc_client::RpcClient;
use tokio::sync::Semaphore;
use tonic::{service::LayerExt, transport::Server};
use tracing_subscriber::fmt::format::FmtSpan;

use crate::{
    proto_service::{TransactionService, service_jupiter_status},
    jito_client_api::{jito_http_manager::JitoHttpManager, reqwest_client::HttpManager, retry_config::RetryConfig},
    trader::JupiterTrader,
};

pub mod blockhash_data;
pub mod bundle_manager;
pub mod constant;
pub mod custom_builder;
pub mod proto_service;
pub mod redis_con;
pub mod test;
pub mod trader;
pub mod jito_client_api;

const SEMAPHORE_PERMITS: usize = 5;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();

    let config = load();
    let helius_api_key = config.helius_api_key.clone();
    let addr = "127.0.0.1:3000".parse().unwrap();
    let redis_url = vec![
        "redis://localhost:6379".to_string(),
        "redis://localhost:6380".to_string(),
    ];

    let jito_manager = Arc::new(JitoHttpManager::new(
        "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1".to_string(),
        50,
        RetryConfig::default(),
        None,
    ));

    let http_client = Arc::new(HttpManager::new("https://api.jup.ag//swap/v1".to_string(), 50, RetryConfig::default(), None,&config.jupiter_api_key));
    let trader = Arc::new(
        JupiterTrader::new(
            &helius_api_key.clone(),
            redis_url,
            jito_manager,
            http_client,
        )
        .await,
    );

    let rpc_client = Arc::new(RpcClient::new(
        helius_api_key,
    ));

    let blockhash_cache = blockhash_data::BlockhashCache::new(rpc_client.clone());

    let trader_clone = trader.clone();

    // let data = send_bundle(trader_clone).await;

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
    let (health_reporter, health_service) = tonic_health::server::health_reporter();
    health_reporter
        .set_serving::<BundleServiceServer<TransactionService>>()
        .await;

    tokio::spawn(service_jupiter_status(health_reporter.clone()));

    Server::builder()
        .accept_http1(true)
        .add_service(health_service)
        .add_service(transaction_serve)
        .serve(addr)
        .await?;

    Ok(())
}
