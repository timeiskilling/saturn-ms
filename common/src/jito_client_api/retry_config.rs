use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;

#[derive(Clone)]
pub struct RetryConfig {
    pub max_attempts: usize,
    pub initial_backoff: Duration,
    pub backoff_multiplier: f64,
    pub max_backoff: Duration,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            initial_backoff: Duration::from_millis(100),
            backoff_multiplier: 2.0,
            max_backoff: Duration::from_secs(5),
        }
    }
}

pub struct RpcMetrics {
    pub total_requests: AtomicU64,
    pub failed_requests: AtomicU64,
    pub rate_limited_requests: AtomicU64,
    pub retried_requests: AtomicU64,
}

#[derive(Debug, Clone, Default)]
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

impl Default for RpcMetrics {
    fn default() -> Self {
        Self {
            total_requests: AtomicU64::new(0),
            failed_requests: AtomicU64::new(0),
            rate_limited_requests: AtomicU64::new(0),
            retried_requests: AtomicU64::new(0),
        }
    }
}
