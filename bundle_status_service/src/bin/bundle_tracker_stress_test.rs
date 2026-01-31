use bundle_status_service::bundle_manager::bundle_tracker_api::{
    main_api::BundleTracker,
    saturn_tracker::{tracker::SaturnBundleTracker, tracker_config::TrackerConfig},
    test::tracker::SimulatedJitoClient,
};

use std::sync::Arc;
use tokio::time::{Duration, Instant, sleep};
use tracing::{error, info};
use tracing_subscriber::fmt::format::FmtSpan;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();

    let redis_urls = vec![
        "redis://127.0.0.1:16379".to_string(),
        "redis://127.0.0.1:16380".to_string(),
        "redis://127.0.0.1:16381".to_string(),
        "redis://127.0.0.1:16382".to_string(),
        "redis://127.0.0.1:16383".to_string(),
    ];

    let config = TrackerConfig {
        // Перевіряємо статуси кожні 100 мс замість секунд
        inflight_check_interval: Duration::from_millis(100),
        landed_check_interval: Duration::from_millis(100),

        // Очищаємо майже миттєво
        cleanup_interval: Duration::from_millis(500),
        // Не зберігаємо історію завершених бандлів для тесту (1 секунда замість 30)
        completion_ttl: Duration::from_secs(1),

        // Збільшуємо розмір пакету, щоб обробляти більше за раз
        batch_size: 100,
        max_concurrent_batches: 50,
        ..TrackerConfig::default()
    };

    let jito_client = Arc::new(SimulatedJitoClient::default());

    info!("Initializing tracker...");
    let tracker = Arc::new(SaturnBundleTracker::new(redis_urls, config, jito_client).await?);

    let tracker_bg = tracker.clone();
    tokio::spawn(async move {
        info!("Tracker loop started");
        if let Err(e) = tracker_bg.start_tracking().await {
            error!("Tracker failed: {e}");
        }
    });

    let total_batches = 15;
    let bundles_per_batch = 1;

    info!("🚀 Starting Load Generator...");
    let start_time = Instant::now();

    for i in 0..total_batches {
        let bundle_ids: Vec<String> = (0..bundles_per_batch)
            .map(|j| format!("stress_bundle_{i}_{j}"))
            .collect();

        let user_id = format!("user_{}", i % 5);

        tracker.add_bundles(bundle_ids, user_id).await?;

        sleep(Duration::from_millis(50)).await;
    }

    info!("All bundles submitted. Waiting for processing...");

    loop {
        let metrics = tracker.get_metrics();
        info!("Metrics: {:?}", metrics);

        if let Some(active) = metrics.get("active_bundles")
            && *active == 0
            && metrics.get("total_bundles").unwrap_or(&0) > &0
        {
            let duration = start_time.elapsed();
            let total_processed = *metrics.get("total_bundles").unwrap();

            let throughput = total_processed as f64 / duration.as_secs_f64();

            info!("--------------------------------------------------");
            info!("🎉 Stress test completed!");
            info!("⏱️  Time: {:?}", duration);
            info!("📦 Bundles: {}", total_processed);
            info!("⚡ Throughput: {:.2} bundles/sec", throughput);
            info!("--------------------------------------------------");

            break;
        }

        sleep(Duration::from_secs(2)).await;
    }

    Ok(())
}
