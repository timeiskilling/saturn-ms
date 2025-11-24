use std::time::Duration;

#[derive(Clone)]
pub struct BatchConfig {
    pub max_batch_size: usize,
    pub max_wait_time: Duration,
    pub channel_capacity: usize,
}

impl Default for BatchConfig {
    fn default() -> Self {
        Self {
            max_batch_size: 100,
            max_wait_time: Duration::from_millis(50),
            channel_capacity: 10000,
        }
    }
}