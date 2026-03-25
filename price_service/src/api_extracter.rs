use axum::{extract::FromRequestParts, http::request::Parts};
use reqwest::StatusCode;

pub struct Client;

impl<T> FromRequestParts<T> for Client
where
    T: Send + Sync,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts(parts: &mut Parts, _: &T) -> Result<Self, Self::Rejection> {
        let _auth_header = parts
            .headers
            .get("X-Auth-Token")
            .and_then(|header| header.to_str().ok())
            .ok_or((StatusCode::UNAUTHORIZED, "Unauthorized"))?;

        // todo: validate auth_header against state
        //
        Ok(Client)
    }
}
