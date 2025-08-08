use config::Config;
use redis::aio::MultiplexedConnection;

pub async fn redis_conn(config : &Config) -> MultiplexedConnection {
    match redis::Client::open(config.redis_url()) {
        Ok(redis) => match redis.get_multiplexed_tokio_connection().await {
            Ok(conn) => {
                tracing::info!("connect to redis");
                conn
            },
            Err(e) => {
                tracing::error!("Cloud not connect to redis {}",e);
                std::process::exit(1);
            },
        },
        Err(e) => {
            tracing::error!("Cloud not open redis {}", e);
            std::process::exit(1);
        },
    }
}