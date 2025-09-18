use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainsResponse {
    pub chains: Vec<Chain>,
}

/// Individual chain information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chain {
    /// Unique identifier for the blockchain (e.g., "ethereum", "arbitrum")
    #[serde(rename = "chainKey")]
    pub chain_key: String,
    
    /// Type of blockchain (e.g., "evm", "solana")
    #[serde(rename = "chainType")]
    pub chain_type: String,
    
    /// Numeric chain identifier
    #[serde(rename = "chainId")]
    pub chain_id: u64,
    
    /// Short display name for the chain
    #[serde(rename = "shortName")]
    pub short_name: String,
    
    /// Full name of the blockchain
    pub name: String,
    
    /// Information about the chain's native currency
    #[serde(rename = "nativeCurrency")]
    pub native_currency: NativeCurrency,
}

/// Native currency information for a blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NativeCurrency {
    /// Chain identifier for the native currency
    #[serde(rename = "chainKey")]
    pub chain_key: String,
    
    /// Full name of the native currency
    pub name: String,
    
    /// Symbol of the native currency
    pub symbol: String,
    
    /// Number of decimal places for the native currency
    pub decimals: u8,
    
    /// Contract address of the native currency
    pub address: String,
}