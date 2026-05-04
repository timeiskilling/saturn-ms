use std::sync::Arc;

use saturn_errors::error::UserServiceError;
use tracing_subscriber::fmt::format::FmtSpan;

use crate::router::create_router;

pub mod app_state;
pub mod auth_manager;
pub mod endpoints;
pub mod hash;
pub mod middleware;
pub mod postgres;
pub mod redis;
pub mod router;

#[tokio::main]
async fn main() -> Result<(), UserServiceError> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();

    let config = config::load();
    let app_state = Arc::new(
        app_state::AppState::new("first_Server".to_string(), &config)
            .await
            .map_err(|e| UserServiceError::RedisError(e.to_string()))?,
    );

    let router = create_router(app_state);
    let addr = config.user_manager_socket_addr();
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    tracing::info!("Starting server on {}", addr);
    axum::serve(
        listener,
        router.into_make_service_with_connect_info::<std::net::SocketAddr>(),
    )
    .await
    .unwrap();

    Ok(())
}
