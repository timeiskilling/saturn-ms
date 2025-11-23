use std::time::Duration;


#[derive(Clone)]
pub struct RetryConfig {
    pub max_attempts : usize,
    pub initial_backoff : Duration,
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

