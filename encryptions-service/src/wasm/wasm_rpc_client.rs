#![cfg(target_arch = "wasm32")]

use async_trait::async_trait;
use base64::Engine;
use serde_json::{json, Value};
use solana_sdk::{
    commitment_config::CommitmentConfig,
    hash::Hash,
    pubkey::Pubkey,
    signature::Signature,
    transaction::Transaction,
};
use std::str::FromStr;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{Request, RequestInit, RequestMode, Response};

use crate::error_handling::error_code::RpcError;
use crate::wasm::wasm_types::RpcKeyedAccount;

#[async_trait(?Send)]  
pub trait SolanaRpcProvider {
    async fn get_latest_blockhash(&self) -> Result<Hash, RpcError>;
    async fn send_transactions(&self, transaction: &Transaction) -> Result<Signature, RpcError>;
    async fn confirm_transaction(&self, signature: &Signature, commitment: CommitmentConfig) -> Result<bool, RpcError>;
    async fn get_token_accounts_by_owner(&self, owner: &Pubkey, program_id: &Pubkey) -> Result<Vec<RpcKeyedAccount>, RpcError>;
    async fn get_balance(&self, pubkey: &Pubkey) -> Result<u64, RpcError>;
}

pub struct WasmRpcClient {
    endpoint: String,
    request_counter: std::sync::atomic::AtomicU64,
}

impl WasmRpcClient {
    pub fn new(endpoint: String) -> Self {
        Self {
            endpoint,
            request_counter: std::sync::atomic::AtomicU64::new(0),
        }
    }

    async fn call_rpc_method(
        &self,
        method: &str,
        params: Value,
    ) -> Result<Value, RpcError> {
        let request_id = self
            .request_counter
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);

        let rpc_request = json!({
            "jsonrpc": "2.0",
            "id": request_id,
            "method": method,
            "params": params,
        });

        let request_body = rpc_request.to_string();

        let opts = RequestInit::new();
        opts.set_method("POST");
        opts.set_mode(RequestMode::Cors);
        opts.set_body(&JsValue::from_str(&request_body));

        let request = Request::new_with_str_and_init(&self.endpoint, &opts)
            .map_err(|e| RpcError::ConnectionFailed {
                endpoint: self.endpoint.clone(),
                reason: format!("Failed to create request: {:?}", e),
            })?;

        request
            .headers()
            .set("Content-Type", "application/json")
            .map_err(|e| RpcError::ConnectionFailed {
                endpoint: self.endpoint.clone(),
                reason: format!("Failed to set headers: {:?}", e),
            })?;

        let window = web_sys::window().ok_or_else(|| RpcError::ConnectionFailed {
            endpoint: self.endpoint.clone(),
            reason: "No window object available".to_string(),
        })?;

        let resp_value = wasm_bindgen_futures::JsFuture::from(window.fetch_with_request(&request))
            .await
            .map_err(|e| RpcError::ConnectionFailed {
                endpoint: self.endpoint.clone(),
                reason: format!("Fetch failed: {:?}", e),
            })?;

        let resp: Response = resp_value.dyn_into().map_err(|e| RpcError::InvalidResponse {
            expected: "Response object".to_string(),
            got: format!("{:?}", e),
        })?;

        if !resp.ok() {
            let status = resp.status();
            return Err(RpcError::ConnectionFailed {
                endpoint: self.endpoint.clone(),
                reason: format!("HTTP error: {}", status),
            });
        }

        
        let json_promise = resp.json().map_err(|e| RpcError::InvalidResponse {
            expected: "JSON response".to_string(),
            got: format!("{:?}", e),
        })?;

        let json_value = wasm_bindgen_futures::JsFuture::from(json_promise)
            .await
            .map_err(|e| RpcError::InvalidResponse {
                expected: "Valid JSON".to_string(),
                got: format!("{:?}", e),
            })?;

        
        let response: Value = serde_wasm_bindgen::from_value(json_value)
            .map_err(|e| RpcError::InvalidResponse {
                expected: "Valid JSON structure".to_string(),
                got: e.to_string(),
            })?;

        
        if let Some(error) = response.get("error") {
            return Err(RpcError::RpcMethodFailed {
                method: method.to_string(),
                code: error
                    .get("code")
                    .and_then(|c| c.as_i64())
                    .unwrap_or(-1),
                message: error
                    .get("message")
                    .and_then(|m| m.as_str())
                    .unwrap_or("Unknown error")
                    .to_string(),
            });
        }

        
        response
            .get("result")
            .cloned()
            .ok_or_else(|| RpcError::InvalidResponse {
                expected: "result field".to_string(),
                got: response.to_string(),
            })
    }
}


#[async_trait(?Send)]  
impl SolanaRpcProvider for WasmRpcClient {
    async fn get_latest_blockhash(&self) -> Result<Hash, RpcError> {
        let result = self.call_rpc_method("getLatestBlockhash", json!([])).await?;

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
            .call_rpc_method(
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
            .call_rpc_method(
                "getSignatureStatuses",
                json!([[signature.to_string()]]),
            )
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
            .call_rpc_method(
                "getTokenAccountsByOwner",
                json!([
                    owner.to_string(),
                    {
                        "programId": program_id.to_string()
                    },
                    {
                        "encoding": "jsonParsed"
                    }
                ]),
            )
            .await?;

        
        let accounts_value = result.get("value").ok_or_else(|| RpcError::InvalidResponse {
            expected: "value field with accounts".to_string(),
            got: result.to_string(),
        })?;

        
        let accounts: Vec<RpcKeyedAccount> =
            serde_json::from_value(accounts_value.clone()).map_err(|e| {
                RpcError::InvalidResponse {
                    expected: "valid RpcKeyedAccount array".to_string(),
                    got: e.to_string(),
                }
            })?;

        Ok(accounts)
    }

    async fn get_balance(&self, pubkey: &Pubkey) -> Result<u64, RpcError> {
        let result = self
            .call_rpc_method("getBalance", json!([pubkey.to_string()]))
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