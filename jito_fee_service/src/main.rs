use futures_util::stream::{SplitSink, SplitStream};
use futures_util::{SinkExt, StreamExt};
use redis::AsyncCommands;
use serde::Deserialize;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::net::TcpStream;
use tokio::sync::Mutex;
use tokio_tungstenite::{MaybeTlsStream, WebSocketStream, connect_async, tungstenite::Message};
use tracing::{error, info, warn};

#[derive(Debug, Deserialize)]
pub struct JitoResponse {
    pub landed_tips_99th_percentile: f64,
}
pub const REDIS_KEY: &str = "jito:tip:latest";
pub const VALUE_FIELD: &str = "value";
pub const TIMESTAMP_FIELD: &str = "updated_at_unix";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .with_target(false)
        .init();
    println!("data loader");

    let redis_url =
        std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6380".to_string());
    let client = redis::Client::open(redis_url)?;
    let con = client.get_multiplexed_tokio_connection().await?;
    info!("Successfully connected to Redis");

    let redis_con = Arc::new(Mutex::new(con));

    run_jito_tip_listener(redis_con).await;

    Ok(())
}

async fn run_jito_tip_listener(redis_con: Arc<Mutex<redis::aio::MultiplexedConnection>>) {
    let url = "wss://bundles.jito.wtf/api/v1/bundles/tip_stream";

    loop {
        match connect_async(url).await {
            Ok((ws_stream, _)) => {
                info!("Successfully connected to Jito tip WebSocket");
                let (mut write, mut read) = ws_stream.split();

                handle_messages(&mut read, &mut write, &redis_con).await;

                warn!("Disconnected from Jito WebSocket. Reconnecting in 5 seconds...");
            }
            Err(e) => {
                error!(
                    "Failed to connect to Jito WebSocket: {:?}. Retrying in 5 seconds...",
                    e
                );
            }
        }

        tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
    }
}

async fn handle_messages(
    read: &mut SplitStream<WebSocketStream<MaybeTlsStream<TcpStream>>>,
    write: &mut SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>,
    redis_con: &Arc<Mutex<redis::aio::MultiplexedConnection>>,
) {
    while let Some(msg) = read.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                if let Ok(parsed_data) = serde_json::from_str::<Vec<JitoResponse>>(&text) {
                    if let Some(jito_data) = parsed_data.first() {
                        let tip_value = jito_data.landed_tips_99th_percentile;
                        let timestamp = SystemTime::now()
                            .duration_since(UNIX_EPOCH)
                            .unwrap()
                            .as_secs();

                        let mut con = redis_con.lock().await;

                        let result: Result<(), redis::RedisError> = con
                            .hset_multiple(
                                REDIS_KEY,
                                &[
                                    (VALUE_FIELD, tip_value),
                                    (TIMESTAMP_FIELD, timestamp as f64),
                                ],
                            )
                            .await;

                        if let Err(e) = result {
                            error!("Failed to write to Redis: {}", e);
                        } else {
                            info!("Successfully updated tip in Redis: {}", tip_value);
                        }
                    }
                } else {
                    warn!("Failed to parse JSON from Jito: {}", text);
                }
            }
            Ok(Message::Ping(data)) => {
                if write.send(Message::Pong(data)).await.is_err() {
                    break;
                }
            }
            Err(e) => {
                error!("Error reading from Jito WebSocket: {:?}", e);
                break;
            }
            _ => {}
        }
    }
}
