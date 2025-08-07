use crate::models::jupiter_models::QuoteOptions;

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

    params
}

    pub fn cleaned(&self) -> Self {
        let mut cleaned = self.clone();

        let dexes_has_values = self.dexes.as_ref().map_or(false, |d| !d.is_empty());
        let exclude_has_values = self.exclude_dexes.as_ref().map_or(false, |d| !d.is_empty());

        if dexes_has_values && exclude_has_values {
            cleaned.exclude_dexes = None;
            tracing::warn!("QuoteOptions: exclude_dexes has beb clean, exclude_dexes and alredy exist dexes");
        }

        cleaned
    }
}