use crate::models::jupiter_models::{DynamicSlippageReport, JupiterUltraQuoteResponse};
use solana_sdk::pubkey::Pubkey;

impl Default for JupiterUltraQuoteResponse {
    fn default() -> Self {
        Self {
            input_mint: Pubkey::default(),
            output_mint: Pubkey::default(),
            in_amount: String::new(),
            out_amount: String::new(),
            other_amount_threshold: String::new(),
            swap_mode: String::new(),
            slippage_bps: 50,
            price_impact_pct: String::new(),
            route_plan: vec![],
            fee_bps: 50,
            prioritization_fee_lamports: 50,
            swap_type: String::new(),
            transaction: None,
            gasless: false,
            request_id: String::new(),
            total_time: 1,
            taker: None,
            quote_id: None,
            maker: None,
            expire_at: None,
            platform_fee: None,
            dynamic_slippage_report: Some(DynamicSlippageReport {
                amplification_ratio: None,
                other_amount: None,
                simulated_incurred_slippage_bps: None,
                slippage_bps: 50,
                category_name: String::new(),
                heuristic_max_slippage_bps: 100,
            }),
            mode: String::new(),
            router: String::new(),
            in_usd_value: 0.0,
            out_usd_value: 0.0,
            price_impact: 0.0,
            swap_usd_value: 0.0,
        }
    }
}
