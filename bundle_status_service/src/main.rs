#![recursion_limit = "256"]
use std::sync::Arc;

use bundle_status_service::prelude::RetryConfig;
use common::jito_client_api::jito_http_manager::JitoHttpManager;
use config::load;
use proto_models::grpc::bundle_service_server::BundleServiceServer;
use solana_client::nonblocking::rpc_client::RpcClient;
use tokio::sync::Semaphore;
use tonic::{service::LayerExt, transport::Server};
use tracing_subscriber::fmt::format::FmtSpan;

use crate::{
    proto_service::{TransactionService, service_jupiter_status},
    reqwest_client::HttpManager,
    trader::JupiterTrader,
};

pub mod blockhash_data;
pub mod bundle_client;
pub mod constant;
pub mod custom_builder;
pub mod msg_wrapper;
pub mod prelude;
pub mod proto_service;
pub mod redis_con;
pub mod reqwest_client;
pub mod test;
pub mod trader;
pub mod transactions_builder;

const SEMAPHORE_PERMITS: usize = 5;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();

    let config = load();
    let helius_api_key = config.helius_url();
    let addr = config.service_socket_addr();
    let notification_redis_url = config.notification_redis_url();

    let jito_manager = Arc::new(JitoHttpManager::new(
        "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1".to_string(),
        50,
        RetryConfig::default(),
        None,
    ));

    let http_client = Arc::new(HttpManager::new(
        "https://api.jup.ag".to_string(),
        50,
        RetryConfig::default(),
        None,
        &config.jupiter_api_key,
    ));

    let trader = Arc::new(
        JupiterTrader::new(
            &helius_api_key.clone(),
            notification_redis_url,
            jito_manager,
            http_client,
        )
        .await,
    );

    let rpc_client = Arc::new(RpcClient::new(helius_api_key));
    let blockhash_cache = blockhash_data::BlockhashCache::new(rpc_client.clone());

    trader.jito_tip_listener();

    let transaction_serve = TransactionService {
        trader,
        rpc_semaphore: Arc::new(Semaphore::new(SEMAPHORE_PERMITS)),
        cashed_blockhash: Arc::new(blockhash_cache),
    };

    let transaction_serve = tower::ServiceBuilder::new()
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_headers(tower_http::cors::Any)
                .allow_methods(tower_http::cors::Any),
        )
        .layer(tonic_web::GrpcWebLayer::new())
        .into_inner()
        .named_layer(BundleServiceServer::new(transaction_serve));

    println!("GreeterServer listening on {addr}");

    let (health_reporter, health_service) = tonic_health::server::health_reporter();
    health_reporter
        .set_serving::<BundleServiceServer<TransactionService>>()
        .await;

    tokio::spawn(service_jupiter_status(
        health_reporter.clone(),
        config.jupiter_api_key.clone(),
    ));

    Server::builder()
        .accept_http1(true)
        .add_service(health_service)
        .add_service(transaction_serve)
        .serve(addr)
        .await?;
    Ok(())
}
