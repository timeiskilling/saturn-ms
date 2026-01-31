use crate::bundle_manager::bundle_tracker_api::bundle_stage_api::*;
use crate::bundle_manager::client::UserBundleUpdate;
use async_trait::async_trait;
use redis::RedisResult;
use std::collections::HashMap;
use tokio::time::Duration;

#[async_trait]
pub trait BundleTracker: Send + Sync {
    fn get_redis_connection(&self) -> redis::aio::MultiplexedConnection;
    async fn store_ownership(&self, bundle_id: &str, user_id: &str);
    async fn add_bundles(&self, bundle_ids: Vec<String>, user_id: String) -> RedisResult<()>;
    async fn start_tracking(&self) -> RedisResult<()>;
    async fn process_inflight_stage(&self);
    async fn process_landed_stage(&self);
    async fn get_bundles_by_stage(
        &self,
        stage: BundleStage,
        min_age: Duration,
    ) -> RedisResult<Vec<BundleStatusUpdate>>;

    async fn check_inflight_statuses(&self, bundle_ids: Vec<String>);
    async fn process_inflight_chunk(&self, bundle_ids: Vec<String>) -> RedisResult<()>;
    async fn check_landed_statuses(&self, bundle_ids: Vec<String>);
    async fn process_landed_chunk(&self, bundle_ids: Vec<String>) -> RedisResult<()>;
    async fn get_current_version_safely(&self, bundle_id: &str) -> RedisResult<u64>;
    async fn update_bundle_status(
        &self,
        bundle_id: &str,
        new_status: &str,
        new_stage: BundleStage,
        slot: Option<u64>,
    ) -> RedisResult<()>;

    async fn get_user_bundle_statuses(&self, user_id: &str) -> Vec<UserBundleUpdate>;
    async fn cleanup_completed_bundles(&self) -> RedisResult<()>;
    fn get_metrics(&self) -> HashMap<String, u64>;
}
