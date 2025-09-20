use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json; 
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SaturnError {

    
    #[error("Template with ID '{0}' not found")]
    TemplateNotFound(String),

    #[error("Execution with ID '{0}' not found")]
    ExecutionNotFound(String),

    #[error("Failed to create template: {0}")]
    TemplateCreationError(String),

    #[error("Bundle execution failed: {0}")]
    BundleExecutionFailed(String),

    #[error("Failed to send bundle to Jito: {0}")]
    JitoSendError(String),

    #[error("Failed to get quote from Jupiter: {0}")]
    JupiterQuoteError(String),

    #[error("Failed to retrieve balance: {0}")]
    BalanceError(String),

    #[error("Failed to check bundle status: {0}")]
    BundleStatusError(String),

    #[error("Dynamic amount calculation not implemented: {0}")]
    DynamicAmountNotImplemented(String),

    #[error("Retry not allowed in current execution state: {0}")]
    RetryNotAllowed(String),

    #[error("Failed to cancel execution: {0}")]
    CancellationFailed(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("I/O error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Tokio task join error: {0}")]
    JoinError(#[from] tokio::task::JoinError),

    #[error("External SDK/library error: {source}")]
    SdkError {
        #[source]
        source: Box<dyn std::error::Error + Send + Sync>,
        context: String,
    },

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("Operation timed out: {0}")]
    TimeoutError(String),

    #[error("Internal server error: {0}")]
    InternalServerError(String),
}

impl IntoResponse for SaturnError {
    fn into_response(self) -> Response {
        let (status, error_message, error_code_str) = match &self {
            SaturnError::TemplateNotFound(_id) | SaturnError::ExecutionNotFound(_id) => {
                (StatusCode::NOT_FOUND, format!("{}", self), "NOT_FOUND".to_string())
            }
            SaturnError::InvalidInput(msg) => {
                (StatusCode::BAD_REQUEST, msg.clone(), "INVALID_INPUT".to_string())
            }
            SaturnError::DynamicAmountNotImplemented(_) => {
                (StatusCode::BAD_REQUEST, format!("{}", self), "DYNAMIC_AMOUNT_NOT_IMPLEMENTED".to_string())
            }
            SaturnError::RetryNotAllowed(_) => {
                (StatusCode::CONFLICT, format!("{}", self), "RETRY_NOT_ALLOWED".to_string()) 
            }
            SaturnError::TemplateCreationError(msg) => {
                
                (StatusCode::INTERNAL_SERVER_ERROR, msg.clone(), "TEMPLATE_CREATION_FAILED".to_string())
            }
            
            SaturnError::JitoSendError(_) | SaturnError::JupiterQuoteError(_) |
            SaturnError::BalanceError(_) | SaturnError::BundleStatusError(_) |
            SaturnError::BundleExecutionFailed(_) => {
                (StatusCode::SERVICE_UNAVAILABLE, format!("{}", self), "EXTERNAL_SERVICE_ERROR".to_string())
            }
            SaturnError::CancellationFailed(_) => {
                
                (StatusCode::INTERNAL_SERVER_ERROR, format!("{}", self), "CANCELLATION_FAILED".to_string())
            }
            SaturnError::ConfigError(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, format!("{}", self), "CONFIG_ERROR".to_string())
            }
            SaturnError::TimeoutError(_) => {
                (StatusCode::GATEWAY_TIMEOUT, format!("{}", self), "TIMEOUT_ERROR".to_string())
            }
            
            SaturnError::IoError(_) | SaturnError::JoinError(_) | SaturnError::SdkError {..} | SaturnError::InternalServerError(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, format!("{}", self), "INTERNAL_SERVER_ERROR".to_string())
            }
        };

        let body = Json(json!({
            "error": {
                "code": error_code_str, 
                "message": error_message,
            }
        }));

        (status, body).into_response()
    }
}

impl SaturnError {
    pub fn sdk_error<E>(error: E, context: impl Into<String>) -> Self
    where
        E: std::error::Error + Send + Sync + 'static,
    {
        SaturnError::SdkError {
            source: Box::new(error),
            context: context.into(),
        }
    }
}