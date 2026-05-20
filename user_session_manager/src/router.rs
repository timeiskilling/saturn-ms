use crate::app_state::AppState;
use crate::endpoints::auth_endpoints::disconnect_wallet_handler;
use crate::endpoints::{auth_endpoints, device};
use crate::postgres::query;
use axum::http::{HeaderName, HeaderValue, Method};
use axum::{
    Router,
    routing::{delete, get, post},
};
use std::sync::Arc;
use tower_governor::GovernorLayer;
use tower_governor::governor::GovernorConfigBuilder;
use tower_http::cors::CorsLayer;

pub fn create_router(app_state: Arc<AppState>) -> Router {
    let governor_conf = GovernorConfigBuilder::default()
        .per_second(2)
        .burst_size(10)
        .finish()
        .unwrap();

    // Authentication routes (Rate limiting deferred for MVP)
    let auth_routes = Router::<Arc<AppState>>::new()
        .route("/nonce", get(auth_endpoints::get_nonce))
        .route("/verify", post(auth_endpoints::verify_signature))
        .route("/logout", post(auth_endpoints::logout))
        .route("/account", delete(auth_endpoints::delete_account));

    // Wallet management operations
    let wallet_routes = Router::<Arc<AppState>>::new()
        .route("/promote", post(auth_endpoints::promote_wallet))
        .route("/disconnect", post(disconnect_wallet_handler))
        .route("/unlink", delete(auth_endpoints::verify_unlink))
        .route("/linked", get(query::get_linked_wallets));

    // Connected device management
    let device_routes = Router::<Arc<AppState>>::new()
        .route("/", get(device::connected_devices))
        .route("/{public_id}", delete(device::disconnect_target_device));

    // Combine all routes and inject the application state
    Router::new()
        .nest("/auth", auth_routes)
        .nest("/wallet", wallet_routes)
        .nest("/device", device_routes)
        .route(
            "/bundles",
            post(query::save_user_bundles).get(query::get_user_bundles),
        )
        .layer(GovernorLayer::new(governor_conf))
        .layer(
            CorsLayer::new()
                .allow_origin([
                    "http://localhost:3030".parse::<HeaderValue>().unwrap(),
                    "http://127.0.0.1:3030".parse::<HeaderValue>().unwrap(),
                ])
                .allow_headers([
                    HeaderName::from_static("content-type"),
                    HeaderName::from_static("authorization"),
                ])
                .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::OPTIONS])
                .allow_credentials(true),
        )
        .with_state(app_state)
}
