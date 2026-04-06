use tokio::time::Duration;

#[derive(Debug, Clone)]
pub struct StateConfig {
    pub max_concurrent_batches: usize,
    pub redis_pool_size: usize,
    pub completion_ttl: Duration,
    pub use_pipeline: bool,
    pub use_lua_scripts: bool,
}

impl Default for StateConfig {
    fn default() -> Self {
        Self {
            max_concurrent_batches: 10,
            redis_pool_size: 10,
            completion_ttl: Duration::from_secs(30),
            use_pipeline: true,
            use_lua_scripts: true,
        }
    }
}
