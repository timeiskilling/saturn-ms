use crate::{
    endpoints::errors::ApiError, middleware::session_token::AuthenticatedUser,
    postgres::extractor::DatabaseConnection,
};
use axum::Json;
use saturn_errors::error::UserServiceError;
use serde_json::Value;

pub async fn save_user_bundles(
    user: AuthenticatedUser,
    mut db: DatabaseConnection,
    Json(payload): Json<Value>, // for now its value in future here been SaveBundlesPayload
) -> Result<&'static str, ApiError> {
    tracing::info!("Saving bundles for wallet: {}", user.wallet_address);

    sqlx::query!(
        r#"
        INSERT INTO user_bundles (wallet_address, bundles_data)
        VALUES ($1, $2)
        ON CONFLICT (wallet_address) DO UPDATE SET bundles_data = $2
        "#,
        user.wallet_address, // Use the verified address, NOT the one from the payload!
        payload              // playload.bundles in future
    )
    .execute(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok("Success!")
}

pub async fn insert_wallets(
    mut db: DatabaseConnection,
    user: AuthenticatedUser,
    public_key: String,
) -> Result<Value, ApiError> {
    sqlx::query!(
            r#"
            INSERT INTO user_bundles (wallet_address, linked_wallets)
            VALUES ($1, jsonb_build_array($2::text))
            ON CONFLICT (wallet_address)
            DO UPDATE SET linked_wallets = (user_bundles.linked_wallets - $2::text) || jsonb_build_array($2::text)
            "#,
            user.wallet_address,
            public_key
        )
        .execute(&mut *db.0)
        .await
        .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    let success_response = serde_json::json!({
        "status": "linked",
        "primary_wallet": user.wallet_address,
        "linked_wallet": public_key
    });
    Ok(success_response)
}
