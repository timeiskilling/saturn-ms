use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::commitment_config::CommitmentConfig;

pub struct EncryptedState {
    pub rpc_node: RpcClient,
    // pub http_client: Client,
}

impl EncryptedState {
    pub fn new(rpc_url: &str) -> Self {
        Self {
            rpc_node: solana_client::nonblocking::rpc_client::RpcClient::new_with_commitment(
                rpc_url,
                CommitmentConfig::confirmed(),
            ),
        }
    }
}
