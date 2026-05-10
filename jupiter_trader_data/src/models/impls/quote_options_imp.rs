use crate::models::jupiter_models::{QuoteOptions, SwapMode};

impl QuoteOptions {
    #[inline]
    pub fn to_params(&self) -> Vec<(&'static str, String)> {
        let mut params = Vec::with_capacity(9);

        macro_rules! add_param {
            ($field:ident, $name:literal) => {
                if let Some(ref value) = self.$field {
                    params.push(($name, value.to_string()));
                }
            };
            ($field:ident, $name:literal, join) => {
                if let Some(ref value) = self.$field {
                    if !value.is_empty() {
                        params.push(($name, value.join(",")));
                    }
                }
            };
        }

        add_param!(swap_mode, "swapMode");
        add_param!(restrict_intermediate_tokens, "restrictIntermediateTokens");
        add_param!(only_direct_routes, "onlyDirectRoutes");
        add_param!(as_legacy_transaction, "asLegacyTransaction");
        add_param!(max_accounts, "maxAccounts");
        add_param!(dynamic_slippage, "dynamicSlippage");
        add_param!(blockhash_slots_to_expiry, "blockhashSlotsToExpiry");

        params
    }

    pub fn cleaned(&self) -> Self {
        let mut cleaned = self.clone();

        let dexes_has_values = self.dexes.as_ref().is_some_and(|d| !d.is_empty());
        let exclude_has_values = self.exclude_dexes.as_ref().is_some_and(|d| !d.is_empty());

        if dexes_has_values && exclude_has_values {
            cleaned.exclude_dexes = None;
            tracing::warn!(
                "QuoteOptions: exclude_dexes has beb clean, exclude_dexes and alredy exist dexes"
            );
        }

        if let Some(val) = cleaned.blockhash_slots_to_expiry
            && !(1..=300).contains(&val)
        {
            tracing::warn!(
                "QuoteOptions: blockhash_slots_to_expiry must be between 1 and 300. Clamping value."
            );
            cleaned.blockhash_slots_to_expiry = Some(val.clamp(1, 300));
        }

        cleaned
    }
}

impl From<proto_models::grpc::QuoteOptions> for QuoteOptions {
    fn from(value: proto_models::grpc::QuoteOptions) -> Self {
        Self {
            swap_mode: match value.swap_mode {
                Some(0) => Some(SwapMode::ExactIn),
                Some(1) => Some(SwapMode::ExactOut),
                _ => None,
            },
            dexes: Some(value.dexes),
            exclude_dexes: Some(value.exclude_dexes),
            restrict_intermediate_tokens: value.restrict_intermediate_tokens.or(Some(true)),
            only_direct_routes: value.only_direct_routes.or(Some(false)),
            as_legacy_transaction: value.as_legacy_transaction.or(Some(false)),
            max_accounts: value.max_accounts.map(|x| x as u16).or(Some(64)),
            dynamic_slippage: value.dynamic_slippage,
            blockhash_slots_to_expiry: value.blockhash_slots_to_expiry.map(|x| x as u16),
        }
    }
}
