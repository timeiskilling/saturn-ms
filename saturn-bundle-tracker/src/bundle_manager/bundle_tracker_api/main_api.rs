use common::bundle_stage_api::{BundleStage, BundleStatusUpdate};
use redis::{RedisError, RedisResult};
use std::collections::HashMap;
use tokio::time::Duration;

pub trait BundleTracker: Send + Sync {
    fn get_redis_connection(
        &self,
    ) -> impl std::future::Future<Output = Result<deadpool_redis::sentinel::Connection, RedisError>> + Send;
    fn add_bundles(
        &self,
        bundle_ids: Vec<String>,
    ) -> impl std::future::Future<Output = RedisResult<()>> + Send;
    fn start_tracking(&self) -> impl Future<Output = RedisResult<()>>;
    fn process_inflight_stage(&self) -> impl Future<Output = ()>;
    fn process_landed_stage(&self) -> impl Future<Output = ()>;
    fn get_bundles_by_stage(
        &self,
        stage: BundleStage,
        min_age: Duration,
    ) -> impl Future<Output = RedisResult<Vec<BundleStatusUpdate>>>;

    fn check_inflight_statuses(&self, bundle_ids: Vec<String>) -> impl Future<Output = ()>;
    fn process_inflight_chunk(
        &self,
        bundle_ids: Vec<String>,
    ) -> impl Future<Output = RedisResult<()>>;
    fn check_landed_statuses(&self, bundle_ids: Vec<String>) -> impl Future<Output = ()>;
    fn process_landed_chunk(
        &self,
        bundle_ids: Vec<String>,
    ) -> impl Future<Output = RedisResult<()>>;
    fn get_current_version_safely(&self, bundle_id: &str)
    -> impl Future<Output = RedisResult<u64>>;
    fn update_bundle_status(
        &self,
        bundle_id: &str,
        new_status: &str,
        new_stage: BundleStage,
        slot: Option<u64>,
    ) -> impl Future<Output = RedisResult<()>>;

    fn cleanup_completed_bundles(&self) -> impl Future<Output = RedisResult<()>>;
    fn get_metrics(&self) -> HashMap<String, u64>;
}
