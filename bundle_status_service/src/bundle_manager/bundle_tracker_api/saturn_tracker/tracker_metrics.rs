#[derive(Debug, Default)]
pub struct TrackerMetrics {
    pub total_bundles: std::sync::atomic::AtomicU64,
    pub redis_operations: std::sync::atomic::AtomicU64,
    pub api_calls: std::sync::atomic::AtomicU64,
    pub errors: std::sync::atomic::AtomicU64,
    pub stage_transitions: std::sync::atomic::AtomicU64,
    pub invalid_transitions: std::sync::atomic::AtomicU64,
}
