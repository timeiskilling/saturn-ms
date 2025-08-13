use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct JupiterSwapInstructionsRsponse {
    #[serde(rename = "tokenLedgerInstruction")]
    pub token_ledger_instruction: Option<Instruction>,

    #[serde(rename = "computeBudgetInstructions")]
    pub compute_budget_instructions: Vec<Instruction>,

    #[serde(rename = "setupInstructions")]
    pub setup_instructions: Vec<Instruction>,

    #[serde(rename = "swapInstruction")]
    pub swap_instruction: Instruction,

    #[serde(rename = "cleanupInstruction")]
    pub cleanup_instruction: Instruction,

    #[serde(rename = "otherInstructions")]
    pub other_instructions: Vec<Instruction>,

    #[serde(rename = "addressLookupTableAddresses")]
    pub address_lookup_table_addresses: Vec<String>,

    #[serde(rename = "prioritizationFeeLamports")]
    pub prioritization_fee_lamports: u64,

    #[serde(rename = "computeUnitLimit")]
    pub compute_unit_limit: u64,

    #[serde(rename = "prioritizationType")]
    pub prioritization_type: PrioritizationType,

    #[serde(rename = "addressesByLookupTableAddress")]
    pub addresses_by_lookup_table_address: Option<serde_json::Value>,

    #[serde(rename = "blockhashWithMetadata")]
    pub blockhash_with_metadata: BlockhashWithMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Instruction {
    #[serde(rename = "programId")]
    pub program_id: String,

    pub accounts: Vec<AccountMeta>,

    pub data: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AccountMeta {
    pub pubkey: String,

    #[serde(rename = "isSigner")]
    pub is_signer: bool,

    #[serde(rename = "isWritable")]
    pub is_writable: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PrioritizationType {
    #[serde(rename = "computeBudget")]
    pub compute_budget: ComputeBudget,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ComputeBudget {
    #[serde(rename = "microLamports")]
    pub micro_lamports: u64,

    #[serde(rename = "estimatedMicroLamports")]
    pub estimated_micro_lamports: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SimulationError {
    #[serde(rename = "errorCode")]
    pub error_code: String,

    pub error: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BlockhashWithMetadata {
    pub blockhash: Vec<u8>,

    #[serde(rename = "lastValidBlockHeight")]
    pub last_valid_block_height: u64,

    #[serde(rename = "fetchedAt")]
    pub fetched_at: FetchedAt,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FetchedAt {
    #[serde(rename = "secs_since_epoch")]
    pub secs_since_epoch: u64,

    #[serde(rename = "nanos_since_epoch")]
    pub nanos_since_epoch: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JupiterUltraQuoteRequest {
    #[serde(rename = "inputMint")]
    pub input_mint: String,

    #[serde(rename = "outputMint")]
    pub output_mint: String,

    #[serde(rename = "amount")]
    pub amount: String,

    #[serde(rename = "taker", skip_serializing_if = "Option::is_none")]
    pub taker: Option<String>,

    #[serde(rename = "referralAccount", skip_serializing_if = "Option::is_none")]
    pub referral_account: Option<String>,

    #[serde(rename = "referralFee", skip_serializing_if = "Option::is_none")]
    pub referral_fee: Option<u64>,

    #[serde(rename = "excludeRouters", skip_serializing_if = "Option::is_none")]
    pub exclude_routers: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JupiterUltraQuoteResponse {
    pub mode: String,
    pub swap_type: String,
    pub router: String,
    pub request_id: String,
    pub in_amount: String,
    pub out_amount: String,
    pub other_amount_threshold: String,
    pub swap_mode: String,
    pub slippage_bps: u64,
    pub price_impact_pct: String,
    pub route_plan: Vec<RoutePlan>,
    pub input_mint: String,
    pub output_mint: String,
    pub fee_bps: u64,
    pub prioritization_fee_lamports: u64,
    pub transaction: Option<String>,
    pub gasless: bool,
    pub taker: Option<String>,
    pub in_usd_value: f64,
    pub out_usd_value: f64,
    pub price_impact: f64,
    pub swap_usd_value: f64,
    pub total_time: u64,

    pub quote_id: Option<String>,
    pub maker: Option<String>,
    pub expire_at: Option<String>,
    pub platform_fee: Option<PlatformFee>,
    pub dynamic_slippage_report: Option<DynamicSlippageReport>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UltraSwapInfo {
    #[serde(rename = "ammKey")]
    pub amm_key: String,
    pub label: String,
    #[serde(rename = "inputMint")]
    pub input_mint: String,
    #[serde(rename = "outputMint")]
    pub output_mint: String,
    #[serde(rename = "inAmount")]
    pub in_amount: String,
    #[serde(rename = "outAmount")]
    pub out_amount: String,
    #[serde(rename = "feeAmount")]
    pub fee_amount: String,
    #[serde(rename = "feeMint")]
    pub fee_mint: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JupiterSwapRequest {
    #[serde(rename = "userPublicKey")]
    pub user_public_key: String,
    #[serde(rename = "quoteResponse")]
    pub quote_response: JupiterQuoteResponse,
    #[serde(rename = "prioritizationFeeLamports")]
    pub prioritization_fee_lamports: PrioritizationFeeLamports,
    #[serde(rename = "dynamicComputeUnitLimit")]
    pub dynamic_compute_unit_limit: bool,

    #[serde(rename = "wrapAndUnwrapSol", skip_serializing_if = "Option::is_none")]
    pub wrap_and_unwrap_sol: Option<bool>,
    #[serde(rename = "feeAccount", skip_serializing_if = "Option::is_none")]
    pub fee_account: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JupiterSwapResponse {
    #[serde(rename = "swapTransaction")]
    pub swap_transaction: String,
    #[serde(rename = "lastValidBlockHeight")]
    pub last_valid_block_height: u64,
    #[serde(rename = "prioritizationFeeLamports")]
    pub prioritization_fee_lamports: u64,
    #[serde(rename = "computeUnitLimit")]
    pub compute_unit_limit: u64,
    #[serde(rename = "prioritizationType")]
    pub prioritization_type: PrioritizationType,
    #[serde(rename = "simulationSlot")]
    pub simulation_slot: u64,
    #[serde(rename = "dynamicSlippageReport")]
    pub dynamic_slippage_report: Option<String>,
    #[serde(rename = "simulationError")]
    pub simulation_error: Option<SimulationError>,
    #[serde(rename = "addressesByLookupTableAddress")]
    pub addresses_by_lookup_table_address: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JupiterQuoteResponse {
    #[serde(rename = "inputMint")]
    pub input_mint: String,
    #[serde(rename = "inAmount")]
    pub in_amount: String,
    #[serde(rename = "outputMint")]
    pub output_mint: String,
    #[serde(rename = "outAmount")]
    pub out_amount: String,
    #[serde(rename = "otherAmountThreshold")]
    pub other_amount_threshold: String,
    #[serde(rename = "swapMode")]
    pub swap_mode: SwapMode,
    #[serde(rename = "slippageBps")]
    pub slippage_bps: u64,
    #[serde(rename = "platformFee")]
    pub platform_fee: Option<PlatformFee>,
    #[serde(rename = "priceImpactPct")]
    pub price_impact_pct: String,
    #[serde(rename = "routePlan")]
    pub route_plan: Vec<RoutePlan>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PrioritizationFeeLamports {
    #[serde(rename = "priorityLevelWithMaxLamports")]
    pub priority_level_with_max_lamports: PriorityLevelWithMaxLamports,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PriorityLevelWithMaxLamports {
    #[serde(rename = "maxLamports")]
    pub max_lamports: u64,
    #[serde(rename = "priorityLevel")]
    pub priority_level: PriorityLevel,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RoutePlan {
    #[serde(rename = "swapInfo")]
    pub swap_info: SwapInfo,
    pub percent: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RoutePlanUltra {
    #[serde(rename = "swapInfo")]
    pub swap_info: SwapInfo,
    pub percent: u8,
    pub bps: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SwapInfo {
    #[serde(rename = "ammKey")]
    pub amm_key: String,
    pub label: String,
    #[serde(rename = "inputMint")]
    pub input_mint: String,
    #[serde(rename = "outputMint")]
    pub output_mint: String,
    #[serde(rename = "inAmount")]
    pub in_amount: String,
    #[serde(rename = "outAmount")]
    pub out_amount: String,
    #[serde(rename = "feeAmount")]
    pub fee_amount: String,
    #[serde(rename = "feeMint")]
    pub fee_mint: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlatformFee {
    pub amount: String,
    #[serde(rename = "feeBps")]
    pub fee_bps: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DynamicSlippageReport {
    #[serde(rename = "amplificationRatio")]
    pub amplification_ratio: Option<String>,
    #[serde(rename = "otherAmount")]
    pub other_amount: Option<u64>,
    #[serde(rename = "simulatedIncurredSlippageBps")]
    pub simulated_incurred_slippage_bps: Option<u64>,
    #[serde(rename = "slippageBps")]
    pub slippage_bps: u64,
    #[serde(rename = "categoryName")]
    pub category_name: String,
    #[serde(rename = "heuristicMaxSlippageBps")]
    pub heuristic_max_slippage_bps: u64,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct QuoteOptions {
    pub swap_mode: Option<SwapMode>,
    pub dexes: Option<Vec<String>>,
    pub exclude_dexes: Option<Vec<String>>,
    pub restrict_intermediate_tokens: Option<bool>,
    pub only_direct_routes: Option<bool>,
    pub as_legacy_transaction: Option<bool>,
    pub max_accounts: Option<u16>,
    pub dynamic_slippage: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TokenNaming {
    pub symbol: String,
    pub mint: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SwapMode {
    ExactIn,
    ExactOut,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum PriorityLevel {
    #[serde(rename = "medium")]
    Medium,
    #[serde(rename = "high")]
    High,
    #[serde(rename = "veryHigh")]
    VeryHigh,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum SwapType {
    #[serde(rename = "aggregator")]
    Aggregator,
    #[serde(rename = "rfq")]
    Rfq,
    #[serde(rename = "hashflow")]
    Hashflow,
}
