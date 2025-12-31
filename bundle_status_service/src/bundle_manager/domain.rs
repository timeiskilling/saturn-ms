use dashmap::DashMap;
use futures::future::try_join_all;
use redis::{AsyncCommands, RedisResult, Script};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::{Mutex, Semaphore};
use tokio::time::{Duration, Instant};
use tracing::{debug, error, info, warn};

use crate::bundle_manager::client::{UserBundleUpdate, UserStreamNotificationSystem};
use crate::revork::jito_http_manager::JitoHttpManager;

#[derive(Debug, Serialize, Deserialize)]
pub struct BundleStatusResponse {
    pub context: Context,
    pub value: Vec<Option<BundleStatus>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Context {
    pub slot: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BundleStatus {
    pub bundle_id: String,
    pub transactions: Vec<String>,
    pub slot: u64,
    pub confirmation_status: String,
    pub err: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InflightBundleStatusResponse {
    pub context: Context,
    pub value: Vec<Option<InflightBundleStatus>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InflightBundleStatus {
    pub bundle_id: String,
    pub status: String,
    pub landed_slot: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BundleStage {
    Submitted,
    InFlight,
    Landed,
    Confirmed,
    Finalized,
    Failed,
}

impl BundleStage {
    fn can_transition_to(&self, new_stage: &BundleStage) -> bool {
        matches!(
            (self, new_stage),
            (BundleStage::Submitted, BundleStage::InFlight)
                | (BundleStage::InFlight, BundleStage::Landed)
                | (BundleStage::InFlight, BundleStage::Failed)
                | (BundleStage::Landed, BundleStage::Confirmed)
                | (BundleStage::Landed, BundleStage::Failed)
                | (BundleStage::Confirmed, BundleStage::Finalized)
                | (BundleStage::Confirmed, BundleStage::Failed)
                | (_, BundleStage::Failed)
        )
    }

    pub fn is_terminal(&self) -> bool {
        matches!(self, BundleStage::Finalized | BundleStage::Failed)
    }
}

impl ToString for BundleStage {
    fn to_string(&self) -> String {
        match self {
            BundleStage::Submitted => "Submitted".to_string(),
            BundleStage::InFlight => "InFlight".to_string(),
            BundleStage::Landed => "Landed".to_string(),
            BundleStage::Confirmed => "Confirmed".to_string(),
            BundleStage::Finalized => "Finalized".to_string(),
            BundleStage::Failed => "Failed".to_string(),
        }
    }
}

impl From<BundleStage> for i32 {
    fn from(value: BundleStage) -> Self {
        match value {
            BundleStage::Submitted => 1,
            BundleStage::InFlight => 2,
            BundleStage::Landed => 3,
            BundleStage::Confirmed => 4,
            BundleStage::Finalized => 5,
            BundleStage::Failed => 6,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BundleStatusUpdate {
    pub bundle_id: String,
    pub status: String,
    pub timestamp: u64,
    pub slot: Option<u64>,
    pub stage: BundleStage,
    pub version: u64,
    pub user_id: Option<String>,
}

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
struct CachedBundle {
    bundle_id: String,
    status: String,
    stage: BundleStage,
    last_updated: Instant,
    last_checked: Instant,
    version: u64,
    slot: Option<u64>,
}

pub struct RedisBundleTracker {
    redis_pool: Arc<Vec<Arc<Mutex<redis::aio::MultiplexedConnection>>>>,
    jito_manager: Arc<JitoHttpManager>,
    config: TrackerConfig,
    local_cache: Arc<DashMap<String, CachedBundle>>,
    batch_semaphore: Arc<Semaphore>,
    lua_scripts: LuaScripts,
    metrics: Arc<TrackerMetrics>,
    notification_system: Option<Arc<UserStreamNotificationSystem>>,
}

#[derive(Debug)]
struct LuaScripts {
    update_bundle_with_transition: Script,
    cleanup_completed: Script,
    get_bundles_by_stage: Script,
}
impl LuaScripts {
    pub fn new() -> Self {
        Self {
            update_bundle_with_transition: Script::new(include_str!(
                "lua_scripts/update_bundle_with_transition.lua"
            )),

            cleanup_completed: Script::new(include_str!("lua_scripts/cleanup_completed.lua")),

            get_bundles_by_stage: Script::new(include_str!("lua_scripts/get_bundles_by_stage.lua")),
        }
    }
}

#[derive(Debug, Default)]
struct TrackerMetrics {
    total_bundles: std::sync::atomic::AtomicU64,
    redis_operations: std::sync::atomic::AtomicU64,
    api_calls: std::sync::atomic::AtomicU64,
    errors: std::sync::atomic::AtomicU64,
    stage_transitions: std::sync::atomic::AtomicU64,
    invalid_transitions: std::sync::atomic::AtomicU64,
}

impl RedisBundleTracker {
    pub async fn new(
        redis_urls: Vec<String>,
        config: TrackerConfig,
        jito_manager: Arc<JitoHttpManager>,
    ) -> RedisResult<Self> {
        let mut redis_pool = Vec::new();
        for url in redis_urls {
            let client = redis::Client::open(url)?;
            let conn = client.get_multiplexed_async_connection().await?;
            redis_pool.push(Arc::new(Mutex::new(conn)));
        }

        Ok(Self {
            redis_pool: Arc::new(redis_pool),
            jito_manager,
            batch_semaphore: Arc::new(Semaphore::new(config.max_concurrent_batches)),
            lua_scripts: LuaScripts::new(),
            local_cache: Arc::new(DashMap::new()),
            config,
            metrics: Arc::new(TrackerMetrics::default()),
            notification_system: None,
        })
    }

    fn get_redis_connection(&self, index: usize) -> Arc<Mutex<redis::aio::MultiplexedConnection>> {
        let pool_index = index % self.redis_pool.len();
        self.redis_pool[pool_index].clone()
    }

    pub fn with_notifications(
        mut self,
        notification_system: Arc<UserStreamNotificationSystem>,
    ) -> Self {
        self.notification_system = Some(notification_system);
        self
    }

    pub async fn store_ownership(&self, bundle_id: &str, user_id: &str) {
        if let Some(notification_system) = &self.notification_system {
            notification_system.register_user_bundle(user_id, bundle_id);
        }
    }

    pub async fn add_bundles(&self, bundle_ids: Vec<String>, user_id: String) -> RedisResult<()> {
        let chunks: Vec<_> = bundle_ids.chunks(self.config.batch_size).collect();

        for (i, chunk) in chunks.iter().enumerate() {
            let redis = self.get_redis_connection(i);
            let mut conn = redis.lock().await;

            let status_response = match self
                .jito_manager
                .get_in_flight_bundle_statuses(chunk.to_vec())
                .await
            {
                Ok(response) => response,
                Err(e) => {
                    error!("Failed to get in-flight bundle statuses: {}", e);
                    continue; // Err(...)?
                }
            };

            let response: InflightBundleStatusResponse =
                match serde_json::from_value(status_response) {
                    Ok(resp) => resp,
                    Err(e) => {
                        error!("Failed to parse inflight bundle status response: {}", e);
                        continue;
                    }
                };

            for status in response.value.iter().flatten() {
                let bundle_data = BundleStatusUpdate {
                    bundle_id: status.bundle_id.clone(),
                    status: status.status.clone(),
                    timestamp: chrono::Utc::now().timestamp() as u64,
                    slot: None,
                    stage: BundleStage::InFlight,
                    version: 1,
                    user_id: Some(user_id.clone()),
                };

                let serialized = serde_json::to_string(&bundle_data)?;

                let result: i32 = self
                    .lua_scripts
                    .update_bundle_with_transition
                    .arg(&status.bundle_id)
                    .arg(&serialized)
                    .arg(bundle_data.stage.to_string())
                    .arg(1)
                    .arg(self.config.completion_ttl.as_secs())
                    .invoke_async(&mut *conn)
                    .await?;

                if result == 1 {
                    self.local_cache.insert(
                        status.bundle_id.clone(),
                        CachedBundle {
                            bundle_id: status.bundle_id.clone(),
                            status: bundle_data.status,
                            stage: BundleStage::InFlight,
                            last_updated: Instant::now(),
                            last_checked: Instant::now(),
                            version: 1,
                            slot: None,
                        },
                    );
                }
                self.store_ownership(&status.bundle_id, &user_id).await;
            }
        }

        self.metrics.total_bundles.fetch_add(
            bundle_ids.len() as u64,
            std::sync::atomic::Ordering::Relaxed,
        );
        Ok(())
    }

    pub async fn start_tracking(&self) -> RedisResult<()> {
        info!("Starting bundle tracking");

        let mut cleanup_timer = tokio::time::interval(self.config.cleanup_interval);
        let mut inflight_timer = tokio::time::interval(self.config.inflight_check_interval);
        let mut landed_timer = tokio::time::interval(self.config.landed_check_interval);

        loop {
            tokio::select! {
                _ = inflight_timer.tick() => {

                    self.process_inflight_stage().await;
                }
                _ = landed_timer.tick() => {

                    self.process_landed_stage().await;
                }
                _ = cleanup_timer.tick() => {
                    if let Err(e) = self.cleanup_completed_bundles().await {
                        error!("Cleanup failed: {}", e);
                    }
                }
            }
        }
    }

    async fn process_inflight_stage(&self) {
        let stages_to_check = vec![BundleStage::Submitted, BundleStage::InFlight];

        for stage in stages_to_check {
            let bundles = match self
                .get_bundles_by_stage(stage, self.config.inflight_check_interval)
                .await
            {
                Ok(bundles) => bundles,
                Err(e) => {
                    error!("Failed to get bundles for stage : {}", e);
                    continue;
                }
            };

            if !bundles.is_empty() {
                let bundle_ids: Vec<String> = bundles.iter().map(|b| b.bundle_id.clone()).collect();
                self.check_inflight_statuses(bundle_ids).await;
            }
        }
    }

    async fn process_landed_stage(&self) {
        let stages_to_check = vec![BundleStage::Landed, BundleStage::Confirmed];

        for stage in stages_to_check {
            let bundles = match self
                .get_bundles_by_stage(stage, self.config.landed_check_interval)
                .await
            {
                Ok(bundles) => bundles,
                Err(e) => {
                    error!("Failed to get bundles for stage {}", e);
                    continue;
                }
            };

            if !bundles.is_empty() {
                let bundle_ids: Vec<String> = bundles.iter().map(|b| b.bundle_id.clone()).collect();
                self.check_landed_statuses(bundle_ids).await;
            }
        }
    }

    async fn get_bundles_by_stage(
        &self,
        stage: BundleStage,
        min_age: Duration,
    ) -> RedisResult<Vec<BundleStatusUpdate>> {
        let redis = self.get_redis_connection(0);
        let mut conn = redis.lock().await;

        let stage_str = format!("{:?}", stage);

        let cutoff_time = std::time::SystemTime::now() - min_age;
        let last_checked_before = cutoff_time
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        if self.config.use_lua_scripts {
            let bundles_data: Vec<String> = self
                .lua_scripts
                .get_bundles_by_stage
                .arg(&stage_str)
                .arg(self.config.batch_size)
                .arg(last_checked_before)
                .invoke_async(&mut *conn)
                .await?;

            let mut result: Vec<BundleStatusUpdate> = Vec::new();
            for bundle_data in bundles_data {
                if let Ok(bundle) = serde_json::from_str::<BundleStatusUpdate>(&bundle_data) {
                    result.push(bundle);
                }
            }
            Ok(result)
        } else {
            let bundle_ids: Vec<String> = conn
                .smembers(format!("bundles_stage:{}", stage_str))
                .await?;
            let mut result = Vec::new();

            for bundle_id in bundle_ids {
                if let Ok(bundle_data) = conn
                    .hget::<_, _, String>("bundle_tracker", &bundle_id)
                    .await
                    && let Ok(bundle) = serde_json::from_str::<BundleStatusUpdate>(&bundle_data)
                {
                    if let Some(cached) = self.local_cache.get(&bundle_id) {
                        if cached.last_checked.elapsed() >= min_age {
                            result.push(bundle);
                        }
                    } else {
                        result.push(bundle);
                    }
                }
            }
            Ok(result)
        }
    }

    async fn check_inflight_statuses(&self, bundle_ids: Vec<String>) {
        let chunks: Vec<_> = bundle_ids.chunks(self.config.batch_size).collect();

        let futures: Vec<_> = chunks
            .into_iter()
            .map(|chunk| {
                let chunk = chunk.to_vec();
                async move {
                    let _permit = self.batch_semaphore.acquire().await.unwrap();
                    self.process_inflight_chunk(chunk).await
                }
            })
            .collect();
        let results = try_join_all(futures).await;

        if let Err(e) = results {
            error!("Some chunks failed to process: {}", e);
        }
    }

    async fn process_inflight_chunk(&self, bundle_ids: Vec<String>) -> RedisResult<()> {
        let status_response = match self
            .jito_manager
            .get_in_flight_bundle_statuses(bundle_ids.clone())
            .await
        {
            Ok(response) => response,
            Err(e) => {
                error!("Failed to get in-flight bundle statuses for chunk: {}", e);
                self.metrics
                    .errors
                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                return Err(redis::RedisError::from((
                    redis::ErrorKind::IoError,
                    "Jito API error",
                    e.to_string(),
                )));
            }
        };

        let response: InflightBundleStatusResponse = serde_json::from_value(status_response)
            .map_err(|e| {
                error!("Failed to parse inflight response: {}", e);
                redis::RedisError::from((redis::ErrorKind::TypeError, "JSON parse error"))
            })?;

        for status in response.value.into_iter().flatten() {
            let (new_stage, new_status) = match status.status.as_str() {
                "Pending" => (BundleStage::InFlight, "InFlight"),
                "Landed" => (BundleStage::Landed, "Landed"),
                "Failed" | "Invalid" => (BundleStage::Failed, "Failed"),
                _ => (BundleStage::InFlight, "InFlight"),
            };

            if let Err(e) = self
                .update_bundle_status(&status.bundle_id, new_status, new_stage, status.landed_slot)
                .await
            {
                error!("Failed to update bundle {}: {}", status.bundle_id, e);
            }
        }

        self.metrics
            .api_calls
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        Ok(())
    }

    async fn check_landed_statuses(&self, bundle_ids: Vec<String>) {
        let chunks: Vec<_> = bundle_ids.chunks(self.config.batch_size).collect();

        let futures: Vec<_> = chunks
            .iter()
            .map(|chunk| {
                let chunk = chunk.to_vec();
                async move {
                    let _ = self.batch_semaphore.acquire().await.unwrap();
                    self.process_landed_chunk(chunk).await
                }
            })
            .collect();
        let results = try_join_all(futures).await;

        if let Err(e) = results {
            error!("Some chunks failed to process: {}", e);
        }
    }

    async fn process_landed_chunk(&self, bundle_ids: Vec<String>) -> RedisResult<()> {
        let status_response = match self
            .jito_manager
            .get_bundle_statuses(bundle_ids.clone())
            .await
        {
            Ok(response) => response,
            Err(e) => {
                error!("Failed to get bundle statuses for chunk: {}", e);
                self.metrics
                    .errors
                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                return Err(redis::RedisError::from((
                    redis::ErrorKind::IoError,
                    "Jito API error",
                    e.to_string(),
                )));
            }
        };

        let response: BundleStatusResponse =
            serde_json::from_value(status_response).map_err(|e| {
                error!("Failed to parse bundle status response: {}", e);
                redis::RedisError::from((redis::ErrorKind::TypeError, "JSON parse error"))
            })?;

        for status in response.value.into_iter().flatten() {
            let (new_stage, new_status) = match status.confirmation_status.as_str() {
                "Confirmed" => (BundleStage::Confirmed, "Confirmed"),
                "Finalized" | "Processed" => (BundleStage::Finalized, "Finalized"),
                _ => continue,
            };

            if let Err(e) = self
                .update_bundle_status(&status.bundle_id, new_status, new_stage, Some(status.slot))
                .await
            {
                error!("Failed to update bundle {}: {}", status.bundle_id, e);
            }
        }

        self.metrics
            .api_calls
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        Ok(())
    }

    async fn get_current_version_safely(&self, bundle_id: &str) -> RedisResult<u64> {
        let redis = self.get_redis_connection(0);
        let mut conn = redis.lock().await;

        if let Ok(bundle_data) = conn.hget::<_, _, String>("bundle_tracker", bundle_id).await
            && let Ok(bundle) = serde_json::from_str::<BundleStatusUpdate>(&bundle_data)
        {
            return Ok(bundle.version);
        }

        Ok(1)
    }

    async fn update_bundle_status(
        &self,
        bundle_id: &str,
        new_status: &str,
        new_stage: BundleStage,
        slot: Option<u64>,
    ) -> RedisResult<()> {
        let current_version = self.get_current_version_safely(bundle_id).await.unwrap();

        let old_status = self
            .local_cache
            .get(bundle_id)
            .map(|cached| cached.status.clone())
            .unwrap_or_else(|| "Unknown".to_string());

        let new_version = current_version + 1;

        let user_id = if let Some(notification_system) = &self.notification_system {
            notification_system.get_user_id(bundle_id)
        } else {
            None
        };

        let bundle_update = BundleStatusUpdate {
            bundle_id: bundle_id.to_string(),
            status: new_status.to_string(),
            timestamp: chrono::Utc::now().timestamp() as u64,
            slot,
            stage: new_stage.clone(),
            version: new_version,
            user_id,
        };

        if let Some(cached) = self.local_cache.get(bundle_id)
            && !cached.stage.can_transition_to(&new_stage)
        {
            return Ok(());
        }

        let serialized = serde_json::to_string(&bundle_update)?;

        let redis = self.get_redis_connection(0);
        let mut conn = redis.lock().await;

        let result: i32 = self
            .lua_scripts
            .update_bundle_with_transition
            .arg(bundle_id)
            .arg(&serialized)
            .arg(format!("{:?}", new_stage))
            .arg(new_version)
            .arg(self.config.completion_ttl.as_secs())
            .invoke_async(&mut *conn)
            .await?;

        match result {
            1 => {
                self.local_cache.insert(
                    bundle_id.to_string(),
                    CachedBundle {
                        bundle_id: bundle_id.to_string(),
                        status: new_status.to_string(),
                        stage: new_stage.clone(),
                        last_updated: Instant::now(),
                        last_checked: Instant::now(),
                        version: new_version,
                        slot,
                    },
                );

                if let Some(notification_system) = &self.notification_system
                    && old_status != new_status
                {
                    notification_system.notify_bundle_change(
                        bundle_id,
                        old_status,
                        new_stage.clone(),
                        slot,
                    );
                }

                self.metrics
                    .stage_transitions
                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            }
            0 => {
                debug!("Ignored outdated update for bundle {}", bundle_id);
            }
            -1 => {
                warn!("Invalid stage transition for bundle {}", bundle_id);
                self.metrics
                    .invalid_transitions
                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            }
            _ => {
                error!("Unexpected result from update script: {}", result);
            }
        }
        Ok(())
    }

    pub async fn get_user_bundle_statuses(&self, user_id: &str) -> Vec<UserBundleUpdate> {
        if let Some(notification_system) = &self.notification_system {
            let user_bundles = notification_system.get_user_bundles(user_id);

            let mut results = Vec::new();
            for bundle_id in user_bundles {
                if let Some(cached) = self.local_cache.get(&bundle_id) {
                    let update = UserBundleUpdate {
                        bundle_id: bundle_id.clone(),
                        old_status: cached.status.to_string(),
                        new_status: cached.stage.clone(),
                        timestamp: chrono::Utc::now().timestamp_millis() as u64,
                        slot: cached.slot,
                    };
                    results.push(update);
                }
            }
            results
        } else {
            vec![]
        }
    }

    async fn cleanup_completed_bundles(&self) -> RedisResult<()> {
        let cutoff_timestamp =
            chrono::Utc::now().timestamp() as u64 - self.config.completion_ttl.as_secs();

        let redis = self.get_redis_connection(0);
        let mut conn = redis.lock().await;

        let removed: i32 = self
            .lua_scripts
            .cleanup_completed
            .arg(cutoff_timestamp)
            .arg(1000)
            .invoke_async(&mut *conn)
            .await?;

        if removed > 0 {
            info!("Cleaned up {} completed bundles", removed);

            self.local_cache.retain(|_, cached| {
                !matches!(cached.stage, BundleStage::Finalized | BundleStage::Failed)
                    || cached.last_updated.elapsed() < self.config.completion_ttl
            });
        }

        Ok(())
    }

    pub fn get_metrics(&self) -> HashMap<String, u64> {
        let mut metrics = HashMap::new();
        metrics.insert(
            "total_bundles".to_string(),
            self.metrics
                .total_bundles
                .load(std::sync::atomic::Ordering::Relaxed),
        );
        metrics.insert("active_bundles".to_string(), self.local_cache.len() as u64);
        metrics.insert(
            "redis_operations".to_string(),
            self.metrics
                .redis_operations
                .load(std::sync::atomic::Ordering::Relaxed),
        );
        metrics.insert(
            "api_calls".to_string(),
            self.metrics
                .api_calls
                .load(std::sync::atomic::Ordering::Relaxed),
        );
        metrics.insert(
            "errors".to_string(),
            self.metrics
                .errors
                .load(std::sync::atomic::Ordering::Relaxed),
        );
        metrics.insert(
            "stage_transitions".to_string(),
            self.metrics
                .stage_transitions
                .load(std::sync::atomic::Ordering::Relaxed),
        );
        metrics.insert(
            "invalid_transitions".to_string(),
            self.metrics
                .invalid_transitions
                .load(std::sync::atomic::Ordering::Relaxed),
        );
        metrics
    }
}
