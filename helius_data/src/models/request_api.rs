use serde::{Serialize};
use serde_json::{Value};

#[derive(Serialize, Debug)]
struct HeliusJsonRpcRequest {
    jsonrpc: String,
    id: u64,
    method: String,
    params: Value,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LatestBlockhash {
    commitment : CommitmentConfig
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
enum CommitmentConfig{
    Confirmed,
    Finalized,
    Processed,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TokenAccountsParamsV2 {
    pub owner_address: String,
    pub filter: Filter,
    pub options: Options,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub changed_since_slot: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination_key: Option<String>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Filter {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mint: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub program_id: Option<String>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Options {
    pub encoding: String, 
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub show_zero_balance: Option<bool>,
}
