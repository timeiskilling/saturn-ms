use crate::reqwest_client::JupiterProvider;
use crate::transactions_builder::solana::instruction_parser::JupiterSolanaParser;
use crate::transactions_builder::solana::transaction_builder::SolanaTransactionsBuilder;
use common::traits::TransactionBuilder;
use config::Config;
use core::str;
use dashmap::DashMap;
use jupiter_trader_data::models::jupiter_models::{
    JupiterQuoteResponse, JupiterSwapInstructionsRsponse, QuoteOptions,
};
use redis::AsyncCommands;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::system_instruction::transfer;

use crate::prelude::*;
use crate::{
    blockhash_data::BlockhashCache,
    bundle_manager::{
        bundle_tracker_api::{
            main_api::BundleTracker,
            saturn_tracker::{tracker::SaturnBundleTracker, tracker_config::TrackerConfig},
        },
        client::UserStreamNotificationSystem,
    },
    constant::MIN_JITO_TIP_LAMPORTS,
    jito_client_api::{
        error_code::{BuildTransactionError, JitoEndpointErr, SaturnTransactionsServiceError},
        jito_http_manager::JitoHttpManager,
        main_api::JitoClient,
    },
    redis_con,
};

// pub type SharedPriceState = Arc<Mutex<HashMap<String, DayTickerEvent>>>;

pub struct JupiterTrader {
    pub client: Arc<RpcClient>,
    pub http_client: Arc<dyn JupiterProvider>,
    tip_cache: Arc<RwLock<Option<f64>>>,
    transaction_builder: SolanaTransactionsBuilder<JupiterSolanaParser>,
    // keypair: Arc<Keypair>,
    pub jito_manager: Arc<JitoHttpManager>,
    // pub shared_price_state: SharedPriceState,
    pub redis: Mutex<redis::aio::MultiplexedConnection>,
    pub config: Config,
    jito_tip_redis: Arc<Mutex<redis::aio::MultiplexedConnection>>,
    // pub atl_pubkey: Pubkey,
    notification_system: Arc<UserStreamNotificationSystem>,
    pub bundle_status: Arc<SaturnBundleTracker>,
    pub coin_naming: Arc<DashMap<String, String>>,
}

impl JupiterTrader {
    pub async fn new(
        helius_api_key: &str,
        /*keypair: Keypair*/ redis_urls: Vec<String>,
        jito_manager: Arc<JitoHttpManager>,
        http_client: Arc<dyn JupiterProvider>,
    ) -> Self {
        let client = Arc::new(
            solana_client::nonblocking::rpc_client::RpcClient::new_with_commitment(
                helius_api_key.to_string(),
                CommitmentConfig::confirmed(),
            ),
        );
        // let jito_endpoint = JitoJsonRpcSDK::new(
        //     "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1",
        //     None,
        // );

        let tracker_config = TrackerConfig::default();
        let config = config::load();
        let transaction_builder = SolanaTransactionsBuilder::new(
            client.clone(),
            redis_con::connection::atl_redis_conn(&config).await,
            JupiterSolanaParser,
        );

        Self {
            transaction_builder,
            // atl_pubkey: create_atl(&keypair, &client).await,
            client,
            http_client,
            jito_manager: jito_manager.clone(),
            redis: Mutex::new(redis_con::connection::redis_conn(&config).await),
            jito_tip_redis: Arc::new(Mutex::new(
                redis_con::connection::jito_tip_redis_conn(&config).await,
            )),
            config,
            notification_system: {
                let ns = Arc::new(UserStreamNotificationSystem::new());
                if let Some(url) = redis_urls.first()
                    && let Ok(client) = redis::Client::open(url.as_str())
                {
                    ns.start_redis_subscription(client).await;
                }
                ns
            },
            bundle_status: Arc::new(
                SaturnBundleTracker::new(redis_urls, tracker_config, jito_manager)
                    .await
                    .unwrap(),
            ),
            coin_naming: Arc::new(DashMap::new()),
            tip_cache: Arc::new(RwLock::new(None)),
        }
    }

    pub fn get_notification_system(&self) -> Arc<UserStreamNotificationSystem> {
        self.notification_system.clone()
    }

    #[instrument(skip_all, level = "info")]
    pub async fn get_quote_with_options(
        &self,
        input_mint: &str,
        output_mint: &str,
        amount: u64,
        slippage_bps: u16,
        options: QuoteOptions,
        // fee_account : &str,
    ) -> Result<JupiterQuoteResponse, SaturnTransactionsServiceError> {
        let quote = self
            .http_client
            .get_quote_with_options(input_mint, output_mint, amount, slippage_bps, options)
            .await?;
        Ok(quote)
    }

    //#[instrument(skip_all, level = "info")]
    async fn build_transaction_from_instructions(
        &self,
        swap_response: JupiterSwapInstructionsRsponse,
        blockhash: Hash,
        pubkey: &Pubkey,
    ) -> Result<String, SaturnTransactionsServiceError> {
        self.transaction_builder
            .build_transaction(swap_response, (blockhash, *pubkey))
            .await
    }

    #[instrument(skip_all, level = "info")]
    pub async fn create_transactions(
        &self,
        pubkey: &str,
        quote: JupiterQuoteResponse,
        blockhash: &BlockhashCache,
    ) -> Result<Vec<String>, SaturnTransactionsServiceError> {
        let mut transactions: Vec<String> = Vec::with_capacity(6);

        // Optimization: Use constant tip address
        const JITO_TIP_STR: &str = "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5";
        let jito_tip_acc = Pubkey::from_str(JITO_TIP_STR).map_err(|e| {
            SaturnTransactionsServiceError::BuildTransaction(Box::new(
                BuildTransactionError::IvalidPubkey {
                    pubkey: JITO_TIP_STR.as_bytes().to_vec(),
                    issue: e.to_string(),
                },
            ))
        })?;

        let user_pubkey = Pubkey::from_str(pubkey).map_err(|e| {
            SaturnTransactionsServiceError::BuildTransaction(Box::new(
                BuildTransactionError::IvalidPubkey {
                    pubkey: pubkey.as_bytes().to_vec(),
                    issue: e.to_string(),
                },
            ))
        })?;

        let data = *self.tip_cache.read().await;
        let tip_instruction = transfer(
            &user_pubkey,
            &jito_tip_acc,
            data.unwrap_or(MIN_JITO_TIP_LAMPORTS as f64) as u64,
        );

        let tip_transaction = Transaction::new_with_payer(&[tip_instruction], Some(&user_pubkey));

        let tip_encoded = bs58::encode(bincode::serialize(&tip_transaction).map_err(|e| {
            SaturnTransactionsServiceError::BuildTransaction(Box::new(
                BuildTransactionError::BincodeTransactionSerializetion {
                    data: tip_transaction,
                    issue: e.to_string(),
                },
            ))
        })?)
        .into_string();

        transactions.push(tip_encoded);

        let blockhash = blockhash.get().await.blockhash;

        let swap_transaction = self
            .create_swap_transaction(quote, blockhash, &user_pubkey)
            .await?;

        transactions.push(swap_transaction);

        Ok(transactions)
    }

    pub async fn send_transactions(
        &self,
        transaction: Vec<String>,
        user_pbk: &str,
    ) -> Result<String, SaturnTransactionsServiceError> {
        tracing::info!("Prepearung sending transactions");
        // let transactions = json!(transaction);
        // let params = json!([
        //     transactions,
        //     { "encoding": "base64" }
        // ]);
        let params = json!([transaction]);

        let mut bundle_result = None;

        match self
            .jito_manager
            .send_bundle(Some(params.clone()), None)
            .await
        {
            Ok(response) => {
                if response.get("error").is_some() {
                    tracing::error!(
                        "Jito returned an error in the response body: {:?}",
                        response
                    );
                } else {
                    tracing::info!("Bundle submitted successfully!");
                    bundle_result = Some(response);
                }
            }
            Err(e) => {
                if e.to_string().contains("429 Too Many Requests") {
                    tracing::warn!("Rate limited. Retrying in ...")
                } else {
                    tracing::error!("Failed to send bundle with non-retriable error: {}", e);
                    return Err(SaturnTransactionsServiceError::Rpc(e));
                }
            }
        }

        // tokio::time::sleep(Duration::from_secs(10)).await;
        let bundle_result = bundle_result.ok_or("Invalid request");

        match bundle_result {
            Ok(response_json) => {
                tracing::info!("Full Jito response: {:?}", response_json);

                match response_json["result"].as_str() {
                    Some(bundle_uuid) => {
                        tracing::info!("Bundle sent successfully with UUID: {}", bundle_uuid);
                        if let Err(e) = self
                            .bundle_status
                            .add_bundles(vec![bundle_uuid.to_string()])
                            .await
                        {
                            tracing::error!("Failed to save bundle {}: {}", bundle_uuid, e);
                        }
                        Ok(bundle_uuid.to_string())
                    }
                    None => {
                        if let Some(error) = response_json["error"].as_object() {
                            let error_msg = format!("Jito error: {:?}", error);
                            tracing::error!("{}", error_msg);
                            Err(SaturnTransactionsServiceError::Jito(
                                JitoEndpointErr::JitoErrResponse {
                                    response: error_msg,
                                },
                            ))
                        } else {
                            let error_msg = format!(
                                "Failed to get bundle UUID from response JSON: {:?}",
                                response_json
                            );
                            tracing::error!("{}", error_msg);
                            Err(SaturnTransactionsServiceError::Jito(
                                JitoEndpointErr::JitoErrResponse {
                                    response: error_msg,
                                },
                            ))
                        }
                    }
                }
            }
            Err(_) => {
                tracing::error!("Failed to send bundle");
                Err(SaturnTransactionsServiceError::Jito(
                    JitoEndpointErr::JitoErrResponse {
                        response: "Failed to send bundle".to_string(),
                    },
                ))
            }
        }
    }

    //#[instrument(skip_all, level = "info")]
    async fn create_swap_transaction(
        &self,
        quote: JupiterQuoteResponse,
        blockhash: solana_sdk::hash::Hash,
        pubkey: &Pubkey,
    ) -> Result<String, SaturnTransactionsServiceError> {
        let swap_instructions = self
            .http_client
            .create_swap_transaction(quote, pubkey)
            .await?;

        let transactions = self
            .build_transaction_from_instructions(swap_instructions, blockhash, pubkey)
            .await?;

        Ok(transactions)
    }

    pub async fn jito_tip_listener(&self) {
        const REDIS_KEY: &str = "jito:tip:latest";
        const VALUE_FIELD: &str = "value";

        let cache = self.tip_cache.clone();
        let redis = self.jito_tip_redis.clone(); // Arc<Mutex<MultiplexedConnection>>
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(4));
            loop {
                interval.tick().await;

                let mut con = redis.lock().await;
                match con.hget::<_, _, Option<f64>>(REDIS_KEY, VALUE_FIELD).await {
                    Ok(Some(v)) => {
                        *cache.write().await = Some(v);
                        // tracing::info!("Updated tip cache from Redis: {}", v);
                    }
                    Ok(None) => {
                        tracing::warn!("Tip value is missing in Redis");
                    }
                    Err(e) => {
                        tracing::error!("Failed to fetch tip from Redis: {}", e);
                    }
                }
            }
        });
    }

    #[instrument(skip_all, level = "info")]
    pub async fn create_transactions_test(
        &self,
        pubkey: &str,
        quote: JupiterQuoteResponse,
        blockhash: Hash,
    ) -> Result<Vec<String>, Box<dyn std::error::Error + Send + Sync>> {
        let mut transactions: Vec<String> = Vec::with_capacity(6);
        // tokio::time::sleep(Duration::from_secs(5)).await;

        // let jito_tip_acc = Pubkey::from_str(&self.jito_endpoint.get_random_tip_account().await?)?;
        let jito_tip_acc = Pubkey::from_str("96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5")?;
        let user_pubkey = Pubkey::from_str(pubkey);
        let user_pubkey = match user_pubkey {
            Ok(pubk) => pubk,
            Err(_err) => {
                tracing::error!("Err in decoding pubkey");
                panic!("err")
            }
        };
        // let balance = self.client.get_balance(&user_pubkey).await?;
        // if balance < 1_000_000_000 {
        //
        //     tracing::info!("Low balance, requesting airdrop...");
        //
        //     let airdrop_signature = self
        //         .client
        //         .request_airdrop(&user_pubkey, 2_000_000_000)
        //         .await?;
        //
        //     self.client.confirm_transaction(&airdrop_signature).await?;
        //
        //     tracing::info!("Airdrop successful");
        // }

        let data = *self.tip_cache.read().await;
        let tip_instruction = transfer(
            &user_pubkey,
            &jito_tip_acc,
            data.unwrap_or(MIN_JITO_TIP_LAMPORTS as f64) as u64,
        );

        let tip_transaction = Transaction::new_with_payer(&[tip_instruction], Some(&user_pubkey));

        let tip_encoded = bs58::encode(bincode::serialize(&tip_transaction)?).into_string();

        transactions.push(tip_encoded);

        // let blockhash = blockhash.get().await.blockhash;

        let swap_transaction = self
            .create_swap_transaction(quote, blockhash, &user_pubkey)
            .await?;

        transactions.push(swap_transaction);

        Ok(transactions)
    }
}
