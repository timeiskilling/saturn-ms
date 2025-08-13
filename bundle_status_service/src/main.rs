use std::sync::Arc;

use proto_models::grpc::bundle_service_server::BundleServiceServer;
use tonic::{service::LayerExt, transport::Server};

use crate::{proto_service::TransactionService, trader::JupiterTrader};

pub mod bundle_manager;
pub mod constant;
pub mod proto_service;
pub mod redis_con;
pub mod trader;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let addr = "127.0.0.1:3000".parse().unwrap();
    let redis_url = vec![
        "redis://localhost:6379".to_string(),
        "redis://localhost:6380".to_string(),
    ];
    let trader = Arc::new(JupiterTrader::new("https://api.mainnet-beta.solana.com", redis_url).await);
    let trader_clone = trader.clone();

    tokio::spawn(async move {
        trader_clone.jito_tip_listener().await;
    });
    let transaction_serve = TransactionService { trader };

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
