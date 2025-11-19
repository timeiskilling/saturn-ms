use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Serialize, Deserialize,Debug)]
pub struct TxSummary {
    pub txid: String,
    pub direction: Directions,    // "in" | "out" | "self"
    pub amount: u64,
    pub token: Option<String>,// token symbol or None for native
    pub timestamp: Option<DateTime<Utc>>,
    pub status: Status,       // "confirmed", "pending", "failed"
    pub fee: Option<u64>,
}

#[derive(Serialize,Deserialize,Debug)]
pub struct SendedTransactions {
    pub signature_url : String,
    pub sendet_at : Option<DateTime<Utc>>,
    pub to : String,
    pub mint : String,
    pub amount : u64,
}

#[derive(Serialize, Deserialize,Debug)]
pub enum Directions {
    In,
    Out,
    ForSelf
}

#[derive(Serialize, Deserialize,Debug)]
pub enum Status {
    Confirmed,
    Pending,
    Failed
}