use base64::{Engine, engine::general_purpose};
use borsh::BorshDeserialize;
use common::models::DayTickerEvent;

use config::Config;
use core::str;
use dashmap::DashMap;
use jito_sdk_rust::JitoJsonRpcSDK;
use jupiter_trader_data::models::{
    api_models::WebTakeQoute,
    jupiter_models::{
        Instruction, JupiterQuoteResponse, JupiterSwapInstructionsRsponse, JupiterSwapRequest,
        JupiterSwapResponse, JupiterUltraQuoteResponse, PriorityLevel, QuoteOptions, TokenNaming,
    },
};
use redis::AsyncCommands;
use reqwest::Client;
use serde_json::Value;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{
    // address_lookup_table::{instruction::create_lookup_table, state::AddressLookupTable},
    commitment_config::CommitmentConfig,
    hash::Hash,
    message::{
        AddressLookupTableAccount, VersionedMessage,
        v0::{self, Message},
    },
    program_pack::Pack,
    pubkey::Pubkey,
    signature::{Keypair, Signature, Signer},
    system_instruction::transfer,
    transaction::{Transaction, VersionedTransaction},
};
use std::{collections::HashMap, str::FromStr, sync::Arc};
use tokio::sync::{Mutex, RwLock};

use crate::{
    client::UserStreamNotificationSystem,
    constant::{HEADER_SIZE, MIN_JITO_TIP_LAMPORTS, NUMBER_TRANSACTIONS, SOL_MINT, USDC_MINT},
    domain::{RedisBundleTracker, TrackerConfig},
    redis_con,
};

pub type SharedPriceState = Arc<Mutex<HashMap<String, DayTickerEvent>>>;

pub struct JupiterTrader {
    client: RpcClient,
    pub http_client: Client,
    tip_cache: Arc<RwLock<Option<f64>>>,
    keypair: Arc<Keypair>,
    jupiter_base_url: String,
    jupiter_ultra_url: String,
    jito_endpoint: JitoJsonRpcSDK,
    pub shared_price_state: SharedPriceState,
    pub redis: Mutex<redis::aio::MultiplexedConnection>,
    pub config: Config,
    jito_tip_redis: Arc<Mutex<redis::aio::MultiplexedConnection>>,
    // pub atl_pubkey: Pubkey,
    notification_system: Arc<UserStreamNotificationSystem>,
    bundle_status: Arc<RedisBundleTracker>,
    pub coin_naming: Arc<DashMap<String, String>>,
}

impl JupiterTrader {
    pub async fn new(rpc_url: &str, keypair: Keypair, redis_urls: Vec<String>) -> Self {
        let http_client = reqwest::Client::builder().build().unwrap();
        let client = solana_client::nonblocking::rpc_client::RpcClient::new_with_commitment(
            rpc_url.to_string(),
            CommitmentConfig::confirmed(),
        );
        let jupiter_base_url = "https://lite-api.jup.ag/swap/v1".to_string();
        let jupiter_ultra_url = "https://lite-api.jup.ag/ultra/v1".to_string();
        let jito_endpoint = JitoJsonRpcSDK::new(
            "https://mainnet.block-engine.jito.wtf/api/v1/transactions",
            None,
        );

        let tracker_config = TrackerConfig::default();

        let config = config::load();
        Self {
            // atl_pubkey: create_atl(&keypair, &client).await,
            client,
            http_client,
            keypair: Arc::new(keypair),
            jupiter_base_url,
            jito_endpoint,
            jupiter_ultra_url,
            shared_price_state: Arc::new(Mutex::new(HashMap::new())),
            redis: Mutex::new(redis_con::connection::redis_conn(&config).await),
            jito_tip_redis: Arc::new(Mutex::new(
                redis_con::connection::jito_tip_redis_conn(&config).await,
            )),
            config: config,
            notification_system: Arc::new(UserStreamNotificationSystem::new()),
            bundle_status: Arc::new(
                RedisBundleTracker::new(redis_urls, tracker_config)
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

    pub fn get_coin_naming(&self) -> &DashMap<String, String> {
        &self.coin_naming
    }

    pub fn get_tracker(&self) -> Arc<RedisBundleTracker> {
        self.bundle_status.clone()
    }

    pub async fn set_naming(&self) {
        tracing::info!("set naming of toporganicscore");
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("Accept", "application/json".parse().unwrap());

        let response = self
            .http_client
            .get("https://lite-api.jup.ag/tokens/v2/toporganicscore/24h")
            .headers(headers)
            .send()
            .await
            .unwrap();

        let token: Vec<TokenNaming> = response.json().await.unwrap();

        let _ = token.into_iter().map(|data| {
            self.coin_naming.insert(data.symbol, data.mint);
        });
    }

    pub async fn send_order(
        &self,
        input_mint: &str,
        output_mint: &str,
        amount: u64,
    ) -> Result<JupiterUltraQuoteResponse, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/order", self.jupiter_ultra_url);

        let params = [
            ("inputMint", input_mint),
            ("outputMint", output_mint),
            ("amount", &amount.to_string()),
        ];

        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("Accept", "application/json".parse()?);
        let response = self
            .http_client
            .get(&url)
            .query(&params)
            .headers(headers)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_txt = response.text().await?;
            tracing::error!("Jupiter Ultra API err: {}", error_txt);
            return Err(format!("Jupiter Ultra API error: {}", error_txt).into());
        }

        let quote: JupiterUltraQuoteResponse = response.json().await?;

        let input_amount = quote.in_amount.parse::<u64>().unwrap_or(0) as f64;
        let output_amount = quote.out_amount.parse::<u64>().unwrap_or(0) as f64;

        println!("   Send: {:.6} SOL", input_amount / 1_000_000_000.0);
        println!("   Take: {:.2} USDC", output_amount / 1_000_000.0);
        println!("   Slipping: {}%", quote.slippage_bps as f64 / 100.0);

        // Handle the price impact
        println!("Impact on price: {}%", quote.price_impact_pct);

        Ok(quote)
    }
    pub async fn get_quote(
        &self,
        input_mint: &str,
        output_mint: &str,
        amount: u64,
        slippage_bps: u16,
        //fee_account : &str,
    ) -> Result<JupiterQuoteResponse, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/quote", self.jupiter_base_url);

        let params = [
            ("inputMint", input_mint),
            ("outputMint", output_mint),
            ("amount", &amount.to_string()),
            ("slippageBps", &slippage_bps.to_string()),
            // ("platformFeeBps", "20"),
            //("feeAccount",fee_account)
        ];

        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("Accept", "application/json".parse()?);

        let response = self
            .http_client
            .get(&url)
            .query(&params)
            .headers(headers)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_txt = response.text().await?;
            tracing::error!("Jupiter API err : {}", error_txt);
            return Err(format!("Jupiter API error: {}", error_txt).into());
        }

        let quote: JupiterQuoteResponse = response.json().await?;

        let input_amount = quote.in_amount.parse::<u64>().unwrap_or(0) as f64;
        let output_amount = quote.out_amount.parse::<u64>().unwrap_or(0) as f64;

        println!("   Send: {:.6} SOL", input_amount / 1_000_000_000.0);
        println!("   Take: {:.2} USDC", output_amount / 1_000_000.0);
        println!("   Slipping: {}%", quote.slippage_bps as f64 / 100.0);
        println!("   Impact on price: {}%", quote.price_impact_pct);

        Ok(quote)
    }

    pub async fn get_quote_with_options(
        &self,
        input_mint: &str,
        output_mint: &str,
        amount: u64,
        slippage_bps: u16,
        options: &QuoteOptions,
        // fee_account : &str,
    ) -> Result<JupiterQuoteResponse, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/quote", self.jupiter_base_url);

        let amount_str = amount.to_string();
        let slippage_bps_str = slippage_bps.to_string();

        let base_params: Vec<(&str, &str)> = vec![
            ("inputMint", input_mint),
            ("outputMint", output_mint),
            ("amount", &amount_str),
            ("slippageBps", &slippage_bps_str),
            ("platformFeeBps", "20"),
            // ("feeAccount",fee_account)
        ];

        let cleaned_options = options.cleaned();
        let additional_params = cleaned_options.to_params();

        let additional_params_refs: Vec<(&'static str, &str)> = additional_params
            .iter()
            .map(|(k, v_string)| (*k, v_string.as_str()))
            .collect();

        let all_params: Vec<(&str, &str)> = base_params
            .into_iter()
            .chain(additional_params_refs.into_iter())
            .collect();

        let url_with_params = reqwest::Url::parse_with_params(&url, &all_params)?;

        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("Accept", "application/json".parse()?);

        let response = self
            .http_client
            .get(url_with_params)
            .headers(headers)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_txt = response.text().await?;
            tracing::error!("Jupiter API err : {}", error_txt);
            return Err(format!("Jupiter API error: {}", error_txt).into());
        }

        let quote: JupiterQuoteResponse = response.json().await?;

        let input_amount = quote.in_amount.parse::<u64>().unwrap_or(0) as f64;
        let output_amount = quote.out_amount.parse::<u64>().unwrap_or(0) as f64;

        println!("   Send: {:.6} SOL", input_amount / 1_000_000_000.0);
        println!("   Take: {:.2} USDC", output_amount / 1_000_000.0);
        println!("   Slipping: {}%", quote.slippage_bps as f64 / 100.0);
        println!("   Impact on price: {}%", quote.price_impact_pct);
        println!("_____________________________________________________");

        Ok(quote)
    }

    pub async fn exrcute_swap(
        &self,
        quote: JupiterQuoteResponse,
    ) -> Result<Signature, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/swap", self.jupiter_base_url);

        let swap = JupiterSwapRequest::new(
            self.keypair.pubkey().to_string(),
            quote,
            10_000_000,
            PriorityLevel::VeryHigh,
            true,
        );

        let response = self.http_client.post(&url).json(&swap).send().await?;

        if !response.status().is_success() {
            let error_txt = response.text().await?;
            tracing::error!("Jupiter API err : {}", error_txt);
            return Err("err".into());
        }

        let swap_response: JupiterSwapResponse = response.json().await?;

        if let Some(simulation_error) = &swap_response.simulation_error {
            tracing::error!(
                "Simulation error: {} - {}",
                simulation_error.error_code,
                simulation_error.error
            );
            return Err(format!("Simulation failed: {}", simulation_error.error).into());
        }

        let transactions_data =
            general_purpose::STANDARD.decode(&swap_response.swap_transaction)?;
        let mut transaction: Transaction = bincode::deserialize(&transactions_data)?;

        let recent_blockhash = self.client.get_latest_blockhash().await?;
        transaction.partial_sign(&[self.keypair.clone()], recent_blockhash);

        let signature = self
            .client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok(signature)
    }

    pub async fn execute_swap_instruction(
        &self,
        quote: JupiterQuoteResponse,
    ) -> Result<Signature, Box<dyn std::error::Error + Send + Sync>> {
        use solana_sdk::hash::Hash;

        let url = format!("{}/swap-instructions", self.jupiter_base_url);

        let swap_instructions = JupiterSwapRequest::new(
            self.keypair.pubkey().to_string(),
            quote,
            10_000_000,
            PriorityLevel::VeryHigh,
            true,
        );

        let response = self
            .http_client
            .post(&url)
            .json(&swap_instructions)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_txt = response.text().await?;
            tracing::error!("Jupiter API err : {}", error_txt);
            return Err("err".into());
        }

        let swap_instruction_response: JupiterSwapInstructionsRsponse = response.json().await?;

        if let Some(simulation_error) = &swap_instruction_response.simulation_error {
            tracing::error!(
                "Simulation error: {} - {}",
                simulation_error.error_code,
                simulation_error.error
            );
            return Err(format!("Simulation failed: {}", simulation_error.error).into());
        }

        let blockhash =
            Hash::try_from_slice(&swap_instruction_response.blockhash_with_metadata.blockhash)?;

        let transaction: VersionedTransaction = self
            .build_transaction_from_instructions(&swap_instruction_response, blockhash)
            .await?;

        let signature = self
            .client
            .send_and_confirm_transaction(&transaction)
            .await?;
        tracing::info!("Swap executed successfully: {}", signature);
        Ok(signature)
    }

    async fn build_transaction_from_instructions(
        &self,
        swap_response: &JupiterSwapInstructionsRsponse,
        blockhash: Hash,
    ) -> Result<VersionedTransaction, Box<dyn std::error::Error + Send + Sync>> {
        let mut instructions = Vec::new();

        for compute_instruction in &swap_response.compute_budget_instructions {
            instructions.push(self.convert_instruction_to_solana(compute_instruction)?);
        }

        for setup_instruction in &swap_response.setup_instructions {
            instructions.push(self.convert_instruction_to_solana(setup_instruction)?);
        }

        if let Some(token_leader) = &swap_response.token_ledger_instruction {
            instructions.push(self.convert_instruction_to_solana(token_leader)?);
        }

        instructions.push(self.convert_instruction_to_solana(&swap_response.swap_instruction)?);
        instructions.push(self.convert_instruction_to_solana(&swap_response.cleanup_instruction)?);

        for other_instruction in &swap_response.other_instructions {
            instructions.push(self.convert_instruction_to_solana(other_instruction)?);
        }

        // instructions.push(make_fee_instruction(program_id, fee_account, authority, amount).await);

        let address_lookup_table_accounts =
            if let Some(address_lookup_tables) = &swap_response.addresses_by_lookup_table_address {
                self.fetch_map_address_lookup_tables(address_lookup_tables)
                    .await?
            } else {
                self.fetch_address_lookup_tables(&swap_response.address_lookup_table_addresses)
                    .await?
            };

        let message = self
            .create_v0_message_with_alt(&instructions, &address_lookup_table_accounts, blockhash)
            .await?;

        let versioned_message = VersionedMessage::V0(message);
        let transaction = VersionedTransaction::try_new(versioned_message, &[&self.keypair])?;

        Ok(transaction)
    }

    async fn fetch_map_address_lookup_tables(
        &self,
        address: &Value,
    ) -> Result<Vec<AddressLookupTableAccount>, Box<dyn std::error::Error + Send + Sync>> {
        let mut tabel_accounts = Vec::new();

        if let Some(account_address) = address.as_object() {
            for (key, acc_addresses) in account_address {
                let pubkey = Pubkey::from_str(&key)?;

                if let Some(data) = acc_addresses.as_array() {
                    let mut addresses = Vec::new();

                    for addresses_val in data {
                        if let Some(address_str) = addresses_val.as_str() {
                            addresses.push(Pubkey::from_str(address_str)?);
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

        // let rpc_response = self.client.get_account(&self.atl_pubkey).await?;
        // let address_lookup_table = AddressLookupTable::deserialize(&rpc_response.data)?;

        // let convertation_alt = AddressLookupTableAccount {
        //     key: self.atl_pubkey.clone(),
        //     addresses: address_lookup_table.addresses.to_vec(),
        // };

        // tabel_accounts.push(convertation_alt);

        Ok(tabel_accounts)
    }
    async fn fetch_address_lookup_tables(
        &self,
        alt_address: &[String],
    ) -> Result<Vec<AddressLookupTableAccount>, Box<dyn std::error::Error + Send + Sync>> {
        let mut lookup_table_accounts = Vec::new();

        for alt in alt_address {
            let pubkey = Pubkey::from_str(&alt)?;

            let account_data = self.client.get_account_data(&pubkey).await?;

            let lookup_table_account = AddressLookupTableAccount {
                key: pubkey,
                addresses: self.parse_lookup_table(account_data.as_slice())?,
            };

            lookup_table_accounts.push(lookup_table_account);
        }

        // let rpc_response = self.client.get_account(&self.atl_pubkey).await?;
        // let address_lookup_table = AddressLookupTable::deserialize(&rpc_response.data)?;

        // let convertation_alt = AddressLookupTableAccount {
        //     key: self.atl_pubkey.clone(),
        //     addresses: address_lookup_table.addresses.to_vec(),
        // };

        // lookup_table_accounts.push(convertation_alt);

        Ok(lookup_table_accounts)
    }

    async fn create_v0_message_with_alt(
        &self,
        instructions: &[solana_sdk::instruction::Instruction],
        alt_account: &[AddressLookupTableAccount],
        blockhash: Hash,
    ) -> Result<v0::Message, Box<dyn std::error::Error + Send + Sync>> {
        let message =
            Message::try_compile(&self.keypair.pubkey(), instructions, alt_account, blockhash)?;

        Ok(message)
    }

    fn parse_lookup_table(
        &self,
        account_data: &[u8],
    ) -> Result<Vec<Pubkey>, Box<dyn std::error::Error + Send + Sync>> {
        if account_data.len() < HEADER_SIZE {
            return Err("Invalid ALT account data".into());
        };

        let address_data: &[u8] = &account_data[HEADER_SIZE..];
        let address_count = address_data.len() / 32;

        let mut address = Vec::with_capacity(address_count + 1);

        for i in 0..address_count {
            let start = i * 32;
            let end = start + 32;
            let pubkey_bytes = &address_data[start..end];
            let pubkey = Pubkey::try_from(pubkey_bytes)?;
            address.push(pubkey);
        }

        Ok(address)
    }
    fn convert_instruction_to_solana(
        &self,
        jupiter_instruction: &Instruction,
    ) -> Result<solana_sdk::instruction::Instruction, Box<dyn std::error::Error + Send + Sync>>
    {
        use solana_sdk::instruction::{
            AccountMeta as SolanaAccountMeta, Instruction as SolanaInstruction,
        };

        let program_id: Pubkey = jupiter_instruction.program_id.parse()?;

        let accounts: Result<Vec<SolanaAccountMeta>, Box<dyn std::error::Error + Send + Sync>> =
            jupiter_instruction
                .accounts
                .iter()
                .map(|acc| {
                    let pubkey: Pubkey = acc.pubkey.parse()?;
                    Ok(SolanaAccountMeta {
                        pubkey,
                        is_signer: acc.is_signer,
                        is_writable: acc.is_writable,
                    })
                })
                .collect();

        let data = general_purpose::STANDARD.decode(&jupiter_instruction.data)?;

        Ok(SolanaInstruction {
            program_id,
            accounts: accounts?,
            data,
        })
    }

    pub async fn swap_sol_to_usdc(
        &self,
        sol_amount: f64,
        slippage_bps: u16,
    ) -> Result<Signature, Box<dyn std::error::Error + Send + Sync>> {
        let amount_lamports = (sol_amount * 1_000_000_000.0) as u64;

        let quote = self
            .get_quote(SOL_MINT, USDC_MINT, amount_lamports, slippage_bps)
            .await?;

        let signature = self.exrcute_swap(quote).await?;

        Ok(signature)
    }

    pub async fn swap_sol_to_usdc_instruction(
        &self,
        sol_amount: f64,
        slippage_bps: u16,
    ) -> Result<Signature, Box<dyn std::error::Error + Send + Sync>> {
        let amount_lamports = (sol_amount * 1_000_000_000.0) as u64;

        let quote = self
            .get_quote(SOL_MINT, USDC_MINT, amount_lamports, slippage_bps)
            .await?;

        let signature = self.execute_swap_instruction(quote).await?;

        Ok(signature)
    }

    pub async fn get_balance(&self) -> Result<f64, Box<dyn std::error::Error + Send + Sync>> {
        let balance = self.client.get_balance(&self.keypair.pubkey()).await?;
        Ok(balance as f64 / 1_000_000_000.0)
    }

    // pub async fn get_uscd_balance(&self) -> Result<f64, Box<dyn std::error::Error + Send + Sync>> {
    //     let pubkey_usdc = Pubkey::from_str(USDC_MINT)?;
    //     let token_account = spl_associated_token_account::get_associated_token_address(
    //         &self.keypair.pubkey(),
    //         &pubkey_usdc,
    //     );

    //     match self.client.get_account(&token_account).await {
    //         Ok(acc) => {
    //             let token_data = spl_token_2022::state::Account::unpack(&acc.data)?;
    //             Ok(token_data.amount as f64 / 10_000_000.0)
    //         }
    //         Err(_err) => Ok(0.0),
    //     }
    // }

    pub async fn send_template(&self, quote: Vec<WebTakeQoute>) {
        let mut quotes = Vec::with_capacity(5);

        for data in quote {
            if let Some(with_optinal_data) = data.option {
                tracing::info!("Calling get_quote_with_options");
                match self
                    .get_quote_with_options(
                        &data.input_mint,
                        &data.output_mint,
                        data.amount,
                        data.slippage_bps,
                        &with_optinal_data,
                    )
                    .await
                {
                    Ok(response_struct) => {
                        tracing::info!("get_quote_with_options successful: {:?}", response_struct);
                        quotes.push(response_struct);
                    }
                    Err(e) => {
                        tracing::error!("Error from get_quote_with_options: {:?}", e)
                    }
                }
            } else {
                tracing::info!("Calling get_quote (without options)");
                match self
                    .get_quote(
                        &data.input_mint,
                        &data.output_mint,
                        data.amount,
                        data.slippage_bps,
                    )
                    .await
                {
                    Ok(response_struct) => {
                        tracing::info!("get_quote successful: {:?}", response_struct);
                        quotes.push(response_struct);
                    }
                    Err(e) => {
                        tracing::error!("Error from get_quote: {:?}", e);
                    }
                }
            }
        }

        match self.send_swap_bundle_transaction(quotes).await {
            Ok(data) => {
                tracing::info!("sending bundle to jito {}", data);
            }
            Err(_) => {
                tracing::info!("Err in sending_bundle0");
            }
        }
    }

    pub async fn send_swap_bundle_transaction(
        &self,
        swaps: Vec<JupiterQuoteResponse>,
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        if swaps.len() > 5 {
            tracing::error!("Over max transactions in bundle");
            return Err("Bundle must contain less than 5 transactions".into());
        }

        let jito_tip_acc = Pubkey::from_str(&self.jito_endpoint.get_random_tip_account().await?)?;

        tracing::info!("tip account {}", jito_tip_acc);

        let blockhash = self.client.get_latest_blockhash().await?;
        tracing::info!("latest blockhash {}", blockhash);

        let mut bundle_transactions: Vec<String> = Vec::with_capacity(NUMBER_TRANSACTIONS);

        let data = *self.tip_cache.read().await;

        let tip_instruction = if let Some(tip) = data {
            transfer(&self.keypair.pubkey(), &jito_tip_acc, tip as u64)
        } else {
            transfer(&self.keypair.pubkey(), &jito_tip_acc, MIN_JITO_TIP_LAMPORTS)
        };

        let mut tip_transaction =
            Transaction::new_with_payer(&[tip_instruction], Some(&self.keypair.pubkey()));

        tip_transaction.sign(&[&self.keypair], blockhash);

        let tip_encoded = general_purpose::STANDARD.encode(bincode::serialize(&tip_transaction)?);
        bundle_transactions.push(tip_encoded);

        for quote in swaps {
            let swap_transaction = self.create_swap_transaction(quote, blockhash).await?;
            let encoded_transaction = base64::engine::general_purpose::STANDARD
                .encode(bincode::serialize(&swap_transaction)?);
            bundle_transactions.push(encoded_transaction);
        }

        let buncle_json = serde_json::json!(bundle_transactions);
        let bundle_result = self
            .jito_endpoint
            .send_bundle(Some(buncle_json), None)
            .await;

        match bundle_result {
            Ok(response_json) => match response_json["result"].as_str() {
                Some(bundle_uuid) => {
                    tracing::info!("Bundle sent successfully with UUID: {}", bundle_uuid);
                    self.bundle_status
                        .add_bundles(
                            vec![bundle_uuid.to_string()],
                            self.keypair.pubkey().to_string(),
                        )
                        .await
                        .unwrap();
                    Ok(bundle_uuid.to_string())
                }
                None => {
                    let error_msg = "Failed to get bundle UUID from response JSON";
                    tracing::error!("{}", error_msg);
                    Err(error_msg.into())
                }
            },
            Err(e) => {
                tracing::error!("Failed to send bundle: {}", e);
                Err(e.into())
            }
        }
    }

    async fn get_tip(tip_cache: &Arc<RwLock<Option<f64>>>) -> Option<f64> {
        *tip_cache.read().await
    }
    
    async fn create_swap_transaction(
        &self,
        quote: JupiterQuoteResponse,
        blockhash: solana_sdk::hash::Hash,
    ) -> Result<VersionedTransaction, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/swap-instructions", self.jupiter_base_url);

        let swap_request = JupiterSwapRequest::new(
            self.keypair.pubkey().to_string(),
            quote,
            100_000_000,
            PriorityLevel::VeryHigh,
            true,
        );

        let response = self
            .http_client
            .post(&url)
            .json(&swap_request)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_txt = response.text().await?;
            tracing::error!("Jupiter API err : {}", error_txt);
            return Err("err".into());
        }

        let swap_instructions: JupiterSwapInstructionsRsponse = response.json().await?;

        if let Some(simulation_error) = &swap_instructions.simulation_error {
            tracing::error!(
                "Simulation error: {} - {}",
                simulation_error.error_code,
                simulation_error.error
            );
            return Err(format!("Simulation failed: {}", simulation_error.error).into());
        }

        let transactions = self
            .build_transaction_from_instructions(&swap_instructions, blockhash)
            .await?;

        Ok(transactions)
    }

    pub fn wallet_adrres(&self) -> String {
        self.keypair.pubkey().to_string()
    }

    async fn jito_tip_listener(&self) {
        const REDIS_KEY: &str = "jito:tip:latest";
        const VALUE_FIELD: &str = "value";

        let cache = self.tip_cache.clone();
        let redis = self.jito_tip_redis.clone(); // Arc<Mutex<MultiplexedConnection>>
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_millis(500));
            loop {
                interval.tick().await;

                let mut con = redis.lock().await;
                match con.hget::<_, _, f64>(REDIS_KEY, VALUE_FIELD).await {
                    Ok(v) => {
                        *cache.write().await = Some(v);
                        tracing::info!("Updated tip cache from Redis: {}", v);
                    }
                    Err(e) => {
                        tracing::error!("Failed to fetch tip from Redis: {}", e);
                    }
                }
            }
        });
    }

    // pub async fn execute_arbitrage_bundle(
    //     &self,
    //     sol_amount: f64,
    //     slippage_bps: u16,
    // ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    //     let amount_lamports = (sol_amount * 1_000_000_000.0) as u64;

    //     let mut quotes = Vec::new();

    //     let quote1 = self
    //         .get_quote(SOL_MINT, USDC_MINT, amount_lamports, slippage_bps)
    //         .await?;
    //     quotes.push(quote1);

    //     // let quote2 = self.get_quote(USDC_MINT, "other_token", amount, slippage_bps).await?;
    //     // quotes.push(quote2);

    //     let bundle_uuid = self.send_swap_bundle_transaction(quotes).await?;

    //     tracing::info!("Arbitrage bundle executed with UUID: {}", bundle_uuid);
    //     Ok(bundle_uuid)
    // }

    // pub async fn check_bundle_status(
    //     &self,
    //     uuid: &str,
    // ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    //     match self
    //         .jito_endpoint
    //         .get_bundle_statuses(vec![uuid.to_string()])
    //         .await
    //     {
    //         Ok(statuses) => {
    //             if let Some(status) = statuses.get(0) {
    //                 tracing::info!("Bundle {} status: {:?}", uuid, status);
    //                 Ok(format!("{:?}", status))
    //             } else {
    //                 Ok("Status not found".to_string())
    //             }
    //         }
    //         Err(e) => {
    //             tracing::error!("Failed to get bundle status: {}", e);
    //             Err(e.into())
    //         }
    //     }
    // }

    // async fn get_flight_status(&self, status: Value) -> RedisResult<()> {
    //     let bundle_uuid: &str = status["result"]
    //         .as_str()
    //         .ok_or_else(|| RedisError::from("Invalid bundle_uuid in status"))?;

    //     let redis = self.redis.lock().await;
    //     let status_response = self
    //         .jito_endpoint
    //         .get_in_flight_bundle_statuses(vec![bundle_uuid.to_string()])
    //         .await?;

    //     let response: InflightBundleStatusResponse = serde_json::from_value(status_response)
    //         .map_err(|e| RedisError::from(format!("Failed to parse response: {}", e)))?;

    //     set_fligh_status(redis, bundle_status).await?;

    //     Ok(())
    // }
}
