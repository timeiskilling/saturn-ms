use std::sync::Arc;

use axum::{Json, Router, extract::State, response::IntoResponse, routing::get};
use reqwest::StatusCode;
use serde_json::json;

use crate::bundle_manager::bundle_tracker_api::{
    main_api::BundleTracker, saturn_tracker::tracker::SaturnBundleTracker,
};

pub async fn start_health_server(tracker: Arc<SaturnBundleTracker>, port: u16) {
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/metrics", get(metrics_handler))
        .with_state(tracker);

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Health server listening on {}", addr);

    if let Err(e) = axum::serve(listener, app).await {
        tracing::error!("Health server failed: {}", e);
    }
}

async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

async fn metrics_handler(State(tracker): State<Arc<SaturnBundleTracker>>) -> impl IntoResponse {
    let metrics = tracker.get_metrics();
    Json(json!(metrics))
}
