use std::sync::Arc;

use crate::rpc_layer::{
    retry_config::RetryConfig,
    rpc_provider::{ManagedRpcClient, SolanaRpcProvider},
};

pub struct RpcManager {
    provider: Arc<dyn SolanaRpcProvider>,
}

impl RpcManager {
    pub fn new_helius(api_key: String, requests_per_second: u32, dev_net: bool) -> Self {
        let base_url = if dev_net {
            "https://devnet.helius-rpc.com/?api-key="
        } else {
            "https://mainnet.helius-rpc.com/?api-key="
        };
        let mut endpoint = String::with_capacity(base_url.len() + api_key.len());
        endpoint.push_str(base_url);
        endpoint.push_str(&api_key);

        let manage_client =
            ManagedRpcClient::new(endpoint, requests_per_second, RetryConfig::default());

        Self {
            provider: Arc::new(manage_client),
        }
    }

    pub fn get_provider(&self) -> Arc<dyn SolanaRpcProvider> {
        self.provider.clone()
    }
}
