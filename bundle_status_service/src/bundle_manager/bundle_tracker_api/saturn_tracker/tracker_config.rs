use tokio::time::{Duration, Instant};

use crate::bundle_manager::bundle_tracker_api::bundle_stage_api::BundleStage;


#[derive(Debug, Clone)]
pub struct TrackerConfig {
    pub update_interval: Duration,
    pub batch_size: usize,
    pub max_concurrent_batches: usize,
    pub redis_pool_size: usize,
    pub cleanup_interval: Duration,
    pub completion_ttl: Duration,
    pub use_pipeline: bool,
    pub use_lua_scripts: bool,
    pub inflight_check_interval: Duration,
    pub landed_check_interval: Duration,
}

impl Default for TrackerConfig {
    fn default() -> Self {
        Self {
            update_interval: Duration::from_secs(1),
            batch_size: 100,
            max_concurrent_batches: 10,
            redis_pool_size: 10,
            cleanup_interval: Duration::from_secs(60),
            completion_ttl: Duration::from_secs(120),
            use_pipeline: true,
            use_lua_scripts: true,
            inflight_check_interval: Duration::from_secs(2),
            landed_check_interval: Duration::from_secs(5),
        }
    }
}

#[derive(Debug, Clone)]
pub struct CachedBundle {
    pub bundle_id: String,
    pub status: String,
    pub stage: BundleStage,
    pub last_updated: Instant,
    pub last_checked: Instant,
    pub version: u64,
    pub slot: Option<u64>,
}