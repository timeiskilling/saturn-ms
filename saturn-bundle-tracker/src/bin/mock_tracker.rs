use common::bundle_stage_api::{BundleStage, BundleStatusUpdate};
use deadpool_redis::{Runtime, sentinel::Config};
use std::time::Duration;
use tokio::time::sleep;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let redis_urls = std::env::var("REDIS_SENTINEL_URLS")
        .unwrap_or_else(|_| "redis://127.0.0.1:26379".to_string())
        .split(',')
        .map(|s| s.to_string())
        .collect::<Vec<String>>();

    let master_name = std::env::var("REDIS_MASTER_SET").unwrap_or_else(|_| "mymaster".to_string());

    let cfg = Config {
        urls: Some(redis_urls),
        connections: None,
        server_type: deadpool_redis::sentinel::SentinelServerType::Master,
        master_name,
        ..Default::default()
    };

    let pool = cfg
        .create_pool(Some(Runtime::Tokio1))
        .expect("Failed to create Redis Sentinel pool");

    tracing::info!("Mock tracker started, listening for queue:bundles_to_track");

    loop {
        let mut conn = match pool.get().await {
            Ok(c) => c,
            Err(e) => {
                tracing::error!("Failed to get redis conn: {}", e);
                sleep(Duration::from_secs(1)).await;
                continue;
            }
        };

        let bundle_id: Option<String> = redis::cmd("LPOP")
            .arg("queue:bundles_to_track")
            .query_async(&mut conn)
            .await
            .unwrap_or(None);

        if let Some(bundle_id) = bundle_id {
            tracing::info!("Mocking lifecycle for bundle: {}", bundle_id);
            let pool_clone = pool.clone();
            tokio::spawn(async move {
                if let Err(e) = mock_bundle_lifecycle(pool_clone, bundle_id).await {
                    tracing::error!("Error in mock lifecycle: {}", e);
                }
            });
        } else {
            sleep(Duration::from_millis(500)).await;
        }
    }
}

async fn mock_bundle_lifecycle(
    pool: deadpool_redis::sentinel::Pool,
    bundle_id: String,
) -> Result<(), Box<dyn std::error::Error>> {
    let stages = vec![
        (BundleStage::InFlight, "InFlight", 1000),
        (BundleStage::Landed, "Landed", 2000),
        (BundleStage::Confirmed, "Confirmed", 2000),
        (BundleStage::Finalized, "Finalized", 2000),
    ];

    let mut current_status = "Submitted".to_string();

    for (stage, status_str, delay_ms) in stages {
        sleep(Duration::from_millis(delay_ms)).await;

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_millis() as u64;

        let update = BundleStatusUpdate {
            bundle_id: bundle_id.clone(),
            status: status_str.to_string(),
            old_status: Some(current_status.clone()),
            timestamp,
            last_checked: timestamp,
            slot: Some(100000000),
            stage,
            version: 1,
        };

        current_status = status_str.to_string();

        let mut conn = pool.get().await?;
        let payload = serde_json::to_string(&update)?;

        // Also save to bundle_tracker hash as expected by get_active_bundle_updates
        let _: () = redis::cmd("HSET")
            .arg("bundle_tracker")
            .arg(&bundle_id)
            .arg(&payload)
            .query_async(&mut conn)
            .await?;

        // Publish update
        let _: () = redis::cmd("PUBLISH")
            .arg("bundle_status_updates")
            .arg(&payload)
            .query_async(&mut conn)
            .await?;

        tracing::info!("Published mock update for {}: {}", bundle_id, status_str);
    }

    Ok(())
}
