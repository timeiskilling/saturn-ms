use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize,Debug
)]
pub struct TokenBalance {
    pub mint: String,       // token mint or contract address
    pub symbol: String,
    pub amount: String,     // human-readable (e.g. "12.345")
    pub raw: String,        // raw smallest unit (e.g. wei / lamports)
    pub decimals: u8,
    pub usd_price: Option<f64>,
}