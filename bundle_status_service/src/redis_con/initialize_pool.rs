use deadpool_redis::Runtime;

pub fn new_pool(sentinel_urls: Vec<String>, master_name: String) -> deadpool_redis::sentinel::Pool {
    let cfg = deadpool_redis::sentinel::Config {
        urls: Some(sentinel_urls),
        connections: None,
        server_type: deadpool_redis::sentinel::SentinelServerType::Master,
        master_name,
        ..Default::default()
    };

    cfg.create_pool(Some(Runtime::Tokio1))
        .expect("Failed to create Redis Sentinel pool")
}
