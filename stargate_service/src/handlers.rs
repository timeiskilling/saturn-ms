use std::sync::Arc;
use axum::{extract::State, Json};
use serde::{Deserialize,Serialize};

use crate::{api::{quote::QuotesRequest, stargate_client::StargateClient}, error::SaturnError};

#[derive(Serialize,Deserialize,Debug,Clone)]
pub struct ResponseByQuote {
    pub transactions : Vec<String>,
    pub price : (String,String)
}

pub async fn get_quote(
    State(state): State<Arc<StargateClient>>,
    Json(quote_request): Json<QuotesRequest>,
) -> Result<Json<ResponseByQuote>, SaturnError> {
    tracing::debug!("API V1 get_quote request: {:?}", quote_request);
    let task = tokio::spawn(async move {
        state.get_quote_transaction(quote_request).await
    });
    match task.await {
        Ok(result_from_function) => {
            match result_from_function {
                Ok(response_data) => Ok(Json(response_data)),
                Err(e) => {
                    Err(SaturnError::InternalServerError(e.to_string())) 
                }
            }
        },
        Err(join_error) => {
            tracing::error!("Task panicked: {}", join_error);
            Err(SaturnError::from(join_error))
        }
    }
}