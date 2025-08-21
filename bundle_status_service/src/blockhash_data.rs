use std::{sync::Arc, time::Duration};

use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::hash::Hash;
use tokio::sync::RwLock;

const DELAY_UPDATE_BLOCKHASH : u64 = 10;

#[derive(Default, Clone)]
pub struct CashedBlockHash {
    pub blockhash: Hash,
    pub lavid_block_height: u64,
}

#[derive(Default)]
pub struct BlockhashCache {
    cashed_data: Arc<RwLock<CashedBlockHash>>,
}

impl BlockhashCache {
    pub fn new(rpc_client: Arc<RpcClient>) -> Self {
        let cache = Self {
            cashed_data: Arc::new(RwLock::new(CashedBlockHash::default())),
        };

        cache.spawn_updater(rpc_client);

        cache
    }

    pub async fn get(&self) -> CashedBlockHash {
        self.cashed_data.read().await.clone()
    }

    fn spawn_updater(&self, rpc_client: Arc<RpcClient>) {
        let cached_data_clone = self.cashed_data.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(DELAY_UPDATE_BLOCKHASH));

            loop {
                interval.tick().await;

                match rpc_client
                    .get_latest_blockhash_with_commitment(rpc_client.commitment())
                    .await
                {
                    Ok((blockhash, lavid_block_height)) => {
                        let mut guard = cached_data_clone.write().await;
                        *guard = CashedBlockHash {
                            blockhash,
                            lavid_block_height,
                        };
                        tracing::debug!("Successfully updated blockhash: {}", blockhash);
                    }
                    Err(e) => {
                        tracing::error!("Failed to update blockhash: {:?}", e);
                    }
                }
            }
        });
    }
}
