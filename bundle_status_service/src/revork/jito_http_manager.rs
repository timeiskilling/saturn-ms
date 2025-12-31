use jito_sdk_rust::JitoJsonRpcSDK;
use std::{
    num::NonZeroU32,
    sync::{Arc, atomic::Ordering},
    time::Duration,
};
use tokio::time::sleep;

use governor::{
    Quota, RateLimiter,
    clock::DefaultClock,
    state::{InMemoryState, NotKeyed},
};

use crate::revork::{
    error_code::RpcError,
    retry_config::{RetryConfig, RpcMetrics, RpcStats},
};
pub struct JitoHttpManager {
    inner: Arc<JitoJsonRpcSDK>,
    rate_limiter: Arc<RateLimiter<NotKeyed, InMemoryState, DefaultClock>>,
    retry_config: RetryConfig,
    metrics: Arc<RpcMetrics>,
}

impl JitoHttpManager {
    pub fn new(
        base_url: String,
        requests_per_second: u32,
        retry_config: RetryConfig,
        uuid: Option<String>,
    ) -> Self {
        let inner = Arc::new(JitoJsonRpcSDK::new(&base_url, uuid));

        let quota = Quota::per_second(NonZeroU32::new(requests_per_second).unwrap())
            .allow_burst(NonZeroU32::new(requests_per_second / 10).unwrap());

        let rate_limiter = Arc::new(RateLimiter::direct(quota));
        let metrics = Arc::new(RpcMetrics::new());
        Self {
            inner,
            rate_limiter,
            retry_config,
            metrics,
        }
    }

    fn is_retryable_error(&self, error: &reqwest::Error) -> bool {
        match error.status() {
            Some(status) => matches!(status.as_u16(), 429 | 500 | 502 | 503 | 504),
            None => error.is_timeout() || error.is_connect() || error.is_request(),
        }
    }

    async fn execute_with_retry<F, T, Fut>(
        &self,
        operation_name: &str,
        operation: F,
    ) -> Result<T, RpcError>
    where
        F: Fn() -> Fut,
        Fut: std::future::Future<Output = Result<T, anyhow::Error>>,
    {
        self.metrics.total_requests.fetch_add(1, Ordering::Relaxed);
        let mut attempt = 0;
        let mut backoff = self.retry_config.initial_backoff;

        loop {
            attempt += 1;

            while self.rate_limiter.check().is_err() {
                self.metrics
                    .rate_limited_requests
                    .fetch_add(1, Ordering::Relaxed);
                sleep(Duration::from_millis(50)).await;
            }

            match operation().await {
                Ok(result) => {
                    if attempt > 1 {
                        self.metrics
                            .retried_requests
                            .fetch_add(1, Ordering::Relaxed);
                    }

                    return Ok(result);
                }
                Err(e) => {
                    let is_retryable = if let Some(reqwest_err) = e.downcast_ref::<reqwest::Error>() {
                        self.is_retryable_error(reqwest_err)
                    } else {
                        let error_str = e.to_string().to_lowercase();
                        error_str.contains("timeout") 
                            || error_str.contains("connection") 
                            || error_str.contains("429")
                            || error_str.contains("503")
                            || error_str.contains("502")
                    };

                    if !is_retryable || attempt >= self.retry_config.max_attempts {
                        self.metrics.failed_requests.fetch_add(1, Ordering::Relaxed);
                        return Err(self.convert_anyhow_error(e));
                    }

                    tracing::warn!(
                        operation = operation_name,
                        attempt = attempt,
                        max_attempts = self.retry_config.max_attempts,
                        backoff_ms = backoff.as_millis(),
                        error = %e,
                        "Jito API request failed, retrying"
                    );

                    sleep(backoff).await;

                    backoff = Duration::from_secs_f64(
                        (backoff.as_secs_f64() * self.retry_config.backoff_multiplier)
                            .min(self.retry_config.max_backoff.as_secs_f64()),
                    );
                }
            }
        }
    }

    fn convert_error(&self, error: &reqwest::Error) -> RpcError {
        if error.is_timeout() {
            return RpcError::Timeout {
                endpoint: "JitoEndpoint".to_string(),
                timeout_ms: 30_000,
            };
        }
        // 429 Nginx/Cloudflare
        if let Some(status) = error.status()
            && status == 429
        {
            return RpcError::RateLimitExceeded {
                retry_after_seconds: None,
            };
        }
        RpcError::ConnectionFailed {
            endpoint: "JitoEndpoint{}".to_string(),
            reason: error.to_string(),
        }
    }

    pub fn get_stats(&self) -> RpcStats {
        self.metrics.get_stats()
    }


     fn convert_anyhow_error(&self, error: anyhow::Error) -> RpcError {
        if let Some(reqwest_err) = error.downcast_ref::<reqwest::Error>() {
            return self.convert_error(reqwest_err);
        }

        let error_str = error.to_string();
        
        if error_str.to_lowercase().contains("timeout") {
            RpcError::Timeout {
                endpoint: "JitoEndpoint".to_string(),
                timeout_ms: 30_000,
            }
        } else if error_str.to_lowercase().contains("429") || error_str.to_lowercase().contains("rate limit") {
            RpcError::RateLimitExceeded {
                retry_after_seconds: None,
            }
        } else {
            RpcError::ConnectionFailed {
                endpoint: "JitoEndpoint".to_string(),
                reason: error_str,
            }
        }
    }
    
    pub async fn get_in_flight_bundle_statuses(
        &self,
        bundle_ids: Vec<String>,
    ) -> Result<serde_json::Value, RpcError> {
        self.execute_with_retry("get_in_flight_bundle_statuses", || {
            let inner = self.inner.clone();
            let ids = bundle_ids.clone();
            async move {
                inner.get_in_flight_bundle_statuses(ids).await
            }
        })
        .await
    }

    pub async fn send_bundle(&self,params: Option<serde_json::Value>, uuid: Option<&str>) -> Result<serde_json::Value, RpcError> {
        self.execute_with_retry("send_bundle", || {
            let inner = self.inner.clone();
            let params = params.clone();
            async move {
                inner.send_bundle(params, uuid).await
            }
        })
        .await
    }

    pub async fn get_bundle_statuses(
        &self,
        bundle_ids: Vec<String>,
    ) -> Result<serde_json::Value, RpcError> {
        self.execute_with_retry("get_bundle_statuses", || {
            let inner = self.inner.clone();
            let ids = bundle_ids.clone();
            async move {
                inner.get_bundle_statuses(ids).await
            }
        })
        .await
    }
    
}

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
