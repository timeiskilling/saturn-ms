use axum::{Json, http::HeaderMap, response::IntoResponse};
use axum_extra::extract::cookie::Cookie;
use deadpool_redis::sentinel::Connection;
use reqwest::header::SET_COOKIE;
use serde_json::json;
use time::Duration;

use crate::{endpoints::errors::ApiError, redis::command::create_session};

pub async fn inject_token(
    pub_key: String,
    redis_conn: &mut Connection,
    user_agent: &str,
) -> Result<impl IntoResponse + use<>, ApiError> {
    let token = create_session(&pub_key, redis_conn, user_agent).await?;
    let cookie = Cookie::build(("saturn_session", token))
        .path("/")
        .http_only(true)
        .secure(false) // for testing
        .same_site(axum_extra::extract::cookie::SameSite::Strict)
        .max_age(Duration::days(7))
        .build();

    let mut headers = HeaderMap::new();
    headers.insert(SET_COOKIE, cookie.to_string().parse().unwrap());

    let body = Json(json!({
        "status": "success",
        "wallet": pub_key
    }));

    Ok((headers, body))
}
