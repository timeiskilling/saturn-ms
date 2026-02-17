use async_trait::async_trait;
use common::jito_client_api::{main_api::JitoClient, retry_config::RpcStats};
use dashmap::DashMap;
use saturn_errors::error::RpcError;
use serde_json::json;
use std::sync::Arc;
use tokio::time::{Duration, Instant, sleep};
use tracing::info;

struct MockBundleState {
    created_at: Instant,
    tx_signature: String,
}

pub struct SimulatedJitoClient {
    state: Arc<DashMap<String, MockBundleState>>,
}

impl Default for SimulatedJitoClient {
    fn default() -> Self {
        Self {
            state: Arc::new(DashMap::new()),
        }
    }
}

#[async_trait]
impl JitoClient for SimulatedJitoClient {
    async fn send_bundle(
        &self,
        _params: Option<serde_json::Value>,
        uuid: Option<String>,
    ) -> Result<serde_json::Value, RpcError> {
        sleep(Duration::from_millis(10)).await;

        let bundle_id = uuid.expect("BundleTracker must pass bundle_id");
        let tx_signature = format!("simulated_tx_{bundle_id}");

        info!("send_bundle: {bundle_id}");

        self.state.insert(
            bundle_id.clone(),
            MockBundleState {
                created_at: Instant::now(),
                tx_signature,
            },
        );

        Ok(json!(bundle_id))
    }

    async fn get_in_flight_bundle_statuses(
        &self,
        bundle_ids: Vec<String>,
    ) -> Result<serde_json::Value, RpcError> {
        sleep(Duration::from_millis(30)).await;

        let values: Vec<_> = bundle_ids
            .iter()
            .map(|id| {
                if let Some(state) = self.state.get(id) {
                    let elapsed = state.created_at.elapsed();

                    let status = if elapsed < Duration::from_secs(1) {
                        "Pending"
                    } else {
                        "Landed"
                    };

                    json!({
                        "bundle_id": id,
                        "status": status,
                        "landed_slot": 200_000_000
                    })
                } else {
                    json!({
                        "bundle_id": id,
                        "status": "Invalid",
                        "landed_slot": 0
                    })
                }
            })
            .collect();

        Ok(json!({
            "context": { "slot": 200_000_000 },
            "value": values
        }))
    }

    async fn get_bundle_statuses(
        &self,
        bundle_ids: Vec<String>,
    ) -> Result<serde_json::Value, RpcError> {
        sleep(Duration::from_millis(20)).await;

        let mut values = Vec::new();

        for id in bundle_ids {
            if let Some(state) = self.state.get(&id) {
                values.push(json!({
                    "bundle_id": id,
                    "confirmation_status": "Finalized", // 🔥 ОДРАЗУ
                    "slot": 200_000_001,
                    "err": null,
                    "transactions": [ state.tx_signature.clone() ]
                }));
            }
        }

        Ok(json!({
            "context": { "slot": 200_000_001 },
            "value": values
        }))
    }
    fn get_stats(&self) -> RpcStats {
        RpcStats::default()
    }
}
