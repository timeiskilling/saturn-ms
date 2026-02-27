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
