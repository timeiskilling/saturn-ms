use config::Config;
use redis::aio::MultiplexedConnection;

pub async fn redis_conn(config: &Config) -> MultiplexedConnection {
    tracing::info!("Connecting to redis: {}", config.redis_url());
    match redis::Client::open(config.redis_url()) {
        Ok(redis) => match redis.get_multiplexed_async_connection().await {
            Ok(conn) => {
                tracing::info!("connect to redis");
                conn
            }
            Err(e) => {
                tracing::error!("Cloud not connect to redis {}", e);
                std::process::exit(1);
            }
        },
        Err(e) => {
            tracing::error!("Cloud not open redis {}", e);
            std::process::exit(1);
        }
    }
}

pub async fn jito_tip_redis_conn(config: &Config) -> MultiplexedConnection {
    tracing::info!(
        "Connecting to jito tip redis: {}",
        config.jito_tip_redis_url()
    );
    match redis::Client::open(config.jito_tip_redis_url()) {
        Ok(redis) => match redis.get_multiplexed_async_connection().await {
            Ok(conn) => {
                tracing::info!("connect to redis");
                conn
            }
            Err(e) => {
                tracing::error!("Cloud not connect to redis {}", e);
                std::process::exit(1);
            }
        },
        Err(e) => {
            tracing::error!("Cloud not open redis {}", e);
            std::process::exit(1);
        }
    }
}

pub async fn notification_redis_conn(config: &Config) -> MultiplexedConnection {
    tracing::info!(
        "Connecting to notification redis: {}",
        config.notification_redis_url()
    );
    match redis::Client::open(config.notification_redis_url()) {
        Ok(redis) => match redis.get_multiplexed_async_connection().await {
            Ok(conn) => {
                tracing::info!("connect to redis");
                conn
            }
            Err(e) => {
                tracing::error!("Cloud not connect to redis jito {}", e);
                std::process::exit(1);
            }
        },
        Err(e) => {
            tracing::error!("Cloud not open redis jito {}", e);
            std::process::exit(1);
        }
    }
}

pub async fn atl_redis_conn(config: &Config) -> MultiplexedConnection {
    tracing::info!("Connecting to atl redis: {}", config.alt_redis_url());
    match redis::Client::open(config.alt_redis_url()) {
        Ok(redis) => match redis.get_multiplexed_async_connection().await {
            Ok(conn) => {
                tracing::info!("connect to redis");
                conn
            }
            Err(e) => {
                tracing::error!("Cloud not connect to redis jito {}", e);
                std::process::exit(1);
            }
        },
        Err(e) => {
            tracing::error!("Cloud not open redis jito {}", e);
            std::process::exit(1);
        }
    }
}
