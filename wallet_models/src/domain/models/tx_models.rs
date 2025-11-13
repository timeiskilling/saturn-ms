use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Serialize, Deserialize)]
pub struct TxSummary {
    pub txid: String,
    pub direction: Directions,    // "in" | "out" | "self"
    pub amount: u64,
    pub token: Option<String>,// token symbol or None for native
    pub timestamp: Option<DateTime<Utc>>,
    pub status: Status,       // "confirmed", "pending", "failed"
    pub fee: Option<u64>,
}

#[derive(Serialize, Deserialize)]
pub enum Directions {
    In,
    Out,
    ForSelf
}

#[derive(Serialize, Deserialize)]
pub enum Status {
    Confirmed,
    Pending,
    Failed
}