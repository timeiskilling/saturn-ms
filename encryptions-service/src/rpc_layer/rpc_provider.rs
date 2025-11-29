use async_trait::async_trait;
use base64::Engine;
use governor::{
    Quota, RateLimiter,
    clock::DefaultClock,
    state::{InMemoryState, NotKeyed},
};
use serde_json::{Value, json};
use solana_account_decoder::{UiAccount, UiAccountData, parse_account_data::ParsedAccount};
use solana_client::rpc_request::RpcError as SolanaRpcError;
use solana_client::{
    client_error::{ClientError, ClientErrorKind},
    nonblocking::rpc_client::RpcClient,
    rpc_response::RpcKeyedAccount,
};
use solana_sdk::{
    commitment_config::CommitmentConfig, hash::Hash, pubkey::Pubkey,
    signature::Signature, transaction::Transaction,
};
use std::{
    num::NonZeroU32,
    str::FromStr,
    sync::{Arc, atomic::Ordering},
    time::Duration,
};
use tokio::time::sleep;

use crate::{
    batching::batching_client::BatchedRpcClient,
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
    http_client: reqwest::Client,
    endpoint: String,
    
    rate_limiter: Arc<RateLimiter<NotKeyed, InMemoryState, DefaultClock>>,
    retry_config: RetryConfig,
    metrics: Arc<RpcMetrics>,
}

impl ManagedRpcClient {
    pub fn new(endpoint: String, requests_per_second: u32, retry_config: RetryConfig) -> Self {
        let solana_client = Arc::new(RpcClient::new(endpoint.clone()));
        let http_client = reqwest::Client::new();
        
        let quota = Quota::per_second(NonZeroU32::new(requests_per_second).unwrap())
            .allow_burst(NonZeroU32::new(requests_per_second / 10).unwrap());
        
        let rate_limiter = Arc::new(RateLimiter::direct(quota));
        let metrics = Arc::new(RpcMetrics::new());
        
        Self {
            inner : solana_client,
            http_client,
            endpoint,
            rate_limiter,
            retry_config,
            metrics,
        }
    }

    pub async fn execute_raw_json_rpc(
        &self,
        request_body: Value,
    ) -> Result<Value, RpcError> {
        let http_client = self.http_client.clone();
        let endpoint = self.endpoint.clone();
        
        self.execute_with_retry("raw_json_rpc", || {
            let client = http_client.clone();
            let url = endpoint.clone();
            let body = request_body.clone();
            
            async move {
                let response = client
                    .post(&url)
                    .json(&body)
                    .send()
                    .await
                    .map_err(ClientError::from)?;
                
                let json_response = response
                    .json::<Value>()
                    .await
                    .map_err(ClientError::from)?;
                
                Ok(json_response)
            }
        }).await
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
                matches!(rpc_err, solana_client::rpc_request::RpcError::RpcResponseError { code, .. } if *code == 429 || *code == 503 || *code == -32005)
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

#[async_trait]
impl SolanaRpcProvider for BatchedRpcClient {
    async fn get_latest_blockhash(&self) -> Result<Hash, RpcError> {
        let result = self
            .execute_batched_request("getLatestBlockhash", json!([]))
            .await?;

        let blockhash_str = result
            .get("value")
            .and_then(|v| v.get("blockhash"))
            .and_then(|b| b.as_str())
            .ok_or_else(|| RpcError::InvalidResponse {
                expected: "blockhash string".to_string(),
                got: result.to_string(),
            })?;

        Hash::from_str(blockhash_str).map_err(|_| RpcError::InvalidResponse {
            expected: "valid blockhash".to_string(),
            got: blockhash_str.to_string(),
        })
    }

    async fn send_transactions(&self, transaction: &Transaction) -> Result<Signature, RpcError> {
        let tx_bytes = bincode::serialize(transaction).map_err(|e| RpcError::InvalidResponse {
            expected: "serializable transaction".to_string(),
            got: e.to_string(),
        })?;

        let tx_base64 = base64::engine::general_purpose::STANDARD.encode(&tx_bytes);

        let result = self
            .execute_request(
                "sendTransaction",
                json!([tx_base64, {"encoding": "base64"}]),
            )
            .await?;

        let sig_str = result.as_str().ok_or_else(|| RpcError::InvalidResponse {
            expected: "signature string".to_string(),
            got: result.to_string(),
        })?;

        Signature::from_str(sig_str).map_err(|_| RpcError::InvalidResponse {
            expected: "valid signature".to_string(),
            got: sig_str.to_string(),
        })
    }

    async fn confirm_transaction(
        &self,
        signature: &Signature,
        _commitment: CommitmentConfig,
    ) -> Result<bool, RpcError> {
        let result = self
            .execute_batched_request("getSignatureStatuses", json!([[signature.to_string()]]))
            .await?;

        let confirmed = result
            .get("value")
            .and_then(|v| v.get(0))
            .map(|status| !status.is_null())
            .unwrap_or(false);

        Ok(confirmed)
    }

    async fn get_token_accounts_by_owner(
        &self,
        owner: &Pubkey,
        program_id: &Pubkey,
    ) -> Result<Vec<RpcKeyedAccount>, RpcError> {
        let result = self
            .execute_batched_request(
                "getTokenAccountsByOwnerV2",
                json!({
                    "ownerAddress": owner.to_string(),
                    "page": 1,
                    "limit": 1000,
                    "displayOptions": {
                        "showZeroBalance": false
                    }
                }),
            )
            .await?;
        let accounts_array = result
            .get("items")
            .or_else(|| result.get("token_accounts"))
            .and_then(|v| v.as_array())
            .ok_or_else(|| RpcError::InvalidResponse {
                expected: "items or token_accounts array".to_string(),
                got: result.to_string(),
            })?;

        let mut accounts = Vec::with_capacity(accounts_array.len());

        for account_json in accounts_array {
            let pubkey_str = account_json
                .get("address")
                .and_then(|v| v.as_str())
                .ok_or_else(|| RpcError::InvalidResponse {
                    expected: "account address".to_string(),
                    got: account_json.to_string(),
                })?;

            let mint = account_json
                .get("mint")
                .and_then(|v| v.as_str())
                .unwrap_or_default();

            let amount = account_json
                .get("amount")
                .map(|v| v.to_string().replace("\"", ""))
                .unwrap_or_else(|| "0".to_string());

            let decimals = account_json
                .get("decimals")
                .and_then(|v| v.as_u64())
                .unwrap_or(0);

            let ui_token_amount = json!({
                "amount": amount,
                "decimals": decimals,
                "uiAmount": null,
                "uiAmountString": null
            });
            let parsed_info = json!({
                "mint": mint,
                "owner": owner.to_string(),
                "state": "initialized",
                "tokenAmount": ui_token_amount,
                "isNative": false,
            });
            let parsed_data_json = json!({
                "program": "spl-token",
                "parsed": {
                    "type": "account",
                    "info": parsed_info
                },
                "space": 165
            });
            let parsed_account: ParsedAccount =
                serde_json::from_value(parsed_data_json).map_err(|e| {
                    RpcError::InvalidResponse {
                        expected: "valid ParsedAccount structure".to_string(),
                        got: e.to_string(),
                    }
                })?;
            accounts.push(RpcKeyedAccount {
                pubkey: pubkey_str.to_string(),
                account: UiAccount {
                    lamports: 0,
                    data: UiAccountData::Json(parsed_account),
                    owner: program_id.to_string(),
                    executable: false,
                    rent_epoch: 0,
                    space: Some(165),
                },
            });
        }

        Ok(accounts)
    }

    async fn get_balance(&self, pubkey: &Pubkey) -> Result<u64, RpcError> {
        let result = self
            .execute_batched_request("getBalance", json!([pubkey.to_string()]))
            .await?;

        let balance = result
            .get("value")
            .and_then(|v| v.as_u64())
            .ok_or_else(|| RpcError::InvalidResponse {
                expected: "balance value".to_string(),
                got: result.to_string(),
            })?;

        Ok(balance)
    }
}
