use std::sync::atomic::{AtomicU64, Ordering};

pub struct RpcMetrics {
    pub total_requests: AtomicU64,
    pub failed_requests: AtomicU64,
    pub rate_limited_requests: AtomicU64,
    pub retried_requests: AtomicU64,
}

#[derive(Debug, Clone)]
pub struct RpcStats {
    pub total: u64,
    pub failed: u64,
    pub rate_limited: u64,
    pub retried: u64,
}

impl RpcMetrics {
    pub fn new() -> Self {
        Self {
            total_requests: AtomicU64::new(0),
            failed_requests: AtomicU64::new(0),
            rate_limited_requests: AtomicU64::new(0),
            retried_requests: AtomicU64::new(0),
        }
    }

    pub fn get_stats(&self) -> RpcStats {
        RpcStats {
            total: self.total_requests.load(Ordering::Relaxed),
            failed: self.failed_requests.load(Ordering::Relaxed),
            rate_limited: self.rate_limited_requests.load(Ordering::Relaxed),
            retried: self.retried_requests.load(Ordering::Relaxed),
        }
    }
}
