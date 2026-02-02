use crate::models::jupiter_models::{JupiterQuoteResponse, SwapMode};
use solana_sdk::pubkey::Pubkey;

impl Default for JupiterQuoteResponse {
    fn default() -> Self {
        Self {
            input_mint: Pubkey::default(),
            in_amount: String::new(),
            output_mint: Pubkey::default(),
            out_amount: String::new(),
            other_amount_threshold: String::new(),
            swap_mode: SwapMode::ExactIn,
            slippage_bps: 50,
            platform_fee: None,
            price_impact_pct: "0".to_string(),
            route_plan: Vec::new(),
        }
    }
}
