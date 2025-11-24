use core::fmt;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy)]

pub enum HeliusRpcRequest {
    GetTokenAccountsByOwnerV2,
}

impl fmt::Display for HeliusRpcRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let method = match self {
            HeliusRpcRequest::GetTokenAccountsByOwnerV2 => "getTokenAccountsByOwnerV2",
        };

        write!(f, "{method}")
    }
}

impl HeliusRpcRequest {
    pub fn build_request_json(self, id: u64, params: Value) -> Value {
        let jsonrpc = "2.0";
        json!({
           "jsonrpc": jsonrpc,
           "id": id,
           "method": format!("{self}"),
           "params": params,
        })
    }
}
