use jsonwebtoken::{DecodingKey, EncodingKey};
use std::{fmt, net::SocketAddr};
use url::Url;

#[derive(Clone)]
pub struct JwtKeys {
    pub encoding: EncodingKey,
    pub decoding: DecodingKey,
}

#[derive(Clone, Debug)]
pub struct Config {
    // REST API configuration.
    pub service_host: String,
    pub service_port: u16,

    // Redis configuration.
    pub redis_host: String,
    pub redis_port: u16,

    // PostgreSQL configuration.
    pub postgres_user: String,
    pub postgres_password: String,
    pub postgres_host: String,
    pub postgres_port: u16,
    pub postgres_db: String,
    pub postgres_connection_pool: u32,

    // JWT configuration.
    // pub jwt_secret: String,
    // pub jwt_keys: JwtKeys,
    // pub jwt_expire_access_token_seconds: i64,
    // pub jwt_expire_refresh_token_seconds: i64,
    // pub jwt_validation_leeway_seconds: i64,
    // pub jwt_enable_revoked_tokens: bool,
    pub jupiter_api_key: String,
    pub helius_api_key: String,

    pub jito_tip_redis_host: String,
    pub jito_tip_redis_port: u16,

    pub notification_redis_host: String,
    pub notification_redis_port: u16,

    pub notification_sentinel_urls: Vec<String>,
    pub notification_sentinel_master_name: String,

    pub alt_redis_host: String,
    pub alt_redis_port: u16,

    pub price_redis_host: String,
    pub price_redis_port: u16,

    pub price_service_host: String,
    pub price_service_port: u16,

    pub user_manager_sentinel_urls: Vec<String>,
    pub user_manager_sentinel_master_name: String,

    pub user_manager_host: String,
    pub user_manager_port: u16,
}

impl Config {
    pub fn service_socket_addr(&self) -> SocketAddr {
        use std::str::FromStr;
        SocketAddr::from_str(&format!("{}:{}", self.service_host, self.service_port)).unwrap()
    }

    pub fn user_manager_socket_addr(&self) -> SocketAddr {
        use std::str::FromStr;
        SocketAddr::from_str(&format!(
            "{}:{}",
            self.user_manager_host, self.user_manager_port
        ))
        .unwrap()
    }

    pub fn price_service_socket_addr(&self) -> SocketAddr {
        use std::str::FromStr;
        SocketAddr::from_str(&format!(
            "{}:{}",
            self.price_service_host, self.price_service_port
        ))
        .unwrap()
    }

    pub fn redis_url(&self) -> String {
        format!("redis://{}:{}", self.redis_host, self.redis_port)
    }

    pub fn notification_redis_url(&self) -> String {
        format!(
            "redis://{}:{}",
            self.notification_redis_host, self.notification_redis_port
        )
    }

    pub fn jito_tip_redis_url(&self) -> String {
        format!(
            "redis://{}:{}",
            self.jito_tip_redis_host, self.jito_tip_redis_port
        )
    }

    pub fn alt_redis_url(&self) -> String {
        format!("redis://{}:{}", self.alt_redis_host, self.alt_redis_port)
    }

    pub fn price_redis_url(&self) -> String {
        format!(
            "redis://{}:{}",
            self.price_redis_host, self.price_redis_port
        )
    }

    pub fn helius_url(&self) -> String {
        format!(
            "https://mainnet.helius-rpc.com/?api-key={}",
            self.helius_api_key
        )
    }

    pub fn postgres_url(&self) -> String {
        format!(
            "postgresql://{}:{}@{}:{}/{}",
            self.postgres_user,
            self.postgres_password,
            self.postgres_host,
            self.postgres_port,
            self.postgres_db
        )
    }
}

pub fn load() -> Config {
    let env_file = if env_get_or("ENV_TEST", "0") == "1" {
        ".env_test"
    } else {
        ".env"
    };

    // Try to load environment variables from file.
    if dotenvy::from_filename(env_file).is_ok() {
        tracing::info!("{} file loaded", env_file);
    } else {
        tracing::info!("{} file not found, using existing environment", env_file);
    }

    // let jwt_secret = env_get("JWT_SECRET");

    // Parse configuration.
    let config = Config {
        service_host: env_get("SERVICE_HOST"),
        service_port: env_parse("SERVICE_PORT"),
        redis_host: env_get("REDIS_HOST"),
        redis_port: env_parse("REDIS_PORT"),
        // jwt_keys: JwtKeys::new(jwt_secret.as_bytes()),
        // jwt_secret,
        // jwt_expire_access_token_seconds: env_parse("JWT_EXPIRE_ACCESS_TOKEN_SECONDS"),
        // jwt_expire_refresh_token_seconds: env_parse("JWT_EXPIRE_REFRESH_TOKEN_SECONDS"),
        // jwt_validation_leeway_seconds: env_parse("JWT_VALIDATION_LEEWAY_SECONDS"),
        // jwt_enable_revoked_tokens: env_parse("JWT_ENABLE_REVOKED_TOKENS"),
        jito_tip_redis_host: env_get("JITO_TIP_REDIS_HOST"),
        jito_tip_redis_port: env_parse("JITO_TIP_REDIS_PORT"),
        alt_redis_host: env_get("ATL_REDIS_HOST"),
        alt_redis_port: env_parse("ATL_REDIS_PORT"),

        jupiter_api_key: env_get("JUPITER_API_KEY"),
        helius_api_key: env_get("HELIUS_API_KEY"),

        notification_redis_host: env_get("NOTIFICATION_REDIS_HOST"),
        notification_redis_port: env_parse("NOTIFICATION_REDIS_PORT"),
        notification_sentinel_urls: env_get_list("NOTIFICATION_SENTINEL_URLS"),
        notification_sentinel_master_name: env_get("NOTIFICATION_SENTINEL_MASTER_NAME"),

        price_redis_host: env_get("PRICE_REDIS_HOST"),
        price_redis_port: env_parse("PRICE_REDIS_PORT"),

        price_service_host: env_get("PRICE_SERVICE_HOST"),
        price_service_port: env_parse("PRICE_SERVICE_PORT"),

        user_manager_sentinel_urls: env_get_list("USER_MANAGER_SENTINEL_URLS"),
        user_manager_sentinel_master_name: env_get("USER_MANAGER_SENTINEL_MASTER_NAME"),

        user_manager_host: env_get("USER_MANAGER_HOST"),
        user_manager_port: env_parse("USER_MANAGER_PORT"),

        postgres_user: env_get_or("POSTGRES_USER", "postgres"),
        postgres_password: env_get("POSTGRES_PASSWORD"),
        postgres_host: env_get("POSTGRES_HOST"),
        postgres_port: env_parse("POSTGRES_PORT"),
        postgres_db: env_get("POSTGRES_DB"),
        postgres_connection_pool: env_parse("POSTGRES_CONNECTION_POOL"),
    };

    tracing::trace!("configuration: {:#?}", config);
    config
}

impl fmt::Debug for JwtKeys {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("JwtKeys").finish()
    }
}

impl JwtKeys {
    fn _new(secret: &[u8]) -> Self {
        Self {
            encoding: EncodingKey::from_secret(secret),
            decoding: DecodingKey::from_secret(secret),
        }
    }
}

#[inline]
fn env_get(key: &str) -> String {
    match std::env::var(key) {
        Ok(key) => key,
        Err(e) => {
            let msg = format!("{},{}", key, e);
            tracing::error!(msg);
            panic!("{msg}");
        }
    }
}

#[inline]
fn env_get_or(key: &str, default: &str) -> String {
    if let Ok(val) = std::env::var(key) {
        return val;
    }
    default.to_owned()
}

#[inline]
fn env_get_list(key: &str) -> Vec<String> {
    env_get(key)
        .split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}

#[inline]
fn env_parse<T: std::str::FromStr>(key: &str) -> T {
    env_get(key).parse().unwrap_or_else(|_| {
        let msg = format!("failed to parse {}", key);
        tracing::error!(msg);
        panic!("{msg}");
    })
}
