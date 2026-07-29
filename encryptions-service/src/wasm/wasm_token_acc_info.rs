// #![cfg(target_arch = "wasm32")]

use std::error::Error;

use solana_sdk::pubkey::{Pubkey};
use crate::wasm::{models::TokenBalance, wasm_rpc_client::SolanaRpcProvider, wasm_types::{RpcKeyedAccount, UiAccountData}};
use async_trait::async_trait;
use reqwest::{self, Url};
use serde::Deserialize;
use std::collections::HashMap;
use futures::future::join;

type AsyncResult<T> = Result<T, Box<dyn Error + Send + Sync>>;
const SPL_TOKEN_ID: Pubkey = spl_token::ID;
const SPL_TOKEN_2022_ID: Pubkey = Pubkey::from_str_const("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

#[derive(Debug, Deserialize)]
pub struct TokenInfo {
    pub id: String,
    pub symbol: String,
    #[serde(rename = "tokenProgram")]
    pub token_program: String,
    #[serde(rename = "usdPrice")]
    pub usd_price: Option<f64>,
}

#[async_trait(?Send)]
pub trait TokenMetaDataProvider {
    async fn fetch_metadata(
        &self,
        mint_addresses: &[String],
    ) -> AsyncResult<HashMap<String, TokenInfo>>;
}

pub struct JupiterClient {
    client: reqwest::Client,
    base_url: Url,
}

impl JupiterClient {
    pub fn new(base_url_str: &str) -> Result<Self, Box<dyn Error>> {
        Ok(Self {
            client: reqwest::Client::new(),
            base_url: Url::parse(base_url_str)?,
        })
    }
}


#[async_trait(?Send)]
impl TokenMetaDataProvider for JupiterClient {
    async fn fetch_metadata(
        &self,
        mint_addresses: &[String],
    ) -> AsyncResult<HashMap<String, TokenInfo>> {
        if mint_addresses.is_empty() {
            return Ok(HashMap::new());
        }

        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("Accept", "application/json".parse()?);
        headers.insert("x-api-key", "_".parse()?);

        let chunks: Vec<&[String]> = mint_addresses.chunks(100).collect();
        let mut all_info = HashMap::new();

        for chunk in chunks {
            let query_value = chunk.join(",");

            let request = self
                .client
                .get(self.base_url.clone())
                .query(&[("query", &query_value)])
                .headers(headers.clone())
                .build()?;

            let response = self.client.execute(request).await?;

            if !response.status().is_success() {
                eprintln!("Jupiter API error: {}", response.status());
                continue;
            }

            let tokens: Vec<TokenInfo> = response.json().await?;

            for token in tokens {
                all_info.insert(token.id.clone(), token);
            }
        }

        Ok(all_info)
    }
}

pub async fn get_valid_tokens<P>(
    rpc: &dyn SolanaRpcProvider,
    owner: &Pubkey,
    provider: &P,
) -> AsyncResult<Vec<TokenBalance>>
where
    P: TokenMetaDataProvider + ?Sized,
{
    let mut tokens = get_token_balances(rpc, owner).await?;

    enrich_token_balances(&mut tokens, provider).await?;

    tokens.retain(|t| {
        t.symbol != "UNKNOWN"
            && t.amount.parse::<f64>().unwrap_or(0.0) > 0.0
            && t.usd_price.is_some()
    });

    Ok(tokens)
}

async fn enrich_token_balances<P>(balances: &mut [TokenBalance], provider: &P) -> AsyncResult<()>
where
    P: TokenMetaDataProvider + ?Sized,
{
    if balances.is_empty() {
        return Ok(());
    }

    let mint_addresses: Vec<String> = balances.iter().map(|b| b.mint.clone()).collect();

    let token_info = provider.fetch_metadata(&mint_addresses).await?;

    for balance in balances.iter_mut() {
        if let Some(info) = token_info.get(&balance.mint) {
            balance.symbol = info.symbol.clone();
            balance.usd_price = info.usd_price;
            balance.token_program = Some(info.token_program.clone());
        } else {
            balance.symbol = "UNKNOWN".to_string();
        }
    }

    Ok(())
}

async fn get_token_balances(
    rpc: &dyn SolanaRpcProvider,
    owner: &Pubkey,
) -> AsyncResult<Vec<TokenBalance>> {
    let legacy_future = rpc.get_token_accounts_by_owner(owner, &SPL_TOKEN_ID);
    let token22_future = rpc.get_token_accounts_by_owner(owner, &SPL_TOKEN_2022_ID);


    let (legacy_res, token22_res) = join(legacy_future, token22_future).await;

    let legacy_accounts = legacy_res.unwrap_or_else(|e| {
        web_sys::console::error_1(&format!("Legacy fetch error: {:?}", e).into());
        vec![]
    });

    let token22_accounts = token22_res.unwrap_or_else(|e| {
        web_sys::console::error_1(&format!("Token22 fetch error: {:?}", e).into());
        vec![]
    });

    let mut all_balances = Vec::with_capacity(legacy_accounts.len() + token22_accounts.len());

    all_balances.extend(parse_token_accounts(legacy_accounts, &SPL_TOKEN_ID.to_string()));
    all_balances.extend(parse_token_accounts(token22_accounts, &SPL_TOKEN_2022_ID.to_string()));

    Ok(all_balances)
}

fn parse_token_accounts(accounts: Vec<RpcKeyedAccount>, program_id: &str) -> Vec<TokenBalance> {
    let mut parsed_balances = Vec::new();

    for keyed_account in accounts {
        if let UiAccountData::Json(parsed_account) = &keyed_account.account.data {
            let info = parsed_account.parsed.get("info");
            let token_amount = info.and_then(|i| i.get("tokenAmount"));

            if let (Some(info), Some(token_amount)) = (info, token_amount) {
                let mint = info
                    .get("mint")
                    .and_then(|m| m.as_str())
                    .unwrap_or("")
                    .to_string();

                let amount = token_amount
                    .get("uiAmountString")
                    .and_then(|a| a.as_str())
                    .unwrap_or("0")
                    .to_string();

                let raw = token_amount
                    .get("amount")
                    .and_then(|a| a.as_str())
                    .unwrap_or("0")
                    .to_string();

                let decimals = token_amount
                    .get("decimals")
                    .and_then(|d| d.as_u64())
                    .unwrap_or(0) as u8;

                if raw == "0" {
                    continue;
                }

                parsed_balances.push(TokenBalance {
                    mint,
                    symbol: String::new(),
                    amount,
                    raw,
                    decimals,
                    usd_price: None,
                    token_program: Some(program_id.to_string()),
                });
            }
        }
    }

    parsed_balances
}
