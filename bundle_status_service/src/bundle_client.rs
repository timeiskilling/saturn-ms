use ahash::RandomState;
use common::bundle_stage_api::{BundleStage, BundleStatusUpdate};
use dashmap::DashMap;
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::broadcast;

use deadpool_redis::Runtime;
use deadpool_redis::sentinel::Pool;
use redis::{AsyncCommands, RedisError};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserBundleUpdate {
    pub bundle_id: String,
    pub old_status: String,
    pub new_status: BundleStage,
    pub timestamp: u64,
    pub slot: Option<u64>,
}

#[derive(Debug, Clone)]
struct UserStats {
    // bundles_count: usize,
    last_activity: tokio::time::Instant,
    total_updates_sent: u64,
}

#[derive(Debug, Clone)]
pub struct UserStreamNotificationSystem {
    redis_pool: Pool,
    user_streams: Arc<DashMap<String, broadcast::Sender<UserBundleUpdate>, RandomState>>,
    active_users: Arc<DashMap<String, UserStats, RandomState>>,
}

impl UserStreamNotificationSystem {
    pub fn new(sentinel_urls: Vec<String>, master_name: String) -> Self {
        let cfg = deadpool_redis::sentinel::Config {
            urls: Some(sentinel_urls),
            connections: None,
            server_type: deadpool_redis::sentinel::SentinelServerType::Master,
            master_name,
            ..Default::default()
        };

        let pool = cfg
            .create_pool(Some(Runtime::Tokio1))
            .expect("Failed to create Redis Sentinel pool");

        Self {
            user_streams: Arc::new(DashMap::with_hasher(RandomState::new())),
            active_users: Arc::new(DashMap::with_hasher(RandomState::new())),
            redis_pool: pool,
        }
    }

    pub async fn get_redis_connection(
        &self,
    ) -> Result<deadpool_redis::sentinel::Connection, RedisError> {
        self.redis_pool
            .get()
            .await
            .map_err(|e| RedisError::from((redis::ErrorKind::Io, "Pool error", e.to_string())))
    }

    pub fn subscribe_to_user_stream(
        &self,
        user_id: String,
    ) -> broadcast::Receiver<UserBundleUpdate> {
        let sender = self
            .user_streams
            .entry(user_id.clone())
            .or_insert_with(|| {
                let (sender, _) = broadcast::channel(100);
                sender
            })
            .clone();

        self.active_users
            .entry(user_id.clone())
            .and_modify(|stats| stats.last_activity = tokio::time::Instant::now())
            .or_insert_with(|| UserStats {
                last_activity: tokio::time::Instant::now(),
                total_updates_sent: 0,
            });

        sender.subscribe()
    }

    pub fn start_connection_management(&self) {
        let cleanup_system: UserStreamNotificationSystem = self.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(30));

            loop {
                interval.tick().await;
                cleanup_system.cleanup_inactive_users().await;
            }
        });
    }

    pub async fn cleanup_inactive_users(&self) {
        let cuttof = tokio::time::Instant::now() - Duration::from_secs(300);
        let inactive_users: Vec<String> = self
            .active_users
            .iter()
            .filter(|entry| entry.value().last_activity < cuttof)
            .map(|entry| entry.key().clone())
            .collect();

        self.active_users.retain(|_, user_data| {
            let is_active = user_data.last_activity >= cuttof;
            if !is_active {
                tracing::info!("Cleaning up inactive user");
            }
            is_active
        });

        for user_id in inactive_users {
            self.user_streams.remove(&user_id);
        }
    }

    pub async fn sentinel_register_user_bundle(
        &self,
        user_id: &str,
        bundle_id: &str,
    ) -> Result<(), RedisError> {
        let mut conn = self.get_redis_connection().await?;
        let owner_key = format!("bundle_owner:{}", bundle_id);
        let user_bundles_key = format!("user_bundles:{}", user_id);

        // 1. Set the owner for the specific bundle with TTL
        let _: () = conn.set_ex(owner_key, user_id, 3600).await?;

        // 2. Add the bundle to the user's set of active bundles
        let _: () = conn.sadd(&user_bundles_key, bundle_id).await?;

        // 3. Set/Refresh TTL on the user's bundle set
        let _: () = conn.expire(user_bundles_key, 3600).await?;

        Ok(())
    }

    pub fn sentinal_start_redis_subscription(&self, redis_client: redis::Client) {
        let notification_system = self.clone();
        tokio::spawn(async move {
            let mut conn = match redis_client.get_async_pubsub().await {
                Ok(conn) => conn,
                Err(e) => {
                    tracing::error!("Failed to connect to Redis for subscription: {}", e);
                    return;
                }
            };

            if let Err(e) = conn.subscribe("bundle_status_updates").await {
                tracing::error!("Failed to subscribe to bundle_status_updates: {}", e);
                return;
            }

            let mut stream = conn.on_message();

            while let Some(msg) = stream.next().await {
                let payload: String = match msg.get_payload() {
                    Ok(p) => p,
                    Err(e) => {
                        tracing::error!("Failed to get payload from redis msg: {}", e);
                        continue;
                    }
                };

                tracing::info!("Received Redis Update: {}", payload);

                if let Ok(bundle_update) = serde_json::from_str::<BundleStatusUpdate>(&payload) {
                    let key = format!("bundle_owner:{}", bundle_update.bundle_id);

                    let mut conn = match notification_system.get_redis_connection().await {
                        Ok(c) => c,
                        Err(e) => {
                            tracing::error!("Failed to get redis connection: {}", e);
                            continue;
                        }
                    };

                    let user_id = match conn.get::<_, Option<String>>(&key).await {
                        Ok(Some(owner)) => owner,
                        Ok(None) => {
                            tracing::warn!(
                                "Bundle ownership not found for: {}",
                                bundle_update.bundle_id
                            );
                            continue;
                        }
                        Err(e) => {
                            tracing::error!("Failed to get bundle ownership from redis: {}", e);
                            continue;
                        }
                    };

                    if notification_system.user_streams.contains_key(&user_id) {
                        let update = UserBundleUpdate {
                            bundle_id: bundle_update.bundle_id,
                            old_status: bundle_update
                                .old_status
                                .unwrap_or_else(|| "Unknown".to_string()),
                            new_status: bundle_update.stage,
                            timestamp: bundle_update.timestamp,
                            slot: bundle_update.slot,
                        };

                        if let Some(sender) = notification_system.user_streams.get(&user_id) {
                            let _ = sender.send(update);
                            notification_system
                                .active_users
                                .entry(user_id)
                                .and_modify(|stats| {
                                    stats.total_updates_sent += 1;
                                    stats.last_activity = tokio::time::Instant::now();
                                });
                        }
                    }
                }
            }
        });
    }

    pub async fn user_owns_bundle(
        &self,
        user_id: &str,
        bundle_id: &str,
    ) -> Result<bool, RedisError> {
        let mut conn = self.get_redis_connection().await?;
        let key = format!("bundle_owner:{}", bundle_id);
        let owner: Option<String> = conn.get(key).await?;
        Ok(owner.as_deref() == Some(user_id))
    }

    pub async fn get_user_bundles(&self, user_id: &str) -> Result<Vec<String>, RedisError> {
        let mut conn = self.get_redis_connection().await?;
        let key = format!("user_bundles:{}", user_id);
        let bundles: Vec<String> = conn.smembers(key).await?;
        Ok(bundles)
    }

    pub async fn get_active_bundle_updates(
        &self,
        user_id: &str,
    ) -> Result<Vec<UserBundleUpdate>, RedisError> {
        let bundle_ids = self.get_user_bundles(user_id).await?;
        if bundle_ids.is_empty() {
            return Ok(vec![]);
        }

        let mut conn = self.get_redis_connection().await?;
        let statuses: Vec<Option<String>> = conn.hmget("bundle_tracker", &bundle_ids).await?;

        let updates = statuses
            .into_iter()
            .zip(bundle_ids)
            .filter_map(|(status_json, bundle_id)| {
                status_json.and_then(|json| {
                    serde_json::from_str::<BundleStatusUpdate>(&json)
                        .ok()
                        .map(|bundle_update| UserBundleUpdate {
                            bundle_id,
                            old_status: bundle_update
                                .old_status
                                .unwrap_or_else(|| "Unknown".to_string()),
                            new_status: bundle_update.stage,
                            timestamp: bundle_update.timestamp,
                            slot: bundle_update.slot,
                        })
                })
            })
            .collect();

        Ok(updates)
    }

    pub async fn get_user_id(&self, bundle_id: &str) -> Result<Option<String>, RedisError> {
        let mut conn = self.get_redis_connection().await?;
        let key = format!("bundle_owner:{}", bundle_id);
        let user_id: Option<String> = conn.get(key).await?;
        Ok(user_id)
    }

    pub async fn cleanup_bundle(&self, bundle_id: &str) -> Result<(), RedisError> {
        let mut conn = self.get_redis_connection().await?;
        let owner_key = format!("bundle_owner:{}", bundle_id);

        if let Some(user_id) = conn.get::<_, Option<String>>(&owner_key).await? {
            let user_bundles_key = format!("user_bundles:{}", user_id);
            let _: () = conn.srem(user_bundles_key, bundle_id).await?;
        }

        let _: () = conn.del(owner_key).await?;
        Ok(())
    }

    pub fn get_stats(&self) -> HashMap<String, usize> {
        let mut stats = HashMap::new();
        stats.insert("active_user_streams".to_string(), self.user_streams.len());
        stats.insert("active_users".to_string(), self.active_users.len());
        stats
    }

    // fn get_user_bundle_count(&self, user_id: &str) -> usize {
    //     self.user_bundles
    //         .get(user_id)
    //         .map(|bundles| bundles.len())
    //         .unwrap_or(0)
    // }
}
