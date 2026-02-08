use crate::jito_client_api::retry_config::RetryConfig;
use crate::prelude::*;
use crate::{
    bundle_manager::bundle_tracker_api::{
        main_api::BundleTracker,
        saturn_tracker::{tracker::SaturnBundleTracker, tracker_config::TrackerConfig},
    },
    jito_client_api::jito_http_manager::JitoHttpManager,
};
pub mod bundle_manager;
pub mod jito_client_api;
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
    let bundle_tracker = SaturnBundleTracker::new(redis_urls, config, jito_manager).await?;

    info!("Tracker loop started");
    if let Err(e) = bundle_tracker.start_tracking().await {
        error!("Tracker failed: {e}");
    }

    Ok(())
}
