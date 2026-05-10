use common::models::DayTickerEvent;
use serde::{Deserialize, Serialize};

use crate::models::jupiter_models::QuoteOptions;

#[derive(Deserialize, Serialize, Debug)]
pub struct WebTakeQoute {
    pub input_mint: String,
    pub output_mint: String,
    pub amount: u64,
    pub slippage_bps: u16,
    pub option: Option<QuoteOptions>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct WebTakeOrder {
    pub input_mint: String,
    pub output_mint: String,
    pub amount: u64,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct TickerData {
    pub s: String, // symbol
    pub c: String, // close price
    pub p: String, // price change %
}

#[derive(Debug, Deserialize, Serialize)]
pub struct StreamMessage {
    pub stream: String,
    pub data: DayTickerEvent,
}

pub type TokenPrices = Vec<TokenPrice>;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenPrice {
    pub id: String,
    pub name: String,
    pub symbol: String,
    pub icon: String,
    pub decimals: i64,
    pub circ_supply: f64,
    pub total_supply: f64,
    pub token_program: String,
    pub holder_count: i64,
    pub fdv: f64,
    pub mcap: f64,
    pub usd_price: f64,
    pub price_block_id: i64,
    pub liquidity: f64,
    pub stats5m: Stats5m,
    pub stats1h: Stats1h,
    pub stats6h: Stats6h,
    pub stats24h: Stats24h,
    pub first_pool: FirstPool,
    pub apy: Apy,
    pub audit: Audit,
    pub organic_score: f64,
    pub organic_score_label: String,
    pub is_verified: bool,
    pub tags: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats5m {
    pub price_change: f64,
    pub liquidity_change: f64,
    pub volume_change: f64,
    pub buy_volume: f64,
    pub sell_volume: f64,
    pub buy_organic_volume: f64,
    pub sell_organic_volume: f64,
    pub num_buys: i64,
    pub num_sells: i64,
    pub num_traders: i64,
    pub num_organic_buyers: i64,
    pub num_net_buyers: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats1h {
    pub price_change: f64,
    pub liquidity_change: f64,
    pub volume_change: f64,
    pub buy_volume: f64,
    pub sell_volume: f64,
    pub buy_organic_volume: f64,
    pub sell_organic_volume: f64,
    pub num_buys: i64,
    pub num_sells: i64,
    pub num_traders: i64,
    pub num_organic_buyers: i64,
    pub num_net_buyers: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats6h {
    pub price_change: f64,
    pub liquidity_change: f64,
    pub volume_change: f64,
    pub buy_volume: f64,
    pub sell_volume: f64,
    pub buy_organic_volume: f64,
    pub sell_organic_volume: f64,
    pub num_buys: i64,
    pub num_sells: i64,
    pub num_traders: i64,
    pub num_organic_buyers: i64,
    pub num_net_buyers: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats24h {
    pub price_change: f64,
    pub liquidity_change: f64,
    pub volume_change: f64,
    pub buy_volume: f64,
    pub sell_volume: f64,
    pub buy_organic_volume: f64,
    pub sell_organic_volume: f64,
    pub num_buys: i64,
    pub num_sells: i64,
    pub num_traders: i64,
    pub num_organic_buyers: i64,
    pub num_net_buyers: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FirstPool {
    pub id: String,
    pub created_at: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Apy {
    pub jup_earn: f64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Audit {
    pub mint_authority_disabled: bool,
    pub freeze_authority_disabled: bool,
    pub top_holders_percentage: f64,
    pub dev_mints: i64,
}

pub type TokenPricesV2 = Vec<PriceV2>;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PriceV2 {
    pub id: String,
    pub name: String,
    pub symbol: String,
    pub decimals: i64,
}

pub struct SwapRequestParams<'a> {
    pub input_mint: &'a str,
    pub output_mint: &'a str,
    pub amount: u64,
    pub slippage_bps: u16,
    pub options: QuoteOptions,
}

pub type ImageFetch = Vec<ImageData>;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageData {
    pub symbol: String,
    #[serde(default)]
    pub icon: Option<String>,
}
