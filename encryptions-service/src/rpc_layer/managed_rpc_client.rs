use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::collections::HashMap;
use async_trait::async_trait;
use tokio::sync::{mpsc, oneshot};
use serde_json::{Value, json};

use crate::error_handling::error_code::RpcError;
use crate::rpc_layer::rpc_provider::ManagedRpcClient;

#[async_trait]
pub trait HttpTransport : Send + Sync {
    async fn execute_json_rpc_request(
        &self,
        request_body : Value
    ) -> Result<Value,RpcError>;
}

pub struct ManagedHttpTransport {
    managed_client : Arc<ManagedRpcClient>,
}

impl ManagedHttpTransport {
    pub fn new(managed_client : Arc<ManagedRpcClient>) -> Self {
        Self { managed_client }
    }
}


#[async_trait]
impl HttpTransport for ManagedHttpTransport {
    async fn execute_json_rpc_request(
        &self,
        request_body : Value
    ) -> Result<Value,RpcError> {
        self.managed_client.execute_raw_json_rpc(request_body).await
    }
}