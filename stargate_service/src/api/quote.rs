use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuotesRequest {
    #[serde(rename = "srcToken")]
    pub src_token: String,
    
    /// Token contract address on the destination chain
    #[serde(rename = "dstToken")]
    pub dst_token: String,
    
    /// Your wallet address on the source chain
    #[serde(rename = "srcAddress")]
    pub src_address: String,
    
    /// Your wallet address on the destination chain
    #[serde(rename = "dstAddress")]
    pub dst_address: String,
    
    /// Identifier for the source blockchain (e.g., "arbitrum", "optimism", "ethereum")
    #[serde(rename = "srcChainKey")]
    pub src_chain_key: String,
    
    /// Identifier for the destination blockchain
    #[serde(rename = "dstChainKey")]
    pub dst_chain_key: String,
    
    /// The amount of tokens you wish to transfer (in smallest unit)
    #[serde(rename = "srcAmount")]
    pub src_amount: String,
    
    /// The minimum amount expected on the destination chain after fees
    #[serde(rename = "dstAmountMin")]
    pub dst_amount_min: String,
}

/// Response structure for the /quotes endpoint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuotesResponse {
    pub quotes: Vec<Quote>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Quote {
    /// Route identifier (e.g., "stargate/v2/taxi", "stargate/v2/bus")
    pub route: String,
    
    /// Error message if any, null if successful
    pub error: Option<String>,
    
    /// Source amount in wei/smallest unit
    #[serde(rename = "srcAmount")]
    pub src_amount: String,
    
    /// Destination amount in wei/smallest unit
    #[serde(rename = "dstAmount")]
    pub dst_amount: String,
    
    /// Maximum source amount allowed
    #[serde(rename = "srcAmountMax")]
    pub src_amount_max: String,
    
    /// Minimum destination amount expected
    #[serde(rename = "dstAmountMin")]
    pub dst_amount_min: String,
    
    /// Source token address
    #[serde(rename = "srcToken")]
    pub src_token: String,
    
    /// Destination token address  
    #[serde(rename = "dstToken")]
    pub dst_token: String,
    
    /// Source address
    #[serde(rename = "srcAddress")]
    pub src_address: String,
    
    /// Destination address
    #[serde(rename = "dstAddress")]
    pub dst_address: String,
    
    /// Source chain key
    #[serde(rename = "srcChainKey")]
    pub src_chain_key: String,
    
    /// Destination chain key
    #[serde(rename = "dstChainKey")]
    pub dst_chain_key: String,
    
    /// Native amount on destination chain
    #[serde(rename = "dstNativeAmount")]
    pub dst_native_amount: String,
    
    /// Transfer duration information
    pub duration: Duration,
    
    /// List of fees for this transfer
    pub fees: Vec<Fee>,
    
    /// Steps required to complete the transfer
    pub steps: Vec<Step>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Duration {
    /// Estimated duration in seconds
    pub estimated: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fee {
    /// Token address for the fee
    pub token: String,
    
    /// Chain where the fee is charged
    #[serde(rename = "chainKey")]
    pub chain_key: String,
    
    /// Fee amount in wei/smallest unit
    pub amount: String,
    
    /// Type of fee (e.g., "message")
    #[serde(rename = "type")]
    pub fee_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step {
    /// Type of step (e.g., "bridge")
    #[serde(rename = "type")]
    pub step_type: String,
    
    /// Sender address for this step
    pub sender: String,
    
    /// Chain where this step occurs
    #[serde(rename = "chainKey")]
    pub chain_key: String,
    
    /// Transaction details for this step
    pub transaction: Transaction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    /// Transaction data (hex encoded)
    pub data: String,
    
    /// Target contract address
    pub to: String,
    
    /// Value to send with transaction (in wei)
     pub value: Option<String>,
    
    /// From address
    pub from: String,
}