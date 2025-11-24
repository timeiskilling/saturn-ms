use serde::{Deserialize};

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TokenAccountResult {
    pub context: Context,
    pub value: Vec<TokenAccountItem>,
    pub pagination_key: Option<String>,
    pub total_results: Option<u64>,
}

#[derive(Deserialize, Debug)]
pub struct Context {
    pub slot: u64,
}

#[derive(Deserialize, Debug)]
pub struct TokenAccountItem {
    pub pubkey: String,
    pub account: AccountData,
}

#[derive(Deserialize, Debug)]
pub struct AccountData {
    pub lamports: u64,
    pub owner: String,
    pub data: AccountDataContent,
    pub executable: bool,
    #[serde(rename = "rentEpoch")]
    pub rent_epoch: u64,
}

#[derive(Deserialize, Debug)]

pub struct AccountDataContent {
    pub program: String, 
    pub parsed: ParsedContent,
    pub space: u64,
}

#[derive(Deserialize, Debug)]
pub struct ParsedContent {
    pub info: TokenInfo,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TokenInfo {
    pub is_native: bool,
    pub mint: String,
    pub owner: String,
    pub state: String,
    pub token_amount: TokenAmount,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TokenAmount {
    pub amount: String,
    pub decimals: u8,
    pub ui_amount: Option<f64>,
    pub ui_amount_string: String,
}
