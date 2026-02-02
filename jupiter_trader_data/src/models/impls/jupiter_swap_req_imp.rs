use crate::models::jupiter_models::{
    JupiterQuoteResponse, JupiterSwapRequest, PrioritizationFeeLamports, PriorityLevel,
    PriorityLevelWithMaxLamports, SwapMode,
};
use solana_sdk::pubkey::Pubkey;

impl JupiterSwapRequest {
    pub fn new(
        user_public_key: Pubkey,
        quote_response: JupiterQuoteResponse,
        max_lamports: u64,
        priority_level: PriorityLevel,
        dynamic_compute_unit_limit: bool,
    ) -> Self {
        Self {
            user_public_key,
            quote_response,
            prioritization_fee_lamports: PrioritizationFeeLamports {
                priority_level_with_max_lamports: PriorityLevelWithMaxLamports {
                    max_lamports,
                    priority_level,
                },
            },
            dynamic_compute_unit_limit,
            wrap_and_unwrap_sol: None,
            fee_account: None,
        }
    }

    pub fn with_wrap_unwrap_sol(mut self, wrap: bool) -> Self {
        self.wrap_and_unwrap_sol = Some(wrap);
        self
    }

    pub fn with_fee_account(mut self, fee_account: Pubkey) -> Self {
        self.fee_account = Some(fee_account);
        self
    }
}

impl Default for JupiterSwapRequest {
    fn default() -> Self {
        Self {
            user_public_key: Pubkey::default(),
            quote_response: JupiterQuoteResponse {
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
            },
            prioritization_fee_lamports: PrioritizationFeeLamports {
                priority_level_with_max_lamports: PriorityLevelWithMaxLamports {
                    max_lamports: 10000000,
                    priority_level: PriorityLevel::VeryHigh,
                },
            },
            dynamic_compute_unit_limit: true,
            wrap_and_unwrap_sol: None,
            fee_account: None,
        }
    }
}
