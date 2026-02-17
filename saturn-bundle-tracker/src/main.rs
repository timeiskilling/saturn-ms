use crate::bundle_manager::bundle_tracker_api::{
    main_api::BundleTracker,
    saturn_tracker::{tracker::SaturnBundleTracker, tracker_config::TrackerConfig},
};
use crate::prelude::*;
use common::jito_client_api::jito_http_manager::JitoHttpManager;
use common::jito_client_api::retry_config::RetryConfig;
pub mod bundle_manager;
pub mod health;
pub mod prelude;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = TrackerConfig {
        inflight_check_interval: Duration::from_millis(500),
        landed_check_interval: Duration::from_millis(500),
        cleanup_interval: Duration::from_millis(2000),
        completion_ttl: Duration::from_secs(1),
        batch_size: 100,
        max_concurrent_batches: 50,
        ..TrackerConfig::default()
    };

    let redis_urls = vec![
        "redis://127.0.0.1:16379".to_string(),
        "redis://127.0.0.1:16379".to_string(),
    ];

    let jito_manager = Arc::new(JitoHttpManager::new(
        "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1".to_string(),
        50,
        RetryConfig::default(),
        None,
    ));

    let worker_id = uuid::Uuid::new_v4().to_string();

    let bundle_tracker =
        Arc::new(SaturnBundleTracker::new(redis_urls, config, jito_manager, worker_id).await?);

    let tracker_clone = bundle_tracker.clone();
    tokio::spawn(async move {
        health::start_health_server(tracker_clone, 3001).await;
    });

    info!("Tracker loop started");
    if let Err(e) = bundle_tracker.start_tracking().await {
        error!("Tracker failed: {e}");
    }

    Ok(())
}
