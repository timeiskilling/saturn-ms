use async_trait::async_trait;
use reqwest::{self, Url};
use serde::Deserialize;
use solana_client::{nonblocking::rpc_client::RpcClient, rpc_request::TokenAccountsFilter};
use solana_sdk::pubkey::Pubkey;
use std::collections::HashMap;
use std::error::Error;
use wallet_models::domain::models::token_models::TokenBalance;

use crate::rpc_layer::rpc_provider::SolanaRpcProvider;

pub type AsyncResult<T> = Result<T, Box<dyn Error + Send + Sync>>;
const SPL_TOKEN_ID: Pubkey = spl_token::ID;
#[derive(Debug, Deserialize)]
pub struct TokenInfo {
    pub id: String,
    pub symbol: String,
    #[serde(rename = "tokenProgram")]
    pub token_program: String,
    #[serde(rename = "usdPrice")]
    pub usd_price: Option<f64>,
}

#[async_trait]
pub trait TokenMetaDataProvider: Send + Sync {
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

#[async_trait]
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
        headers.insert("x-api-key", "02aaffb2-fd16-4030-9b4f-f9dd7e178a2c");

        let chunks: Vec<&[String]> = mint_addresses.chunks(100).collect();
        let mut all_info = HashMap::new();

        for chunk in chunks {
            let query_value = chunk.join(",");

            let request = self
                .client
                .get(self.base_url.clone())
                .query(&[("query", &query_value)])
                .headers(headers)
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
    P: TokenMetaDataProvider,
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
    P: TokenMetaDataProvider,
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
    let token_accounts = rpc
        .get_token_accounts_by_owner(owner, &SPL_TOKEN_ID)
        .await?;

    let mut balances = Vec::new();

    for keyed_account in token_accounts {
        if let solana_account_decoder::UiAccountData::Json(parsed_account) =
            &keyed_account.account.data
        {
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

                balances.push(TokenBalance {
                    mint,
                    symbol: String::new(),
                    amount,
                    raw,
                    decimals,
                    usd_price: None,
                    token_program: None,
                });
            }
        }
    }

    Ok(balances)
}

// #[cfg(test)]
// mod examples {
//     use super::*;

//     /// Example 1: Simple usage - get all tokens with metadata
//     pub async fn example_get_all_tokens() -> Result<(), Box<dyn std::error::Error>> {
//         let rpc = RpcClient::new("https://api.mainnet-beta.solana.com".to_string());
//         let owner = Pubkey::try_from("YourWalletAddressHere")?;

//         let balances = get_token_balances_with_metadata(&rpc, &owner).await?;

//         for balance in balances {
//             println!(
//                 "Token: {} ({}) - Amount: {} - USD: ${:.2}",
//                 balance.symbol,
//                 balance.mint,
//                 balance.amount,
//                 balance.usd_price.unwrap_or(0.0)
//             );
//         }

//         Ok(())
//     }

//     /// Example 2: Get tokens and filter by USD value
//     pub async fn example_filter_by_value() -> Result<(), Box<dyn std::error::Error>> {
//         let rpc = RpcClient::new("https://api.mainnet-beta.solana.com".to_string());
//         let owner = Pubkey::try_from("YourWalletAddressHere")?;

//         let balances = get_token_balances_with_metadata(&rpc, &owner).await?;

//         // Filter tokens worth more than $1
//         let valuable_tokens: Vec<_> = balances
//             .into_iter()
//             .filter(|b| {
//                 if let (Ok(amount), Some(price)) = (b.amount.parse::<f64>(), b.usd_price) {
//                     amount * price > 1.0
//                 } else {
//                     false
//                 }
//             })
//             .collect();

//         println!("Found {} tokens worth more than $1", valuable_tokens.len());

//         Ok(())
//     }

//     /// Example 3: Calculate total portfolio value
//     pub async fn example_portfolio_value() -> Result<(), Box<dyn std::error::Error>> {
//         let rpc = RpcClient::new("https://api.mainnet-beta.solana.com".to_string());
//         let owner = Pubkey::try_from("YourWalletAddressHere")?;

//         let balances = get_token_balances_with_metadata(&rpc, &owner).await?;

//         let total_value: f64 = balances
//             .iter()
//             .filter_map(|b| {
//                 let amount = b.amount.parse::<f64>().ok()?;
//                 let price = b.usd_price?;
//                 Some(amount * price)
//             })
//             .sum();

//         println!("Total portfolio value: ${:.2}", total_value);

//         Ok(())
//     }
// }
