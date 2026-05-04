use deadpool_redis::sentinel::Connection;
use redis::AsyncCommands;
use saturn_errors::error::UserServiceError;

use crate::{auth_manager::nonce::generate_nonce, redis::models::DeviceSession};

pub struct NonceResponse {
    pub nonce: String,
    pub request_id: String,
}

pub async fn fetch_nonce_from_redis(
    conn: &mut Connection,
    request_id: &str,
) -> Result<String, UserServiceError> {
    let redis_key = format!("auth_nonce:{}", request_id);
    let nonce: Option<String> = conn
        .get(redis_key)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;
    nonce.ok_or(UserServiceError::InvalidNonce)
}

pub async fn write_get_nonce_to_redis(
    conn: &mut Connection,
) -> Result<NonceResponse, UserServiceError> {
    let request_id = uuid::Uuid::new_v4().to_string();
    let raw_nonce = generate_nonce();
    let nonce_string = bs58::encode(raw_nonce).into_string();

    let redis_key = format!("auth_nonce:{}", request_id);
    conn.set_ex::<_, _, ()>(redis_key, &nonce_string, 300)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    Ok(NonceResponse {
        nonce: nonce_string,
        request_id,
    })
}

pub async fn delete_nonce_from_redis(
    conn: &mut Connection,
    request_id: &str,
) -> Result<(), UserServiceError> {
    let redis_key = format!("auth_nonce:{}", request_id);
    let _: () = conn
        .del(redis_key)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;
    Ok(())
}

pub async fn create_session(
    pub_key: &str,
    redis_client: &mut Connection,
    user_agent: &str,
) -> Result<String, UserServiceError> {
    let hashed_pub_key = crate::hash::hash_wallet_address(pub_key);

    let token = {
        let mut rng = rand::rng();
        let mut token_bytes = [0u8; 32];
        rand::Rng::fill_bytes(&mut rng, &mut token_bytes);
        bs58::encode(token_bytes).into_string()
    };

    let public_session_id = uuid::Uuid::new_v4().to_string();

    let session_data = serde_json::json!({
        "public_id": public_session_id,
        "wallet": hashed_pub_key,
        "device_name": user_agent,
        "created_at": chrono::Utc::now().to_rfc3339()
    })
    .to_string();

    redis_client
        .set_ex::<_, _, ()>(format!("session:{}", token), session_data.clone(), 604800)
        .await
        .map_err(|e| saturn_errors::error::UserServiceError::RedisError(e.to_string()))?;

    redis_client
        .set_ex::<_, _, ()>(
            format!("public_session:{}", public_session_id),
            token.clone(),
            604800,
        )
        .await
        .map_err(|e| saturn_errors::error::UserServiceError::RedisError(e.to_string()))?;

    redis_client
        .sadd::<_, _, ()>(
            format!("user_devices:{}", hashed_pub_key),
            &public_session_id,
        )
        .await
        .map_err(|e| saturn_errors::error::UserServiceError::RedisError(e.to_string()))?;

    Ok(token)
}

pub async fn get_session(
    token: &str,
    redis_client: &mut Connection,
) -> Result<DeviceSession, UserServiceError> {
    let key = format!("session:{}", token);

    let session_data: Option<String> = redis_client
        .get(&key)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    let json_string = session_data.ok_or(UserServiceError::SessionNotFound)?;

    serde_json::from_str(&json_string).map_err(|e| UserServiceError::InternalError(e.to_string()))
}

pub async fn get_devices(
    pub_key: &str,
    redis_client: &mut Connection,
) -> Result<Vec<DeviceSession>, UserServiceError> {
    let devices_key = format!("user_devices:{}", pub_key);

    let public_ids: Vec<String> = redis_client
        .smembers(&devices_key)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    if public_ids.is_empty() {
        return Ok(vec![]);
    }

    let public_keys_to_fetch: Vec<String> = public_ids
        .iter()
        .map(|id| format!("public_session:{}", id))
        .collect();

    let secret_tokens: Vec<Option<String>> = redis_client
        .mget(&public_keys_to_fetch)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    let session_keys_to_fetch: Vec<String> = secret_tokens
        .into_iter()
        .flatten()
        .map(|token| format!("session:{}", token))
        .collect();

    if session_keys_to_fetch.is_empty() {
        return Ok(vec![]);
    }

    let session_json_strings: Vec<Option<String>> = redis_client
        .mget(&session_keys_to_fetch)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    let mut devices = Vec::new();
    for json_str in session_json_strings.into_iter().flatten() {
        if let Ok(device_session) = serde_json::from_str::<DeviceSession>(&json_str) {
            devices.push(device_session);
        } else {
            tracing::warn!("Failed to parse a device session from Redis: {}", json_str);
        }
    }

    Ok(devices)
}

pub async fn delete_session(
    token: &str,
    redis_client: &mut Connection,
) -> Result<(), UserServiceError> {
    let session = get_session(token, redis_client).await?;

    let _: () = redis_client
        .del(format!("session:{}", token))
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    let _: () = redis_client
        .del(format!("public_session:{}", session.public_id))
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    let _: () = redis_client
        .srem(
            format!("user_devices:{}", session.wallet),
            session.public_id,
        )
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    Ok(())
}

pub async fn disconnect_device(
    public_id: &str,
    redis_client: &mut Connection,
) -> Result<(), UserServiceError> {
    let token: Option<String> = redis_client
        .get(format!("public_session:{}", public_id))
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    if let Some(secret_token) = token {
        delete_session(&secret_token, redis_client).await?;
    }

    Ok(())
}

pub async fn delete_all_user_sessions(
    pub_key: &str,
    redis_client: &mut Connection,
) -> Result<(), UserServiceError> {
    let devices_key = format!("user_devices:{}", pub_key);

    let public_ids: Vec<String> = redis_client
        .smembers(&devices_key)
        .await
        .map_err(|e| UserServiceError::RedisError(e.to_string()))?;

    for public_id in public_ids {
        let _ = disconnect_device(&public_id, redis_client).await;
    }

    Ok(())
}
