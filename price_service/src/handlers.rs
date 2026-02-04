use std::sync::Arc;

use axum::{
    extract::{State, WebSocketUpgrade},
    response::IntoResponse,
};

use crate::{PriceManager, handle_websocket};

pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<PriceManager>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_websocket(socket, state))
}
