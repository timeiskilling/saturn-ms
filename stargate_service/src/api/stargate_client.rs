use base64::Engine;

use crate::{
    api::{
        quote::{QuotesRequest, QuotesResponse},
        tokens::{TokensRequest, TokensResponse},
    },
    handlers::ResponseByQuote,
};

pub struct StargateClient {
    pub client: reqwest::Client,
    pub base_url: String,
}

impl StargateClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::builder().build().unwrap(),
            base_url: "https://stargate.finance/api/v1".to_string(),
        }
    }

    pub async fn get_token_exchange(
        &self,
        token_params: TokensRequest,
    ) -> Result<TokensResponse, Box<dyn std::error::Error + Send + Sync>> {
        let tokens_url = format!("{}/tokens", self.base_url);

        let response = self
            .client
            .get(tokens_url)
            .query(&token_params)
            .send()
            .await
            .map_err(|err| {
                tracing::error!("Invalid send request: {}", err);
                err
            })?;

        let response_data = response.json::<TokensResponse>().await.map_err(|err| {
            tracing::error!("Invalid parsing into json: {}", err);
            err
        })?;

        Ok(response_data)
    }

    pub async fn get_quote_transaction(
        &self,
        quote_params: QuotesRequest,
    ) -> Result<ResponseByQuote, Box<dyn std::error::Error + Send + Sync>> {
        let quote_url = format!("{}/quotes", self.base_url);

        let response = self
            .client
            .get(quote_url)
            .query(&quote_params)
            .send()
            .await
            .map_err(|err| {
                tracing::error!("Invalid send request: {}", err);
                err
            })?;

        let response_data = response.json::<QuotesResponse>().await.map_err(|err| {
            tracing::error!("Invalid parsing into json: {}", err);
            err
        })?;
        let price = (
            response_data.quotes[0].src_amount.clone(),
            response_data.quotes[0].dst_amount.clone(),
        );
        let steps = response_data.quotes[0].steps.clone();

        let transactions = steps
            .into_iter()
            .map(|step| -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
                let s = step.transaction.data.trim();

                let bytes = if s.starts_with("0x") {
                    hex::decode(s.trim_start_matches("0x")).map_err(|e| {
                        tracing::error!("hex decode error: {} (data: {})", e, s);
                        Box::<dyn std::error::Error + Send + Sync>::from(format!("hex decode error: {}", e))
                    })?
                } else {
                    base64::engine::general_purpose::STANDARD.decode(s).map_err(|e| {
                        tracing::error!("base64 decode error: {} (data: {})", e, s);
                        Box::<dyn std::error::Error + Send + Sync>::from(format!("base64 decode error: {}", e))
                    })?
                };

                Ok(bs58::encode(bytes).into_string())
            })
            .collect::<Result<Vec<_>, _>>()?;
        Ok(ResponseByQuote {
            transactions,
            price,
        })
    }
}
