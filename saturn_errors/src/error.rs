use crate::models::Instruction;
use solana_sdk::message::CompileError;
use std::fmt::{self};

#[derive(Debug)]
pub enum SaturnTransactionsServiceError {
    Rpc(RpcError),
    Transaction(TransactionError),
    Token(TokenError),
    Validation(ValidationError),
    JupiterError(JupiterReqestError),
    ATlError(ATlError),
    Redis(RedisErr),
    BuildTransaction(Box<BuildTransactionError>),
    Jito(JitoEndpointErr),
}

impl From<redis::RedisError> for SaturnTransactionsServiceError {
    fn from(error: redis::RedisError) -> Self {
        SaturnTransactionsServiceError::Redis(RedisErr::QueryExecute {
            issue: error.to_string(),
        })
    }
}

#[derive(Debug, Clone)]
pub enum WalletError {
    Encryption(EncryptionError),
    Keystore(KeystoreError),
    Rpc(RpcError),
    Transaction(TransactionError),
    Token(TokenError),
    Validation(ValidationError),
    State(StateError),
    MetadataProvider(MetadataProviderError),
    Io(String),
    Serialization(String),
    Internal(String),
    BlockhashRpcRequest,
}

#[derive(Debug)]
pub enum UserAuthError {
    InvalidPublicKey,
    InvalidSignatureFormat,
    VerificationFailed,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum UserServiceError {
    InvalidSignature,
    InvalidNonce,
    SessionNotFound,
    SessionExpired,
    Unauthorized,
    DatabaseError(String),
    RedisError(String),
    PostgresError(String),
    InternalError(String),
}

#[derive(Debug)]
pub enum PriceServiceError {
    Redis(PriceRedisError),
    Parse(PriceParseError),
    Worker(String),
}

#[derive(Debug, Clone)]
pub enum PriceRedisError {
    HsetFailed { symbol: String, reason: String },
    ConnectionLost { reason: String },
}

#[derive(Debug, Clone)]
pub enum PriceParseError {
    SimdJsonError { reason: String },
    InvalidPayloadSize { expected: usize, got: usize },
}

#[derive(Debug, Clone)]
pub enum RedisErr {
    MgetALT { redis_issue: String },
    QueryExecute { issue: String },
}

#[derive(Debug)]
pub enum JitoEndpointErr {
    JitoErrResponse { response: String },
}

#[derive(Debug)]
pub enum BuildTransactionError {
    BincodeTransactionSerializetion {
        data: solana_sdk::transaction::Transaction,
        issue: String,
    },
    BincodeVersionedTransactionSerializetion {
        data: solana_sdk::transaction::VersionedTransaction,
        issue: String,
    },
    ConvertToSolana {
        instruction_metadata: Instruction,
    },
    InvalidDecode {
        decode_err: base64::DecodeError,
    },

    IvalidPubkey {
        pubkey: Vec<u8>,
        issue: String,
    },

    V0message(CompileError),

    General(String),
}

#[derive(Debug)]
pub enum ATlError {
    PubkeyConvertingErr { bad_bytes: Vec<u8>, issue: String },
    FetchALTs { alt_pubkeys: String },
    ParseLookupTable { pubkey_header_size: String },
    NotFound { pubkey: String },
}

#[derive(Debug, Clone)]
pub enum JupiterReqestError {
    QuotaCreatingReqest {
        input_mint: String,
        output_mint: String,
        reason: String,
    },

    SwapInstructionReqest {
        pubkey: Vec<u8>,
        issue: String,
    },

    ParseResponseErr {
        reason: String,
    },

    NotSuccessReqest {
        reason: String,
    },

    HeaderParse {
        reason: String,
    },

    RateLimitExceeded {
        retry_after_seconds: Option<u64>,
        endpoint: String,
    },

    TimeoutExceeded {
        endpoint: String,
        timeout_ms: u64,
        operation: String,
    },

    MaxRetriesExceeded {
        operation: String,
        attempts: u32,
        last_error: String,
    },

    NetworkError {
        operation: String,
        reason: String,
    },

    InvalidApiResponse {
        operation: String,
        status_code: u16,
        body: String,
    },
}

#[derive(Debug, Clone)]
pub enum EncryptionError {
    InvalidPassword,
    DecryptionFailed { reason: String },
    EncryptionFailed { reason: String },
    InvalidSeedLength { expected: usize, got: usize },
    InvalidSalt { reason: String },
    InvalidCryptoParams { reason: String },
    UnsupportedEncryptionVersion { version: u8, supported: Vec<u8> },
    RandomGenerationFailed,
}

#[derive(Debug, Clone)]
pub enum KeystoreError {
    Locked,
    Timeout {
        elapsed_seconds: u64,
        timeout_seconds: u64,
    },
    InvalidPassword,
    NotInitialized,
    AlreadyUnlocked,
    TooManyAttempts {
        attempts: usize,
        lockout_duration_seconds: u64,
    },
    SigningFailed {
        reason: String,
    },
}

#[derive(Debug, Clone)]
pub enum RpcError {
    ConnectionFailed {
        endpoint: String,
        reason: String,
    },
    Timeout {
        endpoint: String,
        timeout_ms: u64,
    },
    RpcMethodFailed {
        method: String,
        code: i64,
        message: String,
    },
    InvalidResponse {
        expected: String,
        got: String,
    },

    NodeUnavailable {
        endpoint: String,
    },
    RateLimitExceeded {
        retry_after_seconds: Option<u64>,
    },

    InsufficientBalance {
        required_lamports: u64,
        available_lamports: u64,
    },
    // ForUser(String),
}

#[derive(Debug, Clone)]
pub enum TransactionError {
    CreationFailed {
        reason: String,
    },
    SigningFailed {
        reason: String,
    },
    SendFailed {
        signature: Option<String>,
        reason: String,
    },
    ConfirmationTimeout {
        signature: String,
        timeout_seconds: u64,
    },
    Rejected {
        signature: String,
        reason: String,
    },
    SimulationFailed {
        logs: Vec<String>,
        error: String,
    },
    InsufficientTokenBalance {
        mint: String,
        required: u64,
        available: u64,
    },
    InvalidRecipient {
        address: String,
    },
    TransactionTooLarge {
        size_bytes: usize,
        max_bytes: usize,
    },
    BlockhashExpired,
}

#[derive(Debug, Clone)]
pub enum TokenError {
    TokenNotFound {
        mint: String,
    },

    InvalidMintAddress {
        address: String,
    },

    AccountNotFound {
        mint: String,
        owner: String,
    },

    AccountCreationFailed {
        mint: String,
        reason: String,
    },

    UnknownTokenProgram {
        program_id: String,
    },

    BalanceFetchFailed {
        reason: String,
    },

    InvalidDecimals {
        mint: String,
        expected: Option<u8>,
        got: u8,
    },
}
#[derive(Debug, Clone)]
pub enum ValidationError {
    InvalidPublicKey {
        input: String,
    },

    InvalidAmount {
        value: String,
        reason: String,
    },

    WeakPassword {
        reason: String,
        min_length: usize,
    },

    PasswordTooLong {
        length: usize,
        max_length: usize,
    },

    InvalidMnemonic {
        reason: String,
    },

    EmptyField {
        field_name: String,
    },

    OutOfRange {
        field_name: String,
        min: String,
        max: String,
        got: String,
    },

    WalletNotFound {
        pubkey: String,
    },

    NoActiveWallet,
}

#[derive(Debug, Clone)]
pub enum StateError {
    NotInitialized,

    AlreadyInitialized,

    Locked,

    InvalidState {
        current: String,
        required: String,
    },

    CorruptedData {
        reason: String,
    },

    IncompatibleVersion {
        wallet_version: String,
        app_version: String,
    },
}

#[derive(Debug, Clone)]
pub enum MetadataProviderError {
    Unavailable {
        provider: String,
        reason: String,
    },

    Timeout {
        provider: String,
        timeout_ms: u64,
    },

    InvalidResponse {
        provider: String,
        reason: String,
    },

    MetadataNotFound {
        provider: String,
        mint: String,
    },

    RateLimited {
        provider: String,
        retry_after_seconds: Option<u64>,
    },

    AuthenticationFailed {
        provider: String,
    },
}

impl fmt::Display for SaturnTransactionsServiceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SaturnTransactionsServiceError::Transaction(e) => write!(f, "Transaction error: {}", e),
            SaturnTransactionsServiceError::Token(e) => write!(f, "Token error: {}", e),
            SaturnTransactionsServiceError::Validation(e) => write!(f, "Validation error: {}", e),
            SaturnTransactionsServiceError::JupiterError(e) => write!(f, "Jupiter error: {}", e),
            SaturnTransactionsServiceError::ATlError(e) => write!(f, "Atl error: {}", e),
            SaturnTransactionsServiceError::Redis(e) => write!(f, "Redis error: {}", e),
            SaturnTransactionsServiceError::BuildTransaction(e) => {
                write!(f, "BuildTransaction error: {}", e)
            }
            SaturnTransactionsServiceError::Rpc(e) => write!(f, "Rpc error: {}", e),
            SaturnTransactionsServiceError::Jito(e) => write!(f, "Jito error: {}", e),
        }
    }
}

impl fmt::Display for WalletError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Encryption(e) => write!(f, "Encryption error: {}", e),
            Self::Keystore(e) => write!(f, "Keystore error: {}", e),
            Self::Rpc(e) => write!(f, "RPC error: {}", e),
            Self::Transaction(e) => write!(f, "Transaction error: {}", e),
            Self::Token(e) => write!(f, "Token error: {}", e),
            Self::Validation(e) => write!(f, "Validation error: {}", e),
            Self::State(e) => write!(f, "State error: {}", e),
            Self::MetadataProvider(e) => write!(f, "Metadata provider error: {}", e),
            Self::Io(s) => write!(f, "I/O error: {}", s),
            Self::Serialization(s) => write!(f, "Serialization error: {}", s),
            Self::Internal(s) => write!(f, "Internal error: {}", s),
            Self::BlockhashRpcRequest => write!(f, "Blockhash request error"),
        }
    }
}

impl fmt::Display for EncryptionError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidPassword => write!(f, "Invalid password"),
            Self::DecryptionFailed { reason } => write!(f, "Decryption failed: {}", reason),
            Self::EncryptionFailed { reason } => write!(f, "Encryption failed: {}", reason),
            Self::InvalidSeedLength { expected, got } => {
                write!(
                    f,
                    "Invalid seed length: expected {} bytes, got {} bytes",
                    expected, got
                )
            }
            Self::InvalidSalt { reason } => write!(f, "Invalid salt: {}", reason),
            Self::InvalidCryptoParams { reason } => {
                write!(f, "Invalid crypto parameters: {}", reason)
            }
            Self::UnsupportedEncryptionVersion { version, supported } => {
                write!(
                    f,
                    "Unsupported encryption version {}, supported: {:?}",
                    version, supported
                )
            }
            Self::RandomGenerationFailed => write!(f, "Random data generation failed"),
        }
    }
}

impl fmt::Display for KeystoreError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Locked => write!(f, "Keystore is locked"),
            Self::Timeout {
                elapsed_seconds,
                timeout_seconds,
            } => {
                write!(
                    f,
                    "Keystore locked due to inactivity: {}s elapsed (timeout: {}s)",
                    elapsed_seconds, timeout_seconds
                )
            }
            Self::InvalidPassword => write!(f, "Invalid password"),
            Self::NotInitialized => write!(f, "Keystore not initialized"),
            Self::AlreadyUnlocked => write!(f, "Keystore already unlocked"),
            Self::TooManyAttempts {
                attempts,
                lockout_duration_seconds,
            } => {
                write!(
                    f,
                    "Too many failed attempts ({}). Try again in {} seconds",
                    attempts, lockout_duration_seconds
                )
            }
            Self::SigningFailed { reason } => write!(f, "Signing failed: {}", reason),
        }
    }
}

impl fmt::Display for RpcError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ConnectionFailed { endpoint, reason } => {
                write!(f, "Connection to {} failed: {}", endpoint, reason)
            }
            Self::Timeout {
                endpoint,
                timeout_ms,
            } => {
                write!(
                    f,
                    "Request to {} timed out after {}ms",
                    endpoint, timeout_ms
                )
            }
            Self::RpcMethodFailed {
                method,
                code,
                message,
            } => {
                write!(
                    f,
                    "RPC method '{}' failed (code {}): {}",
                    method, code, message
                )
            }
            Self::InvalidResponse { expected, got } => {
                write!(
                    f,
                    "Invalid RPC response: expected {}, got {}",
                    expected, got
                )
            }
            Self::NodeUnavailable { endpoint } => {
                write!(f, "Node {} is unavailable", endpoint)
            }
            Self::RateLimitExceeded {
                retry_after_seconds,
            } => match retry_after_seconds {
                Some(s) => write!(f, "Rate limit exceeded. Retry after {} seconds", s),
                None => write!(f, "Rate limit exceeded"),
            },
            Self::InsufficientBalance {
                required_lamports,
                available_lamports,
            } => {
                write!(
                    f,
                    "Insufficient balance: need {} lamports, have {} lamports",
                    required_lamports, available_lamports
                )
            }
        }
    }
}

impl fmt::Display for TransactionError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::CreationFailed { reason } => write!(f, "Transaction creation failed: {}", reason),
            Self::SigningFailed { reason } => write!(f, "Transaction signing failed: {}", reason),
            Self::SendFailed { signature, reason } => match signature {
                Some(sig) => write!(f, "Transaction {} send failed: {}", sig, reason),
                None => write!(f, "Transaction send failed: {}", reason),
            },
            Self::ConfirmationTimeout {
                signature,
                timeout_seconds,
            } => {
                write!(
                    f,
                    "Transaction {} confirmation timeout after {}s",
                    signature, timeout_seconds
                )
            }
            Self::Rejected { signature, reason } => {
                write!(f, "Transaction {} rejected: {}", signature, reason)
            }
            Self::SimulationFailed { logs, error } => {
                write!(
                    f,
                    "Transaction simulation failed: {}. Logs: {:?}",
                    error, logs
                )
            }
            Self::InsufficientTokenBalance {
                mint,
                required,
                available,
            } => {
                write!(
                    f,
                    "Insufficient balance for token {}: need {}, have {}",
                    mint, required, available
                )
            }
            Self::InvalidRecipient { address } => {
                write!(f, "Invalid recipient address: {}", address)
            }
            Self::TransactionTooLarge {
                size_bytes,
                max_bytes,
            } => {
                write!(
                    f,
                    "Transaction too large: {} bytes (max: {} bytes)",
                    size_bytes, max_bytes
                )
            }
            Self::BlockhashExpired => write!(f, "Blockhash expired"),
        }
    }
}

impl fmt::Display for TokenError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::TokenNotFound { mint } => write!(f, "Token {} not found in wallet", mint),
            Self::InvalidMintAddress { address } => write!(f, "Invalid mint address: {}", address),
            Self::AccountNotFound { mint, owner } => {
                write!(
                    f,
                    "Token account not found for mint {} and owner {}",
                    mint, owner
                )
            }
            Self::AccountCreationFailed { mint, reason } => {
                write!(f, "Token account creation failed for {}: {}", mint, reason)
            }
            Self::UnknownTokenProgram { program_id } => {
                write!(f, "Unknown token program: {}", program_id)
            }
            Self::BalanceFetchFailed { reason } => write!(f, "Balance fetch failed: {}", reason),
            Self::InvalidDecimals {
                mint,
                expected,
                got,
            } => match expected {
                Some(exp) => write!(
                    f,
                    "Invalid decimals for {}: expected {}, got {}",
                    mint, exp, got
                ),
                None => write!(f, "Invalid decimals for {}: got {}", mint, got),
            },
        }
    }
}

impl fmt::Display for ValidationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidPublicKey { input } => write!(f, "Invalid public key: {}", input),
            Self::InvalidAmount { value, reason } => {
                write!(f, "Invalid amount '{}': {}", value, reason)
            }
            Self::WeakPassword { reason, min_length } => {
                write!(f, "Weak password (min {} chars): {}", min_length, reason)
            }
            Self::PasswordTooLong { length, max_length } => {
                write!(
                    f,
                    "Password too long: {} chars (max: {})",
                    length, max_length
                )
            }
            Self::NoActiveWallet => write!(f, "No active wallets"),
            Self::WalletNotFound { pubkey } => {
                write!(f, "Nit found wallets with pubkey: {}", pubkey)
            }
            Self::InvalidMnemonic { reason } => write!(f, "Invalid mnemonic: {}", reason),
            Self::EmptyField { field_name } => write!(f, "Field '{}' cannot be empty", field_name),
            Self::OutOfRange {
                field_name,
                min,
                max,
                got,
            } => {
                write!(
                    f,
                    "Field '{}' out of range [{}, {}]: got {}",
                    field_name, min, max, got
                )
            }
        }
    }
}

impl fmt::Display for StateError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotInitialized => write!(f, "Wallet not initialized"),
            Self::AlreadyInitialized => write!(f, "Wallet already initialized"),
            Self::Locked => write!(f, "Wallet is locked"),
            Self::InvalidState { current, required } => {
                write!(
                    f,
                    "Invalid state: current '{}', required '{}'",
                    current, required
                )
            }
            Self::CorruptedData { reason } => write!(f, "Wallet data corrupted: {}", reason),
            Self::IncompatibleVersion {
                wallet_version,
                app_version,
            } => {
                write!(
                    f,
                    "Incompatible wallet version {} (app version: {})",
                    wallet_version, app_version
                )
            }
        }
    }
}

impl fmt::Display for MetadataProviderError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Unavailable { provider, reason } => {
                write!(f, "Provider {} unavailable: {}", provider, reason)
            }
            Self::Timeout {
                provider,
                timeout_ms,
            } => {
                write!(f, "Provider {} timeout after {}ms", provider, timeout_ms)
            }
            Self::InvalidResponse { provider, reason } => {
                write!(f, "Invalid response from {}: {}", provider, reason)
            }
            Self::MetadataNotFound { provider, mint } => {
                write!(f, "Metadata for {} not found in {}", mint, provider)
            }
            Self::RateLimited {
                provider,
                retry_after_seconds,
            } => match retry_after_seconds {
                Some(s) => write!(f, "{} rate limited. Retry after {}s", provider, s),
                None => write!(f, "{} rate limited", provider),
            },
            Self::AuthenticationFailed { provider } => {
                write!(f, "Authentication failed for {}", provider)
            }
        }
    }
}

impl fmt::Display for JupiterReqestError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            JupiterReqestError::QuotaCreatingReqest {
                input_mint,
                output_mint,
                reason,
            } => write!(
                f,
                "Quota creating error for inputMint: {}, outputMint: {}, reason: {}",
                input_mint, output_mint, reason
            ),
            JupiterReqestError::SwapInstructionReqest { pubkey, issue } => {
                write!(
                    f,
                    "Swap instruction request error for pubkey: {:?}, issue: {}",
                    pubkey, issue
                )
            }
            JupiterReqestError::ParseResponseErr { reason } => {
                write!(f, "Failed to parse Jupiter response: {}", reason)
            }
            JupiterReqestError::NotSuccessReqest { reason } => {
                write!(f, "Failed request to Jupiter, reason: {}", reason)
            }
            JupiterReqestError::HeaderParse { reason } => {
                write!(f, "Failed to parse headers, reason: {}", reason)
            }
            JupiterReqestError::RateLimitExceeded {
                retry_after_seconds,
                endpoint,
            } => match retry_after_seconds {
                Some(seconds) => write!(
                    f,
                    "Rate limit exceeded for {}, retry after {} seconds",
                    endpoint, seconds
                ),
                None => write!(f, "Rate limit exceeded for {}", endpoint),
            },
            JupiterReqestError::TimeoutExceeded {
                endpoint,
                timeout_ms,
                operation,
            } => write!(
                f,
                "Operation '{}' timed out after {}ms for endpoint {}",
                operation, timeout_ms, endpoint
            ),
            JupiterReqestError::MaxRetriesExceeded {
                operation,
                attempts,
                last_error,
            } => write!(
                f,
                "Max retries exceeded for operation '{}' after {} attempts. Last error: {}",
                operation, attempts, last_error
            ),
            JupiterReqestError::NetworkError { operation, reason } => {
                write!(
                    f,
                    "Network error during operation '{}': {}",
                    operation, reason
                )
            }
            JupiterReqestError::InvalidApiResponse {
                operation,
                status_code,
                body,
            } => write!(
                f,
                "Invalid API response for operation '{}', status code: {}, body: {}",
                operation, status_code, body
            ),
        }
    }
}

impl fmt::Display for RedisErr {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            RedisErr::MgetALT { redis_issue } => write!(f, "MgetALT err: {}", redis_issue),
            RedisErr::QueryExecute { issue } => write!(f, "Query execure err: {}", issue),
        }
    }
}

impl fmt::Display for JitoEndpointErr {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            JitoEndpointErr::JitoErrResponse { response } => {
                write!(f, "Response gets err: {:?}", response)
            }
        }
    }
}

impl fmt::Display for ATlError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ATlError::PubkeyConvertingErr { bad_bytes, issue } => {
                write!(
                    f,
                    "Invalid parse pubkey from: {:?} because {}",
                    bad_bytes, issue
                )
            }
            ATlError::FetchALTs { alt_pubkeys } => {
                write!(f, "Invalid fetch alt from network: {}", alt_pubkeys)
            }
            ATlError::ParseLookupTable { pubkey_header_size } => {
                write!(f, "Invalid header size from: {}", pubkey_header_size)
            }
            ATlError::NotFound { pubkey } => write!(f, "Not found atl pubkey: {}", pubkey),
        }
    }
}

impl fmt::Display for BuildTransactionError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BuildTransactionError::ConvertToSolana {
                instruction_metadata,
            } => write!(
                f,
                "Err convert to solana instructions: {:#?}",
                instruction_metadata
            ),
            BuildTransactionError::InvalidDecode { decode_err } => {
                write!(f, "Err decod instruction data: {}", decode_err)
            }
            BuildTransactionError::IvalidPubkey { pubkey, issue } => {
                write!(
                    f,
                    "BuildTransactionError invalid parse pubkey from: {:?} because {}",
                    pubkey, issue
                )
            }
            BuildTransactionError::V0message(e) => {
                write!(f, "BuildTransactionError V0 message creating: {}", e)
            }
            BuildTransactionError::BincodeVersionedTransactionSerializetion { data, issue } => {
                write!(
                    f,
                    "Failde serialize VersionedTransaction: {:#?}\n issue: {}",
                    data, issue
                )
            }
            BuildTransactionError::BincodeTransactionSerializetion { data, issue } => {
                write!(
                    f,
                    "Failde serialize Transaction: {:#?}\n issue: {}",
                    data, issue
                )
            }
            BuildTransactionError::General(issue) => write!(f, "{}", issue),
        }
    }
}

impl fmt::Display for PriceServiceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Redis(e) => write!(f, "Price Redis Error: {}", e),
            Self::Parse(e) => write!(f, "Price Parse Error: {}", e),
            Self::Worker(s) => write!(f, "Price Worker Error: {}", s),
        }
    }
}

impl fmt::Display for PriceRedisError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::HsetFailed { symbol, reason } => {
                write!(
                    f,
                    "Failed to HSET price data for symbol {}: {}",
                    symbol, reason
                )
            }
            Self::ConnectionLost { reason } => {
                write!(f, "Redis connection lost in price_service: {}", reason)
            }
        }
    }
}

impl fmt::Display for PriceParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::SimdJsonError { reason } => write!(f, "simd-json parsing failed: {}", reason),
            Self::InvalidPayloadSize { expected, got } => {
                write!(
                    f,
                    "Invalid payload size: expected {}, got {}",
                    expected, got
                )
            }
        }
    }
}

impl fmt::Display for UserAuthError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidPublicKey => write!(f, "Invalid public key format"),
            Self::InvalidSignatureFormat => write!(f, "Invalid signature format"),
            Self::VerificationFailed => write!(f, "Signature verification failed"),
        }
    }
}

impl fmt::Display for UserServiceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidSignature => write!(f, "Invalid signature"),
            Self::InvalidNonce => write!(f, "Invalid or expired nonce"),
            Self::SessionNotFound => write!(f, "Session not found"),
            Self::SessionExpired => write!(f, "Session expired"),
            Self::Unauthorized => write!(f, "Unauthorized access"),
            Self::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            Self::RedisError(msg) => write!(f, "Redis error: {}", msg),
            Self::PostgresError(msg) => write!(f, "Postgres error: {}", msg),
            Self::InternalError(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for WalletError {}
impl std::error::Error for EncryptionError {}
impl std::error::Error for KeystoreError {}
impl std::error::Error for RpcError {}
impl std::error::Error for TransactionError {}
impl std::error::Error for TokenError {}
impl std::error::Error for ValidationError {}
impl std::error::Error for StateError {}
impl std::error::Error for SaturnTransactionsServiceError {}
impl std::error::Error for JupiterReqestError {}
impl std::error::Error for RedisErr {}
impl std::error::Error for ATlError {}
impl std::error::Error for BuildTransactionError {}
impl std::error::Error for JitoEndpointErr {}
impl std::error::Error for PriceServiceError {}
impl std::error::Error for PriceRedisError {}
impl std::error::Error for PriceParseError {}
impl std::error::Error for UserAuthError {}
impl std::error::Error for UserServiceError {}
