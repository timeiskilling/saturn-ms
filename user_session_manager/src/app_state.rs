use deadpool_redis::Runtime;
use deadpool_redis::sentinel::{Manager, Pool};
use redis::{RedisError, RedisResult};
use sqlx::PgPool;
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use std::str::FromStr;

pub struct AppState {
    // sentinel_client: Arc<Mutex<SentinelClient>>,
    // batch_semaphore: Arc<Semaphore>,
    redis_pool: Pool,
    db_pool: PgPool,
    pub worker_info: String,
}

impl AppState {
    pub async fn new(worker_info: String, config: &config::Config) -> RedisResult<Self> {
        let manager = Manager::new(
            config.user_manager_sentinel_urls.clone(),
            config.user_manager_sentinel_master_name.clone(),
            None,
            deadpool_redis::sentinel::SentinelServerType::Master,
        )?;

        let pool = Pool::builder(manager)
            .runtime(Runtime::Tokio1)
            .build()
            .expect("Failed to create Redis Sentinel pool");

        let opts = PgConnectOptions::from_str(&config.postgres_url())
            .map_err(|e| RedisError::from((redis::ErrorKind::Io, "Config error", e.to_string())))?
            .options([("lc_messages", "C"), ("client_encoding", "UTF8")]);

        let db_pool = PgPoolOptions::new()
            .max_connections(config.postgres_connection_pool)
            .connect_with(opts)
            .await
            .map_err(|e| RedisError::from((redis::ErrorKind::Io, "Pool error", e.to_string())))?;

        tracing::info!("Running database migrations...");
        sqlx::migrate!("./migrations")
            .run(&db_pool)
            .await
            .expect("Failed to run database migrations!");

        Ok(Self {
            redis_pool: pool,
            db_pool,
            worker_info,
        })
    }

    pub fn redis_pool(&self) -> &deadpool_redis::sentinel::Pool {
        &self.redis_pool
    }

    pub fn db(&self) -> &PgPool {
        &self.db_pool
    }
}
