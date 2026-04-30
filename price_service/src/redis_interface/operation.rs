use crate::deserialization::simd_operation::{CombinedStreamEvent, parse_combined_ticker};
use redis::AsyncCommands;
use saturn_errors::error::{PriceRedisError, PriceServiceError};
use tokio::sync::mpsc::Receiver;

pub fn spawn_redis_price_worker(
    mut redis_worker_conn: redis::aio::MultiplexedConnection,
    mut event: Receiver<Vec<u8>>,
) {
    tokio::spawn(async move {
        while let Some(mut payload) = event.recv().await {
            if let Some(CombinedStreamEvent { data }) = parse_combined_ticker(&mut payload) {
                let redis_key = format!("binance:{}", data.symbol);
                let result: Result<(), _> = redis_worker_conn
                    .hset_multiple(
                        &redis_key,
                        &[
                            ("current_price", data.current_price),
                            ("price_change", data.price_change),
                            ("percent", data.price_change_percent),
                        ],
                    )
                    .await;

                let json_msg = format!(
                    r#"{{"s":"{}","c":"{}","p":"{}","P":"{}"}}"#,
                    data.symbol, data.current_price, data.price_change, data.price_change_percent
                );

                let _: Result<(), _> = redis_worker_conn.publish(&redis_key, json_msg).await;

                if let Err(e) = result {
                    let custom_err = PriceServiceError::Redis(PriceRedisError::HsetFailed {
                        symbol: data.symbol.to_string(),
                        reason: e.to_string(),
                    });

                    tracing::error!(%custom_err, symbol = %data.symbol, "was unsuccessful write to Redis");
                }
            }
        }
    });
}
