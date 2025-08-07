use crate::models::jupiter_models::JupiterUltraQuoteRequest;

impl JupiterUltraQuoteRequest {
    pub fn new(
        input_mint: String,
        output_mint: String,
        amount: String,
        taker: String,
        referral_account: String,
        referral_fee: u64,
    ) -> Self {
        Self {
            input_mint,
            output_mint,
            amount,
            taker : Some(taker),
            referral_account : Some(referral_account),
            referral_fee: Some(referral_fee),
            exclude_routers: None,
        }
    }


    pub fn change_referal_fee(mut self, fee : u64) -> Self {
        self.referral_fee = Some(fee);
        self
    }

    pub fn with_fee_account(mut self, fee_account: String) -> Self {
        self.referral_account = Some(fee_account);
        self
    }    

}

impl Default for JupiterUltraQuoteRequest {
    fn default() -> Self {
        Self {
            input_mint : String::new(), 
            output_mint : String::new(),
            amount: String::new(),
            taker: Default::default(),
            referral_account: Default::default(),
            referral_fee: Default::default(),
            exclude_routers: Default::default(),
        }
    }
}
