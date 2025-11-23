use async_trait::async_trait;
use governor::{
    Quota, RateLimiter,
    clock::DefaultClock,
    state::{InMemoryState, NotKeyed},
};
use solana_client::rpc_request::RpcError as SolanaRpcError;
use solana_client::{
    client_error::{ClientError, ClientErrorKind},
    nonblocking::rpc_client::RpcClient,
    rpc_response::RpcKeyedAccount,
};
use solana_sdk::{
    account::Account, commitment_config::CommitmentConfig, hash::Hash, pubkey::Pubkey, signature::Signature, transaction::Transaction
};
use std::{
    num::NonZeroU32,
    sync::{Arc, atomic::Ordering},
    time::Duration,
};
use tokio::time::sleep;

use crate::{
    error_handling::error_code::RpcError,
    rpc_layer::{
        retry_config::RetryConfig,
        rpc_metrics::{RpcMetrics, RpcStats},
    },
};

#[async_trait]
pub trait SolanaRpcProvider: Send + Sync {
    async fn get_latest_blockhash(&self) -> Result<Hash, RpcError>;

    async fn send_transactions(&self, transaction: &Transaction) -> Result<Signature, RpcError>;

    async fn confirm_transaction(
        &self,
        signature: &Signature,
        commitment: CommitmentConfig,
    ) -> Result<bool, RpcError>;

    async fn get_token_accounts_by_owner(
        &self,
        owner: &Pubkey,
        program_id: &Pubkey,
    ) -> Result<Vec<RpcKeyedAccount>, RpcError>;

    async fn get_balance(&self, pubkey: &Pubkey) -> Result<u64, RpcError>;

    // async fn get_account(&self, pubkey: &Pubkey) -> Result<Account, RpcError>;
}

pub struct ManagedRpcClient {
    inner: Arc<RpcClient>,
    rate_limiter: Arc<RateLimiter<NotKeyed, InMemoryState, DefaultClock>>,
    retry_config: RetryConfig,
    metrics: Arc<RpcMetrics>,
}

impl ManagedRpcClient {
    pub fn new(endpoint: String, requests_per_second: u32, retry_config: RetryConfig) -> Self {
        let inner = Arc::new(RpcClient::new(endpoint));

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

    fn is_retryable_error(&self, error: &ClientError) -> bool {
        match error.kind() {
            ClientErrorKind::Reqwest(err) => {
                if let Some(status) = err.status() {
                    matches!(status.as_u16(), 429 | 500 | 502 | 503 | 504)
                } else {
                    err.is_timeout() || err.is_connect() || err.is_request()
                }
            }

            ClientErrorKind::RpcError(rpc_err) => {
                match rpc_err {
                    solana_client::rpc_request::RpcError::RpcResponseError { code, .. } => {
                        match *code {
                            429 | 503 => true,
                            // -32005: Node is behind
                            -32005 => true,

                            _ => false,
                        }
                    }
                    _ => false,
                }
            }
            _ => false,
        }
    }

    async fn execute_with_retry<F, T, Fut>(
        &self,
        operation_name: &str,
        operation: F,
    ) -> Result<T, RpcError>
    where
        F: Fn() -> Fut,
        Fut: std::future::Future<Output = Result<T, solana_client::client_error::ClientError>>,
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
                    if !self.is_retryable_error(&e) || attempt >= self.retry_config.max_attempts {
                        self.metrics.failed_requests.fetch_add(1, Ordering::Relaxed);
                        return Err(self.convert_error(e));
                    }

                    tracing::warn!(
                        operation = operation_name,
                        attempt = attempt,
                        max_attempts = self.retry_config.max_attempts,
                        backoff_ms = backoff.as_millis(),
                        error = %e,
                        "RPC request failed, retrying"
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

    fn convert_error(&self, error: ClientError) -> RpcError {
        match error.kind() {
            ClientErrorKind::RpcError(rpc_err) => match rpc_err {
                SolanaRpcError::RpcResponseError { code, message, .. } => {
                    if *code == 429 {
                        return RpcError::RateLimitExceeded {
                            retry_after_seconds: None,
                        };
                    }
                    RpcError::RpcMethodFailed {
                        method: "unknown".to_string(),
                        code: *code,
                        message: message.clone(),
                    }
                }
                SolanaRpcError::ParseError(msg) => RpcError::InvalidResponse {
                    expected: "valid json-rpc response".to_string(),
                    got: msg.clone(),
                },
                _ => RpcError::ConnectionFailed {
                    endpoint: "helius".to_string(),
                    reason: format!("RPC Protocol Error: {:?}", rpc_err),
                },
            },
            // (HTTP, TCP, Timeout)
            ClientErrorKind::Reqwest(req_err) => {
                if req_err.is_timeout() {
                    return RpcError::Timeout {
                        endpoint: "helius".to_string(),
                        timeout_ms: 30_000,
                    };
                }
                // 429 Nginx/Cloudflare
                if let Some(status) = req_err.status()
                    && status == 429
                {
                    return RpcError::RateLimitExceeded {
                        retry_after_seconds: None,
                    };
                }
                RpcError::ConnectionFailed {
                    endpoint: "helius".to_string(),
                    reason: req_err.to_string(),
                }
            }
            _ => RpcError::ConnectionFailed {
                endpoint: "helius".to_string(),
                reason: error.to_string(),
            },
        }
    }

    pub fn get_stats(&self) -> RpcStats {
        self.metrics.get_stats()
    }
}

#[async_trait]
impl SolanaRpcProvider for ManagedRpcClient {
    async fn get_latest_blockhash(&self) -> Result<Hash, RpcError> {
        let inner = self.inner.clone();

        self.execute_with_retry("get_latest_blockhash", || async {
            inner.get_latest_blockhash().await
        })
        .await
    }

    async fn send_transactions(&self, transaction: &Transaction) -> Result<Signature, RpcError> {
        let inner = self.inner.clone();
        let tx = transaction.clone();

        self.execute_with_retry("send_transaction", || async {
            inner.send_and_confirm_transaction(&tx).await
        })
        .await
    }

    async fn confirm_transaction(
        &self,
        signature: &Signature,
        commitment: CommitmentConfig,
    ) -> Result<bool, RpcError> {
        let inner = self.inner.clone();
        let sig = *signature;

        self.execute_with_retry("confirm_transaction", || async {
            inner
                .confirm_transaction_with_commitment(&sig, commitment)
                .await
                .map(|response| response.value)
        })
        .await
    }

    async fn get_token_accounts_by_owner(
        &self,
        owner: &Pubkey,
        program_id: &Pubkey,
    ) -> Result<Vec<RpcKeyedAccount>, RpcError> {
        use solana_client::rpc_request::TokenAccountsFilter;

        let inner = self.inner.clone();
        let owner_key = *owner;
        let prog_id = *program_id;

        let result = self
            .execute_with_retry("get_token_accounts_by_owner", || async {
                inner
                    .get_token_accounts_by_owner(
                        &owner_key,
                        TokenAccountsFilter::ProgramId(prog_id),
                    )
                    .await
            })
            .await?;

        Ok(result)
    }

    async fn get_balance(&self, pubkey: &Pubkey) -> Result<u64, RpcError> {
        let inner = self.inner.clone();
        let key = *pubkey;

        self.execute_with_retry("get_balance", || async { inner.get_balance(&key).await })
            .await
    }

    // async fn get_account(&self, pubkey: &Pubkey) -> Result<Account, RpcError> {
    //     let inner = self.inner.clone();

    //    let data = self.execute_with_retry("get_account", || async {
    //         inner
    //             .get_account_with_commitment(pubkey, CommitmentConfig::confirmed())
    //             .await?
    //     })
    //     .await
    // }
}
