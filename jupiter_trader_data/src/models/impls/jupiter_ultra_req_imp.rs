use crate::models::jupiter_models::JupiterUltraQuoteRequest;
use solana_sdk::pubkey::Pubkey;

impl JupiterUltraQuoteRequest {
    pub fn new(
        input_mint: Pubkey,
        output_mint: Pubkey,
        amount: String,
        taker: Pubkey,
        referral_account: Pubkey,
        referral_fee: u64,
    ) -> Self {
        Self {
            input_mint,
            output_mint,
            amount,
            taker: Some(taker),
            referral_account: Some(referral_account),
            referral_fee: Some(referral_fee),
            exclude_routers: None,
        }
    }

    pub fn change_referal_fee(mut self, fee: u64) -> Self {
        self.referral_fee = Some(fee);
        self
    }

    pub fn with_fee_account(mut self, fee_account: Pubkey) -> Self {
        self.referral_account = Some(fee_account);
        self
    }
}
