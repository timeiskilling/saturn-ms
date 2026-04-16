use crate::postgres::models::{
    DeleteAccountResponse, LinkedWalletResponse, PromoteWalletResponse, SaveBundlesPayload,
    UnlinkWalletResponse, UnlinkedWalletResponse,
};
use crate::{
    endpoints::errors::ApiError, middleware::session_token::AuthenticatedUser,
    postgres::extractor::DatabaseConnection,
};
use axum::Json;
use saturn_errors::error::UserServiceError;

pub async fn save_user_bundles(
    user: AuthenticatedUser,
    mut db: DatabaseConnection,
    Json(payload): Json<SaveBundlesPayload>,
) -> Result<&'static str, ApiError> {
    tracing::info!("Saving bundles for wallet: {}", user.wallet_address);

    sqlx::query!(
        r#"
        INSERT INTO user_bundles (wallet_address, bundles_data)
        VALUES ($1, $2)
        ON CONFLICT (wallet_address) DO UPDATE SET bundles_data = $2
        "#,
        user.wallet_address,
        payload.bundles
    )
    .execute(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok("Success!")
}

pub async fn get_user_bundles(
    user: AuthenticatedUser,
    mut db: DatabaseConnection,
) -> Result<Json<serde_json::Value>, ApiError> {
    tracing::info!("Get bundles for wallet {}", user.wallet_address);

    let result = sqlx::query_scalar!(
        r#"
        SELECT bundles_data
        FROM user_bundles
        WHERE wallet_address = $1
        "#,
        user.wallet_address
    )
    .fetch_optional(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(Json(result.unwrap_or_else(|| serde_json::json!([]))))
}

pub async fn get_linked_wallets(
    user: AuthenticatedUser,
    mut db: DatabaseConnection,
) -> Result<Json<serde_json::Value>, ApiError> {
    tracing::info!("Get linked wallets for wallet {}", user.wallet_address);

    let result = sqlx::query_scalar!(
        r#"
        SELECT linked_wallets
        FROM user_bundles
        WHERE wallet_address = $1
        "#,
        user.wallet_address
    )
    .fetch_optional(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(Json(result.unwrap_or_else(|| serde_json::json!([]))))
}

pub async fn insert_wallets(
    mut db: DatabaseConnection,
    user: AuthenticatedUser,
    public_key: String,
) -> Result<LinkedWalletResponse, ApiError> {
    tracing::info!(
        "Insert wallet {} for user {}",
        public_key,
        user.wallet_address
    );

    if user.wallet_address == public_key {
        return Ok(LinkedWalletResponse {
            status: "linked".to_string(),
            primary_wallet: user.wallet_address,
            linked_wallet: public_key,
        });
    }

    sqlx::query!(
        "DELETE FROM user_bundles WHERE wallet_address = $1",
        public_key
    )
    .execute(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

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

    Ok(LinkedWalletResponse {
        status: "linked".to_string(),
        primary_wallet: user.wallet_address,
        linked_wallet: public_key,
    })
}

pub async fn check_if_is_linked_wallet(
    db: &mut DatabaseConnection,
    public_key: &str,
) -> Result<Option<String>, ApiError> {
    let result = sqlx::query_scalar!(
        r#"
        SELECT wallet_address
        FROM user_bundles
        WHERE linked_wallets @> jsonb_build_array($1::text)
        LIMIT 1
        "#,
        public_key
    )
    .fetch_optional(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(result)
}

pub async fn disconnect_wallet(
    user: AuthenticatedUser,
    mut db: DatabaseConnection,
    Json(payload): Json<crate::endpoints::models::TargetPayload>,
) -> Result<UnlinkedWalletResponse, ApiError> {
    sqlx::query!(
        "UPDATE user_bundles SET linked_wallets = linked_wallets - $1 WHERE wallet_address = $2",
        payload.target_wallet,
        user.wallet_address
    )
    .execute(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(UnlinkedWalletResponse {
        status: "unlinked".to_string(),
    })
}

pub async fn promote_wallet(
    mut db: DatabaseConnection,
    user: AuthenticatedUser,
    target_wallet: String,
) -> Result<PromoteWalletResponse, ApiError> {
    let result = sqlx::query!(
        r#"
            UPDATE user_bundles
            SET wallet_address = $1,
                linked_wallets = (linked_wallets - $1) || jsonb_build_array($2::text)
            WHERE wallet_address = $2 AND linked_wallets @> jsonb_build_array($1::text)
            "#,
        target_wallet,
        user.wallet_address
    )
    .execute(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(ApiError(UserServiceError::InternalError(
            "Target wallet is not a linked wallet".to_string(),
        )));
    }

    Ok(PromoteWalletResponse {
        status: "promoted".to_string(),
        new_primary: target_wallet,
    })
}

pub async fn unlink_wallet(
    mut db: DatabaseConnection,
    target_wallet: String,
) -> Result<UnlinkWalletResponse, ApiError> {
    let result = sqlx::query!(
        r#"
        UPDATE user_bundles
        SET linked_wallets = linked_wallets - $1
        WHERE linked_wallets @> jsonb_build_array($1::text)
        RETURNING wallet_address
        "#,
        target_wallet
    )
    .fetch_optional(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    match result {
        Some(row) => Ok(UnlinkWalletResponse {
            status: "unlinked".to_string(),
            new_primary: row.wallet_address,
        }),
        None => Err(ApiError(UserServiceError::InternalError(
            "Target wallet is not a linked wallet".to_string(),
        ))),
    }
}

pub async fn delete_account(
    mut db: DatabaseConnection,
    user: AuthenticatedUser,
) -> Result<DeleteAccountResponse, ApiError> {
    let result = sqlx::query!(
        "DELETE FROM user_bundles WHERE wallet_address = $1",
        user.wallet_address
    )
    .execute(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(ApiError(UserServiceError::InternalError(
            "User not found".to_string(),
        )));
    }

    Ok(DeleteAccountResponse {
        status: "deleted".to_string(),
    })
}
