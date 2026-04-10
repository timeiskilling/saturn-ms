use crate::app_state::AppState;
use crate::endpoints::auth_endpoints::disconnect_wallet_handler;
use crate::endpoints::{auth_endpoints, device};
use crate::postgres::query;
use axum::{
    Router,
    routing::{delete, get, post},
};
use std::sync::Arc;
use tower_governor::GovernorLayer;
use tower_governor::governor::GovernorConfigBuilder;

pub fn create_router(app_state: Arc<AppState>) -> Router {
    let governor_conf = GovernorConfigBuilder::default()
        .per_second(1)
        .burst_size(5)
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
        .route("/unlink", post(disconnect_wallet_handler));

    // Connected device management
    let device_routes = Router::<Arc<AppState>>::new()
        .route("/", get(device::connected_devices))
        .route("/{public_id}", delete(device::disconnect_target_device));

    // Persistent User Bundles / State
    let bundle_routes = Router::<Arc<AppState>>::new().route("/", post(query::save_user_bundles));

    // Combine all routes and inject the application state
    Router::new()
        .nest("/auth", auth_routes)
        .nest("/wallet", wallet_routes)
        .nest("/device", device_routes)
        .nest("/bundles", bundle_routes)
        .layer(GovernorLayer::new(governor_conf))
        .with_state(app_state)
}
