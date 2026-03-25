use crate::prelude::*;
use async_trait::async_trait;
use common::{binance::ExchangeInfo, models::TokenInfo};
use governor::{
    Quota, RateLimiter,
    clock::DefaultClock,
    state::{InMemoryState, NotKeyed},
};
use jupiter_trader_data::models::{
    api_models::TokenPricesV2,
    jupiter_models::{
        JupiterQuoteResponse, JupiterSwapInstructionsRsponse, QuoteOptions, QuoteRequestParams,
    },
};
use reqwest::Client;
use std::{num::NonZeroU32, sync::atomic::Ordering, time::Duration};
use tokio::time::sleep;

use saturn_errors::error::{JupiterReqestError, RpcError, SaturnTransactionsServiceError};

// pub trait SolanaRpcProvider: Send + Sync {
//     async fn get_latest_blockhash(&self) -> Result<Hash, RpcError>;
//     async fn send_transactions(&self, transaction: &Transaction) -> Result<Signature, RpcError>;
//     async fn confirm_transaction(&self, signature: &Signature, commitment: CommitmentConfig) -> Result<bool, RpcError>;
//     async fn get_token_accounts_by_owner(&self, owner: &Pubkey, program_id: &Pubkey) -> Result<Vec<RpcKeyedAccount>, RpcError>;
//     async fn get_balance(&self, pubkey: &Pubkey) -> Result<u64, RpcError>;
// }

#[async_trait]
pub trait JupiterProvider: Send + Sync {
    async fn create_swap_transaction<'a>(
        &'a self,
        input_mint: &'a str,
        output_mint: &'a str,
        amount: u64,
        slippage_bps: u16,
        options: QuoteOptions,
        pubkey: &'a Pubkey,
    ) -> Result<
        (JupiterQuoteResponse, JupiterSwapInstructionsRsponse),
        SaturnTransactionsServiceError,
    >;

    async fn get_list_of_tokens<'a>(
        &'a self,
        query: &str,
        binance_url: &str,
    ) -> Result<Vec<TokenInfo>, SaturnTransactionsServiceError>;
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
                // .connect_timeout(Duration::from_secs(5))
                .tcp_keepalive(Duration::from_secs(60))
                // .http2_keep_alive_interval(Duration::from_secs(30))
                // .http2_keep_alive_timeout(Duration::from_secs(10))
                // .http2_prior_knowledge()
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

    async fn perform_swap_transaction_request(
        client: Arc<reqwest::Client>,
        base_url: Arc<String>,
        pubkey_log: Vec<u8>,
        params: QuoteRequestParams,
        pubkey_str: String,
    ) -> anyhow::Result<(JupiterQuoteResponse, JupiterSwapInstructionsRsponse)> {
        let url = format!("{}/swap/v2/build", base_url);

        let mut query = vec![
            ("inputMint", params.input_mint.clone()),
            ("outputMint", params.output_mint.clone()),
            ("amount", params.amount.clone()),
            ("slippageBps", params.slippage_bps.clone()),
            ("taker", pubkey_str),
        ];

        for (k, v) in &params.additional_params {
            query.push((*k, v.clone()));
        }

        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            "Accept",
            reqwest::header::HeaderValue::from_static("application/json"),
        );

        let response = client
            .get(&url)
            .query(&query)
            .headers(headers)
            .send()
            .await
            .map_err(|e| {
                tracing::error!(
                    "perform_swap_transaction_request : Detailed network error: {:#?}",
                    e
                );
                anyhow::Error::new(e).context("Request failed")
            })?;

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
                "Jupiter build API returned error"
            );

            return Err(anyhow::anyhow!(
                "Jupiter build error (status {}): {}",
                status.as_u16(),
                error_txt
            ));
        }

        let bytes = response.bytes().await?;

        let quote: JupiterQuoteResponse = serde_json::from_slice(&bytes)
            .map_err(|e| anyhow::anyhow!("Failed to parse build quote response: {}", e))?;
        let swap_instructions: JupiterSwapInstructionsRsponse = serde_json::from_slice(&bytes)
            .map_err(|e| {
                anyhow::anyhow!("Failed to parse build swap instructions response: {}", e)
            })?;

        tracing::info!(
            pubkey = ?pubkey_log,
            "Successfully created swap transaction instructions"
        );

        Ok((quote, swap_instructions))
    }

    pub async fn get_list_of_tokens(
        client: Arc<reqwest::Client>,
        base_url: Arc<String>,
        binance_url: &str,
        query: &str,
    ) -> anyhow::Result<Vec<TokenInfo>> {
        let url = format!("{}/tokens/v2/tag", base_url);

        let binance_tokens: ExchangeInfo = client
            .get(binance_url)
            .send()
            .await
            .map_err(|e| tracing::error!("Failed to fetch Binance exchangeInfo: {}", e))
            .unwrap()
            .json()
            .await
            .map_err(|e| {
                tracing::error!(
                    "binance get_list_of_tokens : Detailed network error: {:#?}",
                    e
                );
                anyhow::Error::new(e).context("Binance Request failed")
            })?;

        let binance_base_assets: std::collections::HashSet<String> = binance_tokens
            .symbols
            .iter()
            .filter(|s| s.quote_asset == "USDT" && s.status == "TRADING")
            .map(|s| s.base_asset.to_uppercase())
            .collect();

        let jupiter_tokens: TokenPricesV2 = client
            .get(url)
            .query(&[("query", query)])
            .send()
            .await
            .map_err(|e| tracing::error!("Failed to fetch Jupiter tokens: {}", e))
            .unwrap()
            .json()
            .await
            .map_err(|e| {
                tracing::error!(
                    "jupiter get_list_of_tokens : Detailed network error: {:#?}",
                    e
                );
                anyhow::Error::new(e).context("Jupiter request failed")
            })?;

        Ok(jupiter_tokens
            .into_iter()
            .filter(|t| binance_base_assets.contains(&t.symbol.to_uppercase()))
            .map(|t| TokenInfo {
                symbol: t.symbol.to_uppercase(),
                mint: t.id,
                decimals: t.decimals as u8,
            })
            .collect())
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
}

#[async_trait]
impl JupiterProvider for HttpManager {
    async fn create_swap_transaction<'a>(
        &'a self,
        input_mint: &'a str,
        output_mint: &'a str,
        amount: u64,
        slippage_bps: u16,
        options: QuoteOptions,
        pubkey: &'a Pubkey,
    ) -> Result<
        (JupiterQuoteResponse, JupiterSwapInstructionsRsponse),
        SaturnTransactionsServiceError,
    > {
        let pubkey_string = pubkey.to_string();
        let pubkey_bytes = pubkey.as_array().to_vec();

        let mut params = QuoteRequestParams {
            input_mint: input_mint.to_string(),
            output_mint: output_mint.to_string(),
            amount: amount.to_string(),
            slippage_bps: slippage_bps.to_string(),
            additional_params: options.cleaned().to_params(),
        };

        // Match the previous wrapAndUnwrapSol logic from JupiterSwapRequest
        params
            .additional_params
            .push(("wrapAndUnwrapSol", "true".to_string()));

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
                let p = params.clone();
                let pk_log = pubkey_bytes.clone();
                let pk_str = pubkey_string.clone();

                async move {
                    Self::perform_swap_transaction_request(client, url, pk_log, p, pk_str).await
                }
            })
            .await;

        result.map_err(|rpc_error| {
            let jupiter_error = self.convert_rpc_to_jupiter_error(rpc_error, "create_swap");
            SaturnTransactionsServiceError::JupiterError(jupiter_error)
        })
    }

    async fn get_list_of_tokens<'a>(
        &'a self,
        query: &str,
        binance_url: &str,
    ) -> Result<Vec<TokenInfo>, SaturnTransactionsServiceError> {
        tracing::info!("Make Price tokens request");

        let result = self
            .execute_with_retry("get_list_of_tokens", move || {
                let client = self.inner.clone();
                let url = self.base_url.clone();

                async move { Self::get_list_of_tokens(client, url, binance_url, query).await }
            })
            .await;

        result.map_err(|rpc_error| {
            let jupiter_error = self.convert_rpc_to_jupiter_error(rpc_error, "get_list_of_tokens");
            SaturnTransactionsServiceError::JupiterError(jupiter_error)
        })
    }
}
