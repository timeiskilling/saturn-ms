use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TokensRequest {
    /// Filter tokens by source chain identifier (optional)
    #[serde(rename = "chainKey", skip_serializing_if = "Option::is_none")]
    pub chain_key: Option<String>,
    
    /// Filter by token address on the source chain (optional)
    #[serde(rename = "srcToken", skip_serializing_if = "Option::is_none")]
    pub src_token: Option<String>,
}

/// Response structure for the /tokens endpoint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokensResponse {
    pub tokens: Vec<Token>,
}

/// Individual token information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Token {
    /// Whether this token can be bridged
    #[serde(rename = "isBridgeable")]
    pub is_bridgeable: bool,
    
    /// Chain identifier where this token exists
    #[serde(rename = "chainKey")]
    pub chain_key: String,
    
    /// Contract address of the token
    pub address: String,
    
    /// Number of decimal places for this token
    pub decimals: u8,
    
    /// Token symbol (e.g., "ETH", "USDC")
    pub symbol: String,
    
    /// Full name of the token
    pub name: String,
    
    /// Current price information
    pub price: TokenPrice,
}

/// Price information for a token
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenPrice {
    /// Price in USD
    pub usd: f64,
}