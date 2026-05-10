use std::{sync::Arc, time::Duration};

use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::hash::Hash;
use tokio::sync::RwLock;

const DELAY_UPDATE_BLOCKHASH: u64 = 10;

#[derive(Default, Clone)]
pub struct CashedBlockHash {
    pub blockhash: Hash,
    pub lavid_block_height: u64,
}

pub struct BlockhashCache {
    cashed_data: Arc<RwLock<CashedBlockHash>>,
    updater: tokio::task::JoinHandle<()>,
    cancel_token: tokio_util::sync::CancellationToken,
}

impl BlockhashCache {
    pub fn new(rpc_client: Arc<RpcClient>) -> Self {
        let cancel_token = tokio_util::sync::CancellationToken::new();
        let token = cancel_token.clone();

        let cashed_data = Arc::new(RwLock::new(CashedBlockHash::default()));
        let cached_data_clone = cashed_data.clone();

        let updater = tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(DELAY_UPDATE_BLOCKHASH));

            loop {
                tokio::select! {
                _ = token.cancelled() => {
                    tracing::info!("blockhash updater shutting down");
                    break;
                }

                _ = interval.tick() => {
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
                }
            }
        });

        Self {
            cashed_data,
            updater,
            cancel_token,
        }
    }

    pub async fn shutdown(self) {
        self.cancel_token.cancel();

        match self.updater.await {
            Ok(_) => {
                tracing::info!("updater stopped");
            }
            Err(e) => {
                tracing::error!("updater crashed: {:?}", e);
            }
        }
    }

    pub async fn get(&self) -> CashedBlockHash {
        self.cashed_data.read().await.clone()
    }
}
