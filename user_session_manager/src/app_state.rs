use deadpool_redis::Runtime;
use deadpool_redis::sentinel::{Config, Pool};
use redis::{RedisError, RedisResult};
use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;
use tokio::sync::Semaphore;

use crate::state_config::StateConfig;

pub struct AppState {
    // sentinel_client: Arc<Mutex<SentinelClient>>,
    batch_semaphore: Arc<Semaphore>,
    redis_pool: Pool,
    db_pool: PgPool,
    config: StateConfig,
    worker_info: String,
}

impl AppState {
    pub async fn new(
        sentinel_urls: Vec<String>,
        master_name: String,
        worker_info: String,
        state_config: StateConfig,
        db_url: String,
    ) -> RedisResult<Self> {
        let cfg = Config {
            urls: Some(sentinel_urls),
            server_type: deadpool_redis::sentinel::SentinelServerType::Master,
            master_name,
            ..Default::default()
        };
        let pool = cfg
            .create_pool(Some(Runtime::Tokio1))
            .expect("Failed to create Redis Sentinel pool");

        let db_pool = PgPoolOptions::new()
            .max_connections(state_config.redis_pool_size as u32)
            .connect(&db_url)
            .await
            .map_err(|e| RedisError::from((redis::ErrorKind::Io, "Pool error", e.to_string())))?;

        Ok(Self {
            batch_semaphore: Arc::new(Semaphore::new(state_config.max_concurrent_batches)),
            redis_pool: pool,
            db_pool,
            config: state_config,
            worker_info,
        })
    }

    pub async fn get_redis_connection(
        &self,
    ) -> Result<deadpool_redis::sentinel::Connection, RedisError> {
        self.redis_pool
            .get()
            .await
            .map_err(|e| RedisError::from((redis::ErrorKind::Io, "Pool error", e.to_string())))
    }

    pub fn db(&self) -> &PgPool {
        &self.db_pool
    }
}
