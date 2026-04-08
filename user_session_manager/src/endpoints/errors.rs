use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use saturn_errors::error::UserServiceError;
use serde_json::json;

// We wrap the external UserServiceError in a newtype struct
// so we can implement Axum's IntoResponse trait for it locally.
pub struct ApiError(pub UserServiceError);

impl From<UserServiceError> for ApiError {
    fn from(err: UserServiceError) -> Self {
        ApiError(err)
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self.0 {
            UserServiceError::InvalidSignature | UserServiceError::InvalidNonce => {
                (StatusCode::BAD_REQUEST, self.0.to_string())
            }
            UserServiceError::SessionNotFound
            | UserServiceError::SessionExpired
            | UserServiceError::Unauthorized => (StatusCode::UNAUTHORIZED, self.0.to_string()),
            UserServiceError::DatabaseError(_)
            | UserServiceError::RedisError(_)
            | UserServiceError::PostgresError(_)
            | UserServiceError::InternalError(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error".to_string(),
            ),
        };

        let body = Json(json!({
            "error": error_message,
        }));

        (status, body).into_response()
    }
}
