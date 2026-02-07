use crate::jito_client_api::main_api::JitoClient;
use async_trait::async_trait;
use common::bundle_stage_api::{
    BundleStage, BundleStatusResponse, BundleStatusUpdate, InflightBundleStatusResponse,
};
use dashmap::DashMap;
use futures::future::try_join_all;
use redis::{AsyncCommands, RedisResult};
use std::collections::HashMap;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use tokio::time::Duration;
use tokio::{sync::Semaphore, time::Instant};
use tracing::{debug, error, info, warn};

use crate::bundle_manager::bundle_tracker_api::{
    main_api::BundleTracker,
    saturn_tracker::{
        lua_scripts::LuaScripts,
        tracker_config::{CachedBundle, TrackerConfig},
        tracker_metrics::TrackerMetrics,
    },
};

pub struct SaturnBundleTracker {
    redis_pool: Arc<Vec<redis::aio::MultiplexedConnection>>,
    connection_counter: AtomicUsize,
    jito_manager: Arc<dyn JitoClient>,
    config: TrackerConfig,
    local_cache: Arc<DashMap<String, CachedBundle>>,
    batch_semaphore: Arc<Semaphore>,
    lua_scripts: LuaScripts,
    metrics: Arc<TrackerMetrics>,
}

impl SaturnBundleTracker {
    pub async fn new(
        redis_urls: Vec<String>,
        config: TrackerConfig,
        jito_manager: Arc<dyn JitoClient>,
    ) -> RedisResult<Self> {
        let connection_futures = redis_urls.into_iter().map(|url| async move {
            let client = redis::Client::open(url)?;
            client.get_multiplexed_async_connection().await
        });
        let redis_pool = try_join_all(connection_futures).await?;

        info!(
            "Successfully initialized {} Redis connections pool",
            redis_pool.len()
        );

        Ok(Self {
            redis_pool: Arc::new(redis_pool),
            connection_counter: AtomicUsize::new(0),
            jito_manager,
            batch_semaphore: Arc::new(Semaphore::new(config.max_concurrent_batches)),
            lua_scripts: LuaScripts::new(),
            local_cache: Arc::new(DashMap::new()),
            config,
            metrics: Arc::new(TrackerMetrics::default()),
        })
    }
}

#[async_trait]
impl BundleTracker for SaturnBundleTracker {
    fn get_redis_connection(&self) -> redis::aio::MultiplexedConnection {
        let index = self.connection_counter.fetch_add(1, Ordering::Relaxed);
        let pool_index = index % self.redis_pool.len();
        self.redis_pool[pool_index].clone()
    }

    async fn add_bundles(&self, bundle_ids: Vec<String>) -> RedisResult<()> {
        let chunks: Vec<_> = bundle_ids.chunks(self.config.batch_size).collect();

        for chunk in chunks.iter() {
            let mut conn = self.get_redis_connection();

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
                    last_checked: chrono::Utc::now().timestamp() as u64,
                    slot: None,
                    stage: BundleStage::InFlight,
                    version: 1,
                    old_status: None,
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
                    .arg("true")
                    .invoke_async(&mut conn)
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
            }
        }

        self.metrics.total_bundles.fetch_add(
            bundle_ids.len() as u64,
            std::sync::atomic::Ordering::Relaxed,
        );
        Ok(())
    }

    async fn start_tracking(&self) -> RedisResult<()> {
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
        let mut conn = self.get_redis_connection();

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
                .invoke_async(&mut conn)
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
                    redis::ErrorKind::Io,
                    "Jito API error",
                    e.to_string(),
                )));
            }
        };

        let response: InflightBundleStatusResponse = serde_json::from_value(status_response)
            .map_err(|e| {
                error!("Failed to parse inflight response: {}", e);
                redis::RedisError::from((
                    redis::ErrorKind::UnexpectedReturnType,
                    "JSON parse error",
                ))
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
                    redis::ErrorKind::Io,
                    "Jito API error",
                    e.to_string(),
                )));
            }
        };

        let response: BundleStatusResponse =
            serde_json::from_value(status_response).map_err(|e| {
                error!("Failed to parse bundle status response: {}", e);
                redis::RedisError::from((
                    redis::ErrorKind::UnexpectedReturnType,
                    "JSON parse error",
                ))
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
        let mut conn = self.get_redis_connection();

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

        let (old_status, old_stage) = if let Some(cached) = self.local_cache.get(bundle_id) {
            (cached.status.clone(), Some(cached.stage.clone()))
        } else {
            ("Unknown".to_string(), None)
        };

        let new_version = current_version + 1;

        let bundle_update = BundleStatusUpdate {
            bundle_id: bundle_id.to_string(),
            status: new_status.to_string(),
            old_status: Some(old_status.clone()),
            timestamp: chrono::Utc::now().timestamp() as u64,
            last_checked: chrono::Utc::now().timestamp() as u64,
            slot,
            stage: new_stage.clone(),
            version: new_version,
        };

        if let Some(stage) = &old_stage
            && !stage.can_transition_to(&new_stage)
        {
            return Ok(());
        }

        let serialized = serde_json::to_string(&bundle_update)?;

        let mut conn = self.get_redis_connection();

        let result: i32 = self
            .lua_scripts
            .update_bundle_with_transition
            .arg(bundle_id)
            .arg(&serialized)
            .arg(format!("{:?}", new_stage))
            .arg(new_version)
            .arg(self.config.completion_ttl.as_secs())
            .arg("false")
            .invoke_async(&mut conn)
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

    async fn cleanup_completed_bundles(&self) -> RedisResult<()> {
        let cutoff_timestamp =
            chrono::Utc::now().timestamp() as u64 - self.config.completion_ttl.as_secs();
        let mut conn = self.get_redis_connection();

        let removed: i32 = self
            .lua_scripts
            .cleanup_completed
            .arg(cutoff_timestamp)
            .arg(1000)
            .invoke_async(&mut conn)
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

    fn get_metrics(&self) -> HashMap<String, u64> {
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
