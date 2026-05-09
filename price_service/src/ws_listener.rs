use std::sync::Arc;

use futures::{SinkExt, StreamExt};
use tokio::sync::mpsc;
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::{
    build::{AppState, build_ws_url},
    redis_interface::operation::spawn_redis_price_worker,
};

pub async fn run_binance_ws_client(
    state: Arc<AppState>,
    redis_conn: redis::aio::MultiplexedConnection,
) {
    let mut interval = tokio::time::interval(std::time::Duration::from_hours(2) + std::time::Duration::from_secs(15));
    loop {
        let url = match build_ws_url(state.clone()).await {
            Ok(u) => u,
            Err(e) => {
                tracing::error!("Failed to build WS URL: {}. Retrying in 5s...", e);
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
                continue;
            }
        };

        tracing::info!("Connecting to Binance WebSocket... {}", url);

        match connect_async(&url).await {
            Ok((mut ws_stream, _)) => {
                let (tx, rx) = mpsc::channel::<Vec<u8>>(10_000);
                spawn_redis_price_worker(redis_conn.clone(), rx);

                loop {
                    tokio::select! {
                        msg_opt = ws_stream.next() => {
                            match msg_opt {
                                Some(Ok(msg)) => {
                                    match msg {
                                        Message::Binary(data) => {
                                            let _ = tx.try_send(data);
                                        }
                                        Message::Text(text) => {
                                            if let Err(err) = tx.try_send(text.into_bytes()) {
                                                tracing::error!("Failed to send text message: {}", err);
                                            }
                                        }
                                        Message::Ping(ping_data) => {
                                            if let Err(e) = ws_stream.send(Message::Pong(ping_data)).await {
                                                tracing::error!("Failed to send pong: {}", e);
                                                break;
                                            }
                                        }
                                        Message::Close(close_frame) => {
                                            tracing::warn!("Binance closed connection: {:?}", close_frame);
                                            break;
                                        }
                                        _ => {}
                                    }
                                }
                                Some(Err(e)) => {
                                    tracing::error!("WebSocket Error: {}", e);
                                    break;
                                }
                                None => {
                                    tracing::warn!("WebSocket stream ended unexpectedly.");
                                    break;
                                }
                            }
                        }

                        _ = interval.tick() => {
                            tracing::info!("2 hours passed. Reconnecting to WS to update token streams.");
                            break;
                        }
                    }
                }
            }
            Err(e) => {
                tracing::error!("Failed to connect to Binance WebSocket: {}", e);
            }
        }

        tracing::warn!("Binance WebSocket reconnecting in 5 seconds...");
        tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
    }
}
