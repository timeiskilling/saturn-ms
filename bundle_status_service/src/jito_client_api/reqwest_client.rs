use async_trait::async_trait;
use governor::{
    Quota, RateLimiter,
    clock::DefaultClock,
    state::{InMemoryState, NotKeyed},
};
use jupiter_trader_data::models::jupiter_models::{
    JupiterQuoteResponse, JupiterSwapInstructionsRsponse, JupiterSwapRequest, PriorityLevel,
    QuoteOptions,
};
use reqwest::Client;
use solana_sdk::pubkey::Pubkey;
use std::{
    num::NonZeroU32,
    sync::{Arc, atomic::Ordering},
    time::Duration,
};
use tokio::time::sleep;

use crate::jito_client_api::{
    error_code::{JupiterReqestError, RpcError, SaturnTransactionsServiceError},
    retry_config::{RetryConfig, RpcMetrics, RpcStats},
};

#[derive(Clone)]
struct QuoteRequestParams {
    input_mint: String,
    output_mint: String,
    amount: String,
    slippage_bps: String,
    additional_params: Vec<(&'static str, String)>,
}

// pub trait SolanaRpcProvider: Send + Sync {
//     async fn get_latest_blockhash(&self) -> Result<Hash, RpcError>;
//     async fn send_transactions(&self, transaction: &Transaction) -> Result<Signature, RpcError>;
//     async fn confirm_transaction(&self, signature: &Signature, commitment: CommitmentConfig) -> Result<bool, RpcError>;
//     async fn get_token_accounts_by_owner(&self, owner: &Pubkey, program_id: &Pubkey) -> Result<Vec<RpcKeyedAccount>, RpcError>;
//     async fn get_balance(&self, pubkey: &Pubkey) -> Result<u64, RpcError>;
// }

#[async_trait]
pub trait JupiterProvider: Send + Sync {
    async fn get_quote_with_options<'a>(
        &'a self,
        input_mint: &'a str,
        output_mint: &'a str,
        amount: u64,
        slippage_bps: u16,
        options: QuoteOptions,
    ) -> Result<JupiterQuoteResponse, SaturnTransactionsServiceError>;

    async fn create_swap_transaction<'a>(
        &'a self,
        quote: JupiterQuoteResponse,
        pubkey: &'a Pubkey,
    ) -> Result<JupiterSwapInstructionsRsponse, SaturnTransactionsServiceError>;
}

pub struct HttpManager {
    inner: Arc<Client>,
    rate_limiter: Arc<RateLimiter<NotKeyed, InMemoryState, DefaultClock>>,
    retry_config: RetryConfig,
    metrics: Arc<RpcMetrics>,
    base_url: Arc<String>,
}

impl HttpManager {
    pub fn new(
        base_url: String,
        requests_per_second: u32,
        retry_config: RetryConfig,
        _uuid: Option<String>,
        api_key: &str,
    ) -> Self {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            "x-api-key",
            reqwest::header::HeaderValue::from_str(api_key).unwrap(),
        );

        let inner = Arc::new(
            reqwest::ClientBuilder::new()
                .default_headers(headers)
                .pool_max_idle_per_host(200)
                .pool_idle_timeout(Duration::from_secs(120))
                .timeout(Duration::from_secs(15))
                .connect_timeout(Duration::from_secs(5))
                .tcp_keepalive(Duration::from_secs(60))
                .http2_keep_alive_interval(Duration::from_secs(30))
                .http2_keep_alive_timeout(Duration::from_secs(10))
                .http2_prior_knowledge()
                .build()
                .expect("Failed to build HTTP client"),
        );

        let quota = Quota::per_second(NonZeroU32::new(requests_per_second).unwrap())
            .allow_burst(NonZeroU32::new(requests_per_second / 10).unwrap());

        let rate_limiter = Arc::new(RateLimiter::direct(quota));
        let metrics = Arc::new(RpcMetrics::new());
        Self {
            inner,
            rate_limiter,
            retry_config,
            metrics,
            base_url: Arc::new(base_url),
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
                    let is_retryable = if let Some(reqwest_err) = e.downcast_ref::<reqwest::Error>()
                    {
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

    async fn perform_quote_request(
        client: Arc<reqwest::Client>,
        base_url: Arc<String>,
        params: QuoteRequestParams,
    ) -> anyhow::Result<JupiterQuoteResponse> {
        let url = format!("{}/quote", base_url);

        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            "Accept",
            reqwest::header::HeaderValue::from_static("application/json"),
        );

        let response = client
            .get(&url)
            .query(&[
                ("inputMint", params.input_mint.as_str()),
                ("outputMint", params.output_mint.as_str()),
                ("amount", params.amount.as_str()),
                ("slippageBps", params.slippage_bps.as_str()),
                ("platformFeeBps", "20"),
            ])
            .query(&params.additional_params)
            .headers(headers)
            .send()
            .await
            .map_err(|e| anyhow::anyhow!("Request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_txt = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!(
                "Jupiter API error (status {}): {}",
                status,
                error_txt
            ));
        }

        response
            .json()
            .await
            .map_err(|e| anyhow::anyhow!("Failed to parse: {}", e))
    }

    async fn perform_swap_transaction_request(
        client: Arc<reqwest::Client>,
        base_url: Arc<String>,
        payload: JupiterSwapRequest,
        pubkey_log: Vec<u8>,
    ) -> anyhow::Result<JupiterSwapInstructionsRsponse> {
        let url = format!("{}/swap-instructions", base_url);

        let response = client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .map_err(|e| anyhow::anyhow!("Swap instruction request failed: {}", e))?;

        let status = response.status();
        if !status.is_success() {
            let error_txt = response
                .text()
                .await
                .unwrap_or_else(|_| "Failed to read error response".to_string());

            tracing::error!(
                status = status.as_u16(),
                pubkey = ?pubkey_log,
                error = %error_txt,
                "Jupiter swap-instructions API returned error"
            );

            return Err(anyhow::anyhow!(
                "Jupiter swap-instructions error (status {}): {}",
                status.as_u16(),
                error_txt
            ));
        }

        let swap_instructions = response
            .json()
            .await
            .map_err(|e| anyhow::anyhow!("Failed to parse swap instructions response: {}", e))?;

        tracing::info!(
            pubkey = ?pubkey_log,
            "Successfully created swap transaction instructions"
        );

        Ok(swap_instructions)
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

    fn convert_rpc_to_jupiter_error(
        &self,
        rpc_error: RpcError,
        operation: &str,
    ) -> JupiterReqestError {
        match rpc_error {
            RpcError::RateLimitExceeded {
                retry_after_seconds,
            } => JupiterReqestError::RateLimitExceeded {
                retry_after_seconds,
                endpoint: self.base_url.to_string(),
            },
            RpcError::Timeout {
                endpoint,
                timeout_ms,
            } => JupiterReqestError::TimeoutExceeded {
                endpoint,
                timeout_ms,
                operation: operation.to_string(),
            },
            RpcError::ConnectionFailed { endpoint, reason } => JupiterReqestError::NetworkError {
                operation: operation.to_string(),
                reason: format!("Connection to {} failed: {}", endpoint, reason),
            },
            RpcError::RpcMethodFailed {
                method,
                code,
                message,
            } => JupiterReqestError::InvalidApiResponse {
                operation: operation.to_string(),
                status_code: code as u16,
                body: format!("Method '{}' failed: {}", method, message),
            },
            RpcError::InvalidResponse { expected, got } => JupiterReqestError::ParseResponseErr {
                reason: format!("Expected {}, got {}", expected, got),
            },
            _ => JupiterReqestError::NetworkError {
                operation: operation.to_string(),
                reason: rpc_error.to_string(),
            },
        }
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
        } else if error_str.to_lowercase().contains("429")
            || error_str.to_lowercase().contains("rate limit")
        {
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

    // pub async fn get_quote_with_options(
    //     &self,
    //     input_mint: &str,
    //     output_mint: &str,
    //     amount: u64,
    //     slippage_bps: u16,
    //     options: QuoteOptions,
    // ) -> Result<serde_json::Value, RpcError> {
    //     self.execute_with_retry("get_quote_with_options", || {
    //         let inner = self.inner.clone();
    //         let ids = bundle_ids.clone();
    //         async move { get_in_flight_bundle_statuses(ids).await }
    //     })
    //     .await
    // }

    // pub async fn send_bundle(
    //     &self,
    //     params: Option<serde_json::Value>,
    //     uuid: Option<&str>,
    // ) -> Result<serde_json::Value, RpcError> {
    //     self.execute_with_retry("send_bundle", || {
    //         let inner = self.inner.clone();
    //         let params = params.clone();
    //         async move { inner.send_bundle(params, uuid).await }
    //     })
    //     .await
    // }

    // pub async fn get_bundle_statuses(
    //     &self,
    //     bundle_ids: Vec<String>,
    // ) -> Result<serde_json::Value, RpcError> {
    //     self.execute_with_retry("get_bundle_statuses", || {
    //         let inner = self.inner.clone();
    //         let ids = bundle_ids.clone();
    //         async move { inner.get_bundle_statuses(ids).await }
    //     })
    //     .await
    // }
}

#[async_trait]
impl JupiterProvider for HttpManager {
    async fn get_quote_with_options<'a>(
        &'a self,
        input_mint: &'a str,
        output_mint: &'a str,
        amount: u64,
        slippage_bps: u16,
        options: QuoteOptions,
    ) -> Result<JupiterQuoteResponse, SaturnTransactionsServiceError> {
        let params = QuoteRequestParams {
            input_mint: input_mint.to_string(),
            output_mint: output_mint.to_string(),
            amount: amount.to_string(),
            slippage_bps: slippage_bps.to_string(),
            additional_params: options.cleaned().to_params(),
        };

        let base_url = self.base_url.clone();
        let inner = self.inner.clone();

        let result = self
            .execute_with_retry("get_quote_with_options", move || {
                let client = inner.clone();
                let url = base_url.clone();
                let p = params.clone();

                async move { Self::perform_quote_request(client, url, p).await }
            })
            .await;

        result.map_err(|rpc_error| {
            let jupiter_error = self.convert_rpc_to_jupiter_error(rpc_error, "get_quote");
            SaturnTransactionsServiceError::JupiterError(jupiter_error)
        })
    }

    async fn create_swap_transaction<'a>(
        &'a self,
        quote: JupiterQuoteResponse,
        pubkey: &'a Pubkey,
    ) -> Result<JupiterSwapInstructionsRsponse, SaturnTransactionsServiceError> {
        let pubkey_string = pubkey.to_string();
        let pubkey_bytes = pubkey.as_array().to_vec();

        let swap_request =
            JupiterSwapRequest::new(*pubkey, quote, 100_000_000, PriorityLevel::VeryHigh, true);

        tracing::info!(
            pubkey = %pubkey_string,
            "Creating swap transaction with retry support"
        );

        let base_url = self.base_url.clone();
        let inner = self.inner.clone();

        let result = self
            .execute_with_retry("create_swap_transaction", move || {
                let client = inner.clone();
                let url = base_url.clone();
                let payload = swap_request.clone();
                let pk_log = pubkey_bytes.clone();

                async move {
                    Self::perform_swap_transaction_request(client, url, payload, pk_log).await
                }
            })
            .await;

        result.map_err(|rpc_error| {
            let jupiter_error = self.convert_rpc_to_jupiter_error(rpc_error, "create_swap");
            SaturnTransactionsServiceError::JupiterError(jupiter_error)
        })
    }
}
