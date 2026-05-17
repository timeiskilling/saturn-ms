use crate::postgres::extractor::DbPool;
use crate::postgres::models::{
    DeleteAccountResponse, LinkedWalletResponse, PromoteWalletResponse, SaveBundlesPayload,
    UnlinkWalletResponse, UnlinkedWalletResponse,
};
use crate::{endpoints::errors::ApiError, middleware::session_token::AuthenticatedUser};
use axum::Json;
use saturn_errors::error::UserServiceError;

pub async fn save_user_bundles(
    user: AuthenticatedUser,
    db: DbPool,
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
    .execute(&db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok("Success!")
}

pub async fn get_user_bundles(
    user: AuthenticatedUser,
    db: DbPool,
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
    .fetch_optional(&db.0)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(Json(result.unwrap_or_else(|| serde_json::json!([]))))
}

pub async fn get_linked_wallets(
    user: AuthenticatedUser,
    db: DbPool,
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
    .fetch_all(&db.0)
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
    db: &sqlx::PgPool,
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

    if user.wallet_address == public_key {
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
        public_key,
        wallet_id,
        name,
        address_type
    )
    .execute(db)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(LinkedWalletResponse {
        status: "linked".to_string(),
        primary_wallet: user.wallet_address,
        linked_wallet: public_key,
    })
}

pub struct WalletStatus {
    pub is_primary: bool,
    pub linked_to: Option<String>,
}

pub async fn check_if_is_linked_wallet(
    db: &sqlx::PgPool,
    public_key: &str,
) -> Result<bool, ApiError> {
    let result = sqlx::query_scalar!(
        r#"
        SELECT EXISTS(
            SELECT 1 FROM linked_wallets WHERE address = $1
        )
        "#,
        public_key
    )
    .fetch_one(db)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(result.unwrap_or(false))
}

// pub async fn check_if_linked_to_someone_else(
//     db: &sqlx::PgPool,
//     public_key: &str,
//     current_user_wallet: &str,
// ) -> Result<bool, ApiError> {
//     let result = sqlx::query_scalar!(
//         r#"
//         SELECT EXISTS(
//             SELECT 1 FROM linked_wallets
//             WHERE address = $1 AND primary_wallet != $2
//         )
//         "#,
//         public_key,
//         current_user_wallet
//     )
//     .fetch_one(db)
//     .await
//     .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

//     Ok(result.unwrap_or(false))
// }

pub async fn get_wallet_status(
    pool: &sqlx::PgPool,
    public_key: &str,
) -> Result<WalletStatus, ApiError> {
    let record = sqlx::query!(
        r#"
        SELECT
            EXISTS(SELECT 1 FROM user_bundles WHERE wallet_address = $1) AS is_primary,
            (SELECT primary_wallet FROM linked_wallets WHERE address = $1 LIMIT 1) AS linked_to
        "#,
        public_key
    )
    .fetch_one(pool)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(WalletStatus {
        is_primary: record.is_primary.unwrap_or(false),
        linked_to: record.linked_to,
    })
}

pub async fn disconnect_wallet(
    user: AuthenticatedUser,
    db: &sqlx::PgPool,
    Json(payload): Json<crate::endpoints::models::TargetPayload>,
) -> Result<UnlinkedWalletResponse, ApiError> {
    sqlx::query!(
        "DELETE FROM linked_wallets WHERE address = $1 AND primary_wallet = $2",
        payload.target_wallet,
        user.wallet_address
    )
    .execute(db)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(UnlinkedWalletResponse {
        status: "unlinked".to_string(),
    })
}

pub enum LoginEligibility {
    NewWallet,
    FreeWallet,
    IsPrimary,
    IsLinked,
}

pub async fn acquire_login_lock_and_check(
    pool: &sqlx::PgPool,
    hashed_public_key: &str,
) -> Result<LoginEligibility, ApiError> {
    let mut tx = pool
        .begin()
        .await
        .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    let lock_key = {
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        std::hash::Hash::hash(hashed_public_key, &mut hasher);
        std::hash::Hasher::finish(&hasher) as i64
    };

    sqlx::query("SELECT pg_advisory_xact_lock($1)")
        .bind(lock_key)
        .execute(&mut *tx)
        .await
        .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    let record = sqlx::query!(
        r#"
        SELECT
            EXISTS(
                SELECT 1 FROM user_bundles WHERE wallet_address = $1
            ) AS is_primary,
            (
                SELECT primary_wallet FROM linked_wallets WHERE address = $1 LIMIT 1
            ) AS linked_to
        "#,
        hashed_public_key
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    let eligibility = match (record.is_primary.unwrap_or(false), record.linked_to) {
        (_, Some(_)) => LoginEligibility::IsLinked,
        (true, None) => LoginEligibility::IsPrimary,
        (false, None) => LoginEligibility::FreeWallet,
    };

    tx.commit()
        .await
        .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    Ok(eligibility)
}

pub async fn promote_wallet(
    db: &sqlx::PgPool,
    user: AuthenticatedUser,
    target_wallet: String,
    old_primary_wallet_id: String,
    old_primary_name: String,
    old_primary_address_type: String,
) -> Result<PromoteWalletResponse, ApiError> {
    let mut tx = db
        .begin()
        .await
        .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    let lock_key = {
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        std::hash::Hash::hash(&target_wallet, &mut hasher);
        std::hash::Hasher::finish(&hasher) as i64
    };

    sqlx::query("SELECT pg_advisory_xact_lock($1)")
        .bind(lock_key)
        .execute(&mut *tx)
        .await
        .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    let is_linked = sqlx::query_scalar!(
        r#"
            SELECT EXISTS(
                SELECT 1 FROM linked_wallets
                WHERE address = $1 AND primary_wallet = $2
            )
            "#,
        target_wallet,
        user.wallet_address
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    if !is_linked.unwrap_or(false) {
        return Err(ApiError(UserServiceError::InternalError(
            "Target wallet is not a linked wallet".to_string(),
        )));
    }

    sqlx::query!(
        r#"
            INSERT INTO user_bundles (wallet_address, bundles_data)
            SELECT $1, bundles_data FROM user_bundles WHERE wallet_address = $2
            ON CONFLICT (wallet_address)
            DO UPDATE SET bundles_data = EXCLUDED.bundles_data
            "#,
        target_wallet,
        user.wallet_address
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
    db: &sqlx::PgPool,
    target_wallet: String,
) -> Result<UnlinkWalletResponse, ApiError> {
    let result = sqlx::query!(
        r#"
        DELETE FROM linked_wallets
        WHERE address = $1
        "#,
        target_wallet
    )
    .fetch_optional(db)
    .await
    .map_err(|e| UserServiceError::PostgresError(e.to_string()))?;

    match result {
        Some(_) => Ok(UnlinkWalletResponse {
            status: "unlinked".to_string(),
        }),
        None => Err(ApiError(UserServiceError::InternalError(
            "Target wallet is not a linked wallet".to_string(),
        ))),
    }
}

pub async fn delete_account(
    db: &sqlx::PgPool,
    wallet_address: &str,
) -> Result<DeleteAccountResponse, ApiError> {
    let result = sqlx::query!(
        "DELETE FROM user_bundles WHERE wallet_address = $1",
        wallet_address
    )
    .execute(db)
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
