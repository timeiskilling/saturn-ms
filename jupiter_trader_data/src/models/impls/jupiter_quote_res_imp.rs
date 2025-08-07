use crate::models::jupiter_models::{JupiterQuoteResponse, SwapMode};

impl Default for JupiterQuoteResponse {
    fn default() -> Self {
        Self {
            input_mint: String::new(),
            in_amount: String::new(),
            output_mint: String::new(),
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