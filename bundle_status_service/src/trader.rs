use base64::{Engine, engine::general_purpose};

//2025-08-13T11:37:46.333106Z ERROR bundle_status_service::trader: Failed to fetch tip from Redis: Response was of incompatible type - TypeError: "Response type not convertible to numeric." (response was nil)

use config::Config;
use core::str;
use dashmap::DashMap;
use jupiter_trader_data::models::jupiter_models::{
    Instruction, JupiterQuoteResponse, JupiterSwapInstructionsRsponse, QuoteOptions,
};
use redis::AsyncCommands;

use serde_json::{Value, json};
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{
    // address_lookup_table::{instruction::create_lookup_table, state::AddressLookupTable},
    commitment_config::CommitmentConfig,
    hash::Hash,
    message::{
        AddressLookupTableAccount, VersionedMessage,
        v0::{self, Message},
    },
    pubkey::Pubkey,
    signature::Signature,
    system_instruction::transfer,
    transaction::{Transaction, VersionedTransaction},
};
use std::{str::FromStr, sync::Arc};
use tokio::sync::{Mutex, RwLock};
use tracing::instrument;

use crate::{
    blockhash_data::BlockhashCache, bundle_manager::{
        bundle_tracker_api::{main_api::BundleTracker, saturn_tracker::{
            tracker::SaturnBundleTracker, tracker_config::TrackerConfig,
        }},
        client::UserStreamNotificationSystem,
    }, constant::{self, HEADER_SIZE, MIN_JITO_TIP_LAMPORTS}, jito_client_api::{
        error_code::{
            ATlError, BuildTransactionError, JitoEndpointErr, RedisErr,
            SaturnTransactionsServiceError,
        }, jito_http_manager::JitoHttpManager, main_api::JitoClient, reqwest_client::JupiterProvider
    }, redis_con
};

// pub type SharedPriceState = Arc<Mutex<HashMap<String, DayTickerEvent>>>;

pub struct JupiterTrader {
    pub client: RpcClient,
    pub http_client: Arc<dyn JupiterProvider>,
    tip_cache: Arc<RwLock<Option<f64>>>,
    // keypair: Arc<Keypair>,
    pub jito_manager: Arc<JitoHttpManager>,
    // pub shared_price_state: SharedPriceState,
    pub redis: Mutex<redis::aio::MultiplexedConnection>,
    pub config: Config,
    jito_tip_redis: Arc<Mutex<redis::aio::MultiplexedConnection>>,
    alt_redis: redis::aio::MultiplexedConnection,
    // pub atl_pubkey: Pubkey,
    notification_system: Arc<UserStreamNotificationSystem>,
    pub bundle_status: Arc<SaturnBundleTracker>,
    pub coin_naming: Arc<DashMap<String, String>>,
}

impl JupiterTrader {
    pub async fn new(
        rpc_url: &str,
        /*keypair: Keypair*/ redis_urls: Vec<String>,
        jito_manager: Arc<JitoHttpManager>,
        http_client: Arc<dyn JupiterProvider>,
    ) -> Self {
        let client = solana_client::nonblocking::rpc_client::RpcClient::new_with_commitment(
            rpc_url.to_string(),
            CommitmentConfig::confirmed(),
        );
        // let jito_endpoint = JitoJsonRpcSDK::new(
        //     "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1",
        //     None,
        // );

        let tracker_config = TrackerConfig::default();

        let config = config::load();
        Self {
            // atl_pubkey: create_atl(&keypair, &client).await,
            client,
            http_client,
            jito_manager: jito_manager.clone(),
            redis: Mutex::new(redis_con::connection::redis_conn(&config).await),
            jito_tip_redis: Arc::new(Mutex::new(
                redis_con::connection::jito_tip_redis_conn(&config).await,
            )),
            alt_redis: redis_con::connection::atl_redis_conn(&config).await,
            config,
            notification_system: Arc::new(UserStreamNotificationSystem::new()),
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
        swap_response: &JupiterSwapInstructionsRsponse,
        blockhash: Hash,
        pubkey: &Pubkey,
    ) -> Result<String, SaturnTransactionsServiceError> {
        let len = swap_response.instruction_count();
        let mut instructions = Vec::with_capacity(len);

        instructions.extend(convert_instruction_to_solana(
            &swap_response.compute_budget_instructions,
        )?);
        instructions.extend(convert_instruction_to_solana(
            &swap_response.setup_instructions,
        )?);

        if let Some(token_leader) = &swap_response.token_ledger_instruction {
            instructions.extend(convert_instruction_to_solana(std::slice::from_ref(
                token_leader,
            ))?);
        }

        if let Some(token_leader) = &swap_response.token_ledger_instruction {
            instructions.extend(convert_instruction_to_solana(std::slice::from_ref(
                token_leader,
            ))?);
        }
        instructions.extend(convert_instruction_to_solana(std::slice::from_ref(
            &swap_response.swap_instruction,
        ))?);

        instructions.extend(convert_instruction_to_solana(std::slice::from_ref(
            &swap_response.cleanup_instruction,
        ))?);

        instructions.extend(convert_instruction_to_solana(
            &swap_response.other_instructions,
        )?);

        let address_lookup_table_accounts =
            if let Some(address_lookup_tables) = &swap_response.addresses_by_lookup_table_address {
                tracing::info!("fetch addresses 1");
                self.fetch_map_address_lookup_tables(address_lookup_tables)
                    .await?
            } else {
                tracing::info!("fetch addresses 2");
                self.fetch_address_lookup_tables(&swap_response.address_lookup_table_addresses)
                    .await?
            };

        let message = self
            .create_v0_message_with_alt(
                &instructions,
                &address_lookup_table_accounts,
                blockhash,
                pubkey,
            )
            .await?;

        let versioned_message = VersionedMessage::V0(message);

        let num_required = match &versioned_message {
            VersionedMessage::Legacy(m) => m.header.num_required_signatures as usize,
            VersionedMessage::V0(m) => m.header.num_required_signatures as usize,
        };

        let transaction = VersionedTransaction {
            signatures: vec![Signature::default(); num_required],
            message: versioned_message,
        };

        let serialized_tx = bincode::serialize(&transaction).map_err(|e| {
            SaturnTransactionsServiceError::BuildTransaction(Box::new(
                BuildTransactionError::BincodeVersionedTransactionSerializetion {
                    data: transaction.clone(),
                    issue: e.to_string(),
                },
            ))
        })?;
        let base58_tx = bs58::encode(serialized_tx).into_string();

        Ok(base58_tx)
    }

    async fn fetch_map_address_lookup_tables(
        &self,
        address: &Value,
    ) -> Result<Vec<AddressLookupTableAccount>, SaturnTransactionsServiceError> {
        let mut tabel_accounts = Vec::new();

        if let Some(account_address) = address.as_object() {
            for (key, acc_addresses) in account_address {
                let pubkey = Pubkey::from_str(key).map_err(|e| {
                    SaturnTransactionsServiceError::ATlError(ATlError::PubkeyConvertingErr {
                        bad_bytes: key.as_bytes().to_vec(),
                        issue: e.to_string(),
                    })
                })?;

                if let Some(data) = acc_addresses.as_array() {
                    let mut addresses = Vec::new();

                    for addresses_val in data {
                        if let Some(address_str) = addresses_val.as_str() {
                            addresses.push(Pubkey::from_str(address_str).map_err(|e| {
                                SaturnTransactionsServiceError::ATlError(
                                    ATlError::PubkeyConvertingErr {
                                        bad_bytes: address_str.as_bytes().to_vec(),
                                        issue: e.to_string(),
                                    },
                                )
                            })?);
                        }
                    }

                    let lookup_table = AddressLookupTableAccount {
                        key: pubkey,
                        addresses,
                    };

                    tabel_accounts.push(lookup_table);
                }
            }
        }

        Ok(tabel_accounts)
    }

    #[instrument(skip_all, level = "info")]
    async fn fetch_address_lookup_tables(
        &self,
        alt_address: &[String],
    ) -> Result<Vec<AddressLookupTableAccount>, SaturnTransactionsServiceError> {
        use constant::TTL_FOR_ATL;
        let mut con: redis::aio::MultiplexedConnection = self.alt_redis.clone();
        let values: Vec<Option<Vec<u8>>> = con.mget(alt_address).await.map_err(|e| {
            SaturnTransactionsServiceError::Redis(RedisErr::MgetALT {
                redis_issue: e.to_string(),
            })
        })?;

        let vec_pubkeys: Result<Vec<Pubkey>, _> = alt_address
            .iter()
            .map(|address| Pubkey::from_str(address))
            .collect();

        let vec_pubkeys = vec_pubkeys.map_err(|e| {
            SaturnTransactionsServiceError::ATlError(ATlError::PubkeyConvertingErr {
                bad_bytes: alt_address.join(", ").into_bytes(),
                issue: e.to_string(),
            })
        })?;

        let mut acc_data = vec![None; alt_address.len()];
        let mut missing_data = Vec::with_capacity(alt_address.len());

        for (idx, (data, pubkey)) in values.iter().zip(&vec_pubkeys).enumerate() {
            match data {
                Some(data) => {
                    tracing::info!("SKIPPING from cache");
                    acc_data[idx] = Some(data.to_owned());
                }
                None => {
                    missing_data.push((idx, *pubkey));
                }
            }
        }

        if !missing_data.is_empty() {
            let missing_pubkeys: Vec<Pubkey> =
                missing_data.iter().map(|(_, pubkey)| *pubkey).collect();

            let accounts_data = self
                .client
                .get_multiple_accounts(&missing_pubkeys)
                .await
                .map_err(|_e| {
                    SaturnTransactionsServiceError::ATlError(ATlError::FetchALTs {
                        alt_pubkeys: missing_pubkeys.iter().map(|f| f.to_string()).collect(),
                    })
                })?;

            let mut pype_line = redis::pipe();

            for ((idx, pubkey), account_data) in missing_data.iter().zip(accounts_data.into_iter())
            {
                if let Some(acc) = account_data {
                    pype_line.set_ex(pubkey.to_string(), &acc.data, TTL_FOR_ATL);
                    acc_data[*idx] = Some(acc.data);
                } else {
                    tracing::warn!("Account not found: {}", pubkey);
                    return Err(SaturnTransactionsServiceError::ATlError(
                        ATlError::NotFound {
                            pubkey: pubkey.to_string(),
                        },
                    ));
                }
            }

            let _: () = pype_line.query_async(&mut con).await.map_err(|e| {
                SaturnTransactionsServiceError::Redis(RedisErr::QueryExecute {
                    issue: e.to_string(),
                })
            })?;
            tracing::info!("Added {} accounts into Redis ATL", missing_data.len());
        }

        let parsed: Result<Vec<_>, SaturnTransactionsServiceError> = acc_data
            .into_iter()
            .zip(vec_pubkeys.into_iter())
            .filter_map(|(account_opt, pubkey)| {
                account_opt.map(|data| {
                    Ok(AddressLookupTableAccount {
                        key: pubkey,
                        addresses: self.parse_lookup_table(&data)?,
                    })
                })
            })
            .collect();

        tracing::info!("End Building ATL");

        match parsed {
            Ok(accounts) => Ok(accounts),
            Err(err) => {
                tracing::error!("Error parsing fetch_address_lookup_tables: {:?}", err);
                Err(err)
            }
        }
    }

    //#[instrument(skip_all, level = "info")]
    async fn create_v0_message_with_alt(
        &self,
        instructions: &[solana_sdk::instruction::Instruction],
        alt_account: &[AddressLookupTableAccount],
        blockhash: Hash,
        pubkey: &Pubkey,
    ) -> Result<v0::Message, SaturnTransactionsServiceError> {
        let message =
            Message::try_compile(pubkey, instructions, alt_account, blockhash).map_err(|e| {
                SaturnTransactionsServiceError::BuildTransaction(Box::new(
                    BuildTransactionError::V0message(e),
                ))
            })?;
        Ok(message)
    }
    #[instrument(skip_all, level = "info")]
    fn parse_lookup_table(
        &self,
        account_data: &[u8],
    ) -> Result<Vec<Pubkey>, SaturnTransactionsServiceError> {
        if account_data.len() < HEADER_SIZE {
            return Err(SaturnTransactionsServiceError::ATlError(
                ATlError::ParseLookupTable {
                    pubkey_header_size: "invalid size too short".to_string(),
                },
            ));
        };

        let address_data: &[u8] = &account_data[HEADER_SIZE..];
        let address_count = address_data.len() / 32;

        let mut address = Vec::with_capacity(address_count + 1);

        for i in 0..address_count {
            let start = i * 32;
            let end = start + 32;
            let pubkey_bytes = &address_data[start..end];
            let pubkey = Pubkey::try_from(pubkey_bytes).map_err(|e| {
                SaturnTransactionsServiceError::ATlError(ATlError::PubkeyConvertingErr {
                    bad_bytes: pubkey_bytes.to_vec(),
                    issue: e.to_string(),
                })
            })?;
            address.push(pubkey);
        }

        Ok(address)
    }

    #[instrument(skip_all, level = "info")]
    pub async fn create_transactions(
        &self,
        pubkey: &str,
        quote: JupiterQuoteResponse,
        blockhash: &BlockhashCache,
    ) -> Result<Vec<String>, SaturnTransactionsServiceError> {
        let mut transactions: Vec<String> = Vec::with_capacity(6);

        // let jito_tip_acc = Pubkey::from_str(&self.jito_endpoint.get_random_tip_account().await?)?;
        let jito_tip_acc = Pubkey::from_str("96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5")
            .map_err(|e| {
                SaturnTransactionsServiceError::BuildTransaction(Box::new(
                    BuildTransactionError::IvalidPubkey {
                        pubkey: "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5"
                            .as_bytes()
                            .to_vec(),
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
                            .add_bundles(vec![bundle_uuid.to_string()], user_pbk.to_string())
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
            .build_transaction_from_instructions(&swap_instructions, blockhash, pubkey)
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

//#[instrument(skip_all, level = "info")]
pub fn convert_instruction_to_solana(
    jupiter_instructions: &[Instruction],
) -> Result<Vec<solana_sdk::instruction::Instruction>, SaturnTransactionsServiceError> {
    use solana_sdk::instruction::{
        AccountMeta as SolanaAccountMeta, Instruction as SolanaInstruction,
    };

    jupiter_instructions
        .iter()
        .map(|instruct| {
            let program_id = Pubkey::from_str(&instruct.program_id).map_err(|e| {
                SaturnTransactionsServiceError::BuildTransaction(Box::new(
                    BuildTransactionError::IvalidPubkey {
                        pubkey: instruct.program_id.as_bytes().to_vec(),
                        issue: e.to_string(),
                    },
                ))
            })?;

            let data = general_purpose::STANDARD
                .decode(&instruct.data)
                .map_err(|e| {
                    SaturnTransactionsServiceError::BuildTransaction(Box::new(
                        BuildTransactionError::InvalidDecode { decode_err: e },
                    ))
                })?;

            let accounts: Result<Vec<SolanaAccountMeta>, SaturnTransactionsServiceError> = instruct
                .accounts
                .iter()
                .map(|acc| {
                    Ok::<SolanaAccountMeta, SaturnTransactionsServiceError>(SolanaAccountMeta {
                        pubkey: Pubkey::from_str(&acc.pubkey).map_err(|e| {
                            SaturnTransactionsServiceError::BuildTransaction(Box::new(
                                BuildTransactionError::IvalidPubkey {
                                    pubkey: acc.pubkey.as_bytes().to_vec(),
                                    issue: e.to_string(),
                                },
                            ))
                        })?,
                        is_signer: acc.is_signer,
                        is_writable: acc.is_writable,
                    })
                })
                .collect();

            Ok(SolanaInstruction {
                program_id,
                accounts: accounts?,
                data,
            })
        })
        .collect()
}
