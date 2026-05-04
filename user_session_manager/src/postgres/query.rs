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
use sqlx::Acquire;

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

    let result = sqlx::query!(
        r#"
        SELECT address, wallet_id, name, address_type
        FROM linked_wallets
        WHERE primary_wallet = $1
        "#,
        user.wallet_address
    )
    .fetch_all(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    let wallets: Vec<serde_json::Value> = result
        .into_iter()
        .map(|row| {
            serde_json::json!({
                "address": row.address,
                "wallet_id": row.wallet_id,
                "name": row.name,
                "address_type": row.address_type,
            })
        })
        .collect();

    Ok(Json(serde_json::Value::Array(wallets)))
}

pub async fn insert_wallets(
    mut db: DatabaseConnection,
    user: AuthenticatedUser,
    public_key: String,
    wallet_id: String,
    name: String,
    address_type: String,
) -> Result<LinkedWalletResponse, ApiError> {
    tracing::info!(
        "Insert wallet {} for user {}",
        public_key,
        user.wallet_address
    );

    let hashed_public_key = crate::hash::hash_wallet_address(&public_key);

    if user.wallet_address == hashed_public_key {
        return Ok(LinkedWalletResponse {
            status: "linked".to_string(),
            primary_wallet: user.wallet_address,
            linked_wallet: public_key,
        });
    }

    sqlx::query!(
        r#"
            INSERT INTO linked_wallets (primary_wallet, address, wallet_id, name, address_type)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (address) DO NOTHING
            "#,
        user.wallet_address,
        hashed_public_key,
        wallet_id,
        name,
        address_type
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

pub async fn check_if_is_primary_wallet(
    db: &mut DatabaseConnection,
    public_key: &str,
) -> Result<bool, ApiError> {
    let hashed_public_key = crate::hash::hash_wallet_address(public_key);
    let result = sqlx::query_scalar!(
        r#"
        SELECT EXISTS(
            SELECT 1 FROM user_bundles WHERE wallet_address = $1
        )
        "#,
        hashed_public_key
    )
    .fetch_one(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(result.unwrap_or(false))
}

pub async fn check_if_is_linked_wallet(
    db: &mut DatabaseConnection,
    public_key: &str,
) -> Result<Option<String>, ApiError> {
    let hashed_public_key = crate::hash::hash_wallet_address(public_key);
    let result = sqlx::query_scalar!(
        r#"
        SELECT primary_wallet
        FROM linked_wallets
        WHERE address = $1
        LIMIT 1
        "#,
        hashed_public_key
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
        "DELETE FROM linked_wallets WHERE address = $1 AND primary_wallet = $2",
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
    old_primary_wallet_id: String,
    old_primary_name: String,
    old_primary_address_type: String,
) -> Result<PromoteWalletResponse, ApiError> {
    let linked_wallet = sqlx::query!(
        r#"
        SELECT wallet_id, name, address_type
        FROM linked_wallets
        WHERE address = $1 AND primary_wallet = $2
        "#,
        target_wallet,
        user.wallet_address
    )
    .fetch_optional(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    if linked_wallet.is_none() {
        return Err(ApiError(UserServiceError::InternalError(
            "Target wallet is not a linked wallet".to_string(),
        )));
    }

    let mut tx =
        db.0.begin()
            .await
            .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    let bundle_data = sqlx::query_scalar!(
        "SELECT bundles_data FROM user_bundles WHERE wallet_address = $1",
        user.wallet_address
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    sqlx::query!(
        r#"
        INSERT INTO user_bundles (wallet_address, bundles_data)
        VALUES ($1, $2)
        ON CONFLICT (wallet_address) DO UPDATE SET bundles_data = $2
        "#,
        target_wallet,
        bundle_data
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    sqlx::query!(
        "UPDATE linked_wallets SET primary_wallet = $1 WHERE primary_wallet = $2",
        target_wallet,
        user.wallet_address
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    sqlx::query!(
        "DELETE FROM linked_wallets WHERE address = $1",
        target_wallet
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    sqlx::query!(
        r#"
        INSERT INTO linked_wallets (primary_wallet, address, wallet_id, name, address_type)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (address) DO NOTHING
        "#,
        target_wallet,
        user.wallet_address,
        old_primary_wallet_id,
        old_primary_name,
        old_primary_address_type
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    sqlx::query!(
        "DELETE FROM user_bundles WHERE wallet_address = $1",
        user.wallet_address
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    tx.commit()
        .await
        .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(PromoteWalletResponse {
        status: "promoted".to_string(),
        new_primary: target_wallet,
    })
}

pub async fn unlink_wallet(
    mut db: DatabaseConnection,
    target_wallet: String,
) -> Result<UnlinkWalletResponse, ApiError> {
    let hashed_target = crate::hash::hash_wallet_address(&target_wallet);
    let result = sqlx::query!(
        r#"
        DELETE FROM linked_wallets
        WHERE address = $1
        RETURNING primary_wallet
        "#,
        hashed_target
    )
    .fetch_optional(&mut *db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    match result {
        Some(row) => Ok(UnlinkWalletResponse {
            status: "unlinked".to_string(),
            new_primary: row.primary_wallet,
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
