use async_trait::async_trait;
use serde_json::Value;

use crate::jito_client_api::{error_code::RpcError, retry_config::RpcStats};


#[async_trait]
pub trait JitoClient: Send + Sync {
    async fn get_in_flight_bundle_statuses(&self, bundle_ids: Vec<String>) -> Result<Value, RpcError>;
    async fn send_bundle(&self, params: Option<Value>, uuid: Option<String>) -> Result<Value, RpcError>;
    
    async fn get_bundle_statuses(&self, bundle_ids: Vec<String>) -> Result<Value, RpcError>;
    
    fn get_stats(&self) -> RpcStats;
}