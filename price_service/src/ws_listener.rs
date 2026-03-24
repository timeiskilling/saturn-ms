use futures::{SinkExt, StreamExt};
use tokio::sync::mpsc;
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::redis_interface::operation::spawn_redis_price_worker;

pub async fn run_binance_ws_client(url: String, redis_conn: redis::aio::MultiplexedConnection) {
    loop {
        tracing::info!("Connecting to Binance WebSocket... {}", url);

        match connect_async(&url).await {
            Ok((mut ws_stream, _)) => {
                let (tx, rx) = mpsc::channel::<Vec<u8>>(10_000);

                spawn_redis_price_worker(redis_conn.clone(), rx);

                while let Some(msg) = ws_stream.next().await {
                    if let Ok(msg) = msg {
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
                }
            }
            Err(e) => {
                tracing::error!("Failed to connect to Binance WebSocket: {}", e);
                break;
            }
        }
        tracing::warn!("Binance WebSocket reconnection on 5 seconds");
        tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
    }
}
