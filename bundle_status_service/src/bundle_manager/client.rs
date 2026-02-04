use ahash::RandomState;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::broadcast;

use crate::bundle_manager::bundle_tracker_api::bundle_stage_api::BundleStage;

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
    user_streams: Arc<DashMap<String, broadcast::Sender<UserBundleUpdate>, RandomState>>,
    bundle_ownership: Arc<DashMap<String, String, RandomState>>,
    user_bundles: Arc<DashMap<String, HashSet<String>, RandomState>>,
    active_users: Arc<DashMap<String, UserStats, RandomState>>,
}

impl Default for UserStreamNotificationSystem {
    fn default() -> Self {
        Self {
            user_streams: Arc::new(DashMap::with_hasher(RandomState::new())),
            bundle_ownership: Arc::new(DashMap::with_hasher(RandomState::new())),
            user_bundles: Arc::new(DashMap::with_hasher(RandomState::new())),
            active_users: Arc::new(DashMap::with_hasher(RandomState::new())),
        }
    }
}

impl UserStreamNotificationSystem {
    pub fn new() -> Self {
        Self::default()
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

    pub async fn start_connection_management(&self) {
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

            if let Some((_, bundles)) = self.user_bundles.remove(&user_id) {
                for bundle_id in bundles {
                    self.bundle_ownership.remove(&bundle_id);
                }
            }
        }
    }

    pub fn notify_bundle_change(
        &self,
        bundle_id: &str,
        old_status: String,
        new_status: BundleStage,
        slot: Option<u64>,
    ) {
        let user_id = match self.bundle_ownership.get(bundle_id) {
            Some(owner) => owner.value().clone(),
            None => {
                tracing::warn!("Bundle {} has no owner", bundle_id);
                return;
            }
        };

        let update = UserBundleUpdate {
            bundle_id: bundle_id.to_string(),
            old_status,
            new_status,
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            slot,
        };

        if let Some(sender) = self.user_streams.get(&user_id) {
            if sender.send(update).is_err() {
                tracing::debug!("No active listeners for user {}", user_id);
            } else {
                self.active_users.entry(user_id).and_modify(|stats| {
                    stats.total_updates_sent += 1;
                    stats.last_activity = tokio::time::Instant::now();
                });
            }
        }
    }

    pub fn register_user_bundle(&self, user_id: &str, bundle_id: &str) {
        self.bundle_ownership
            .insert(bundle_id.to_string(), user_id.to_string());

        self.user_bundles
            .entry(user_id.to_string())
            .or_insert_with(HashSet::new)
            .insert(bundle_id.to_string());
    }

    pub fn user_owns_bundle(&self, user_id: &str, bundle_id: &str) -> bool {
        self.bundle_ownership
            .get(bundle_id)
            .map(|owner| owner.value() == user_id)
            .unwrap_or(false)
    }

    pub fn get_user_bundles(&self, user_id: &str) -> Vec<String> {
        self.user_bundles
            .get(user_id)
            .map(|bundles| bundles.iter().cloned().collect())
            .unwrap_or_default()
    }

    pub fn get_user_id(&self, bundle_id: &str) -> Option<String> {
        self.bundle_ownership
            .get(bundle_id)
            .map(|entry| entry.value().clone())
    }

    pub fn cleanup_bundle(&self, bundle_id: &str) {
        if let Some((_, user_id)) = self.bundle_ownership.remove(bundle_id)
            && let Some(mut user_bundles) = self.user_bundles.get_mut(&user_id)
        {
            user_bundles.remove(bundle_id);
        }
    }

    pub fn get_stats(&self) -> HashMap<String, usize> {
        let mut stats = HashMap::new();
        stats.insert("active_user_streams".to_string(), self.user_streams.len());
        stats.insert("total_bundles".to_string(), self.bundle_ownership.len());
        stats.insert("active_users".to_string(), self.active_users.len());

        let total_user_bundles: usize = self
            .user_bundles
            .iter()
            .map(|entry| entry.value().len())
            .sum();
        stats.insert("total_user_bundles".to_string(), total_user_bundles);

        stats
    }

    // fn get_user_bundle_count(&self, user_id: &str) -> usize {
    //     self.user_bundles
    //         .get(user_id)
    //         .map(|bundles| bundles.len())
    //         .unwrap_or(0)
    // }
}
