use std::sync::Arc;

use crate::{batching::{batching_client::BatchedRpcClient, batching_config::BatchConfig}, rpc_layer::{
    retry_config::RetryConfig,
    rpc_provider::{ManagedRpcClient, SolanaRpcProvider},
}};

pub struct RpcManager {
    provider: Arc<dyn SolanaRpcProvider>,
}

impl RpcManager {
    pub fn new_helius_managed(
        api_key: String,
        requests_per_second: u32,
        dev_net: bool,
    ) -> Self {
        let endpoint = Self::build_endpoint(&api_key, dev_net);
        
        let managed_client = ManagedRpcClient::new(
            endpoint,
            requests_per_second,
            RetryConfig::default(),
        );
        
        Self {
            provider: Arc::new(managed_client),
        }
    }

    pub fn new_helius_batched_managed(
        api_key: String,
        requests_per_second: u32,
        dev_net: bool,
        batch_config: BatchConfig,
    ) -> Self {
        let endpoint = Self::build_endpoint(&api_key, dev_net);
        
        // Спочатку створюємо managed client
        let managed_client = Arc::new(ManagedRpcClient::new(
            endpoint,
            requests_per_second,
            RetryConfig::default(),
        ));
        
        let batched_client = BatchedRpcClient::new_with_managed_transport(
            managed_client,
            batch_config,
        );
        
        Self {
            provider: Arc::new(batched_client),
        }
    }

    fn build_endpoint(api_key: &str, dev_net: bool) -> String {
        let base_url = if dev_net {
            "https://devnet.helius-rpc.com/?api-key="
        } else {
            "https://mainnet.helius-rpc.com/?api-key="
        };
        
        format!("{}{}", base_url, api_key)
    }
    
    pub fn get_provider(&self) -> Arc<dyn SolanaRpcProvider> {
        self.provider.clone()
    }
}
