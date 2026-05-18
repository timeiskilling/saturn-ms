use solana_sdk::pubkey;
use solana_sdk::pubkey::Pubkey;

pub const NUMBER_TRANSACTIONS: usize = 5;
pub const MIN_JITO_TIP_LAMPORTS: u64 = 1_000;

pub const USDC_MINT: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
pub const SOL_MINT: &str = "So11111111111111111111111111111111111111112";

pub const BUNDLE_TRACKER: &str = "bundle_tracker";
pub const JITO_ACTIVE_STATUS: &str = "active_bundles";
pub const JITO_TIP_ADDRESSES: [Pubkey; 8] = [
    pubkey!("3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT"),
    pubkey!("HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe"),
    pubkey!("Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY"),
    pubkey!("DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh"),
    pubkey!("ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt"),
    pubkey!("DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL"),
    pubkey!("96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5"),
    pubkey!("ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49"),
];
pub const JITO_DONT_FRONT: Pubkey = pubkey!("jitodontfront111111111111111111111111111111");
pub const ALT_REDIS_KEY: &str = "usage_atl";
pub const TTL_FOR_ATL: u64 = 7200;
pub const JWT_REDIS_REVOKE_GLOBAL_BEFORE_KEY: &str = "jwt.revoke.global.before";
pub const JWT_REDIS_REVOKE_USER_BEFORE_KEY: &str = "jwt.revoke.user.before";
pub const JWT_REDIS_REVOKED_TOKENS_KEY: &str = "jwt.revoked.tokens";

pub const GRPC_HEALTH_CHECK_INTERVAL: u64 = 5;

// Solana network constants
pub const SOLANA_BASE_FEE_LAMPORTS: u64 = 5_000;
pub const BPS_TOTAL: u128 = 10_000;

// Platform constants
pub const PLATFORM_FEE_BPS: u32 = 50;

// - discriminator (8 bytes)
// - type_index (4 bytes)
// - deactivation_slot (8 bytes)
// - last_extended_slot (8 bytes)
// - last_extended_slot_start_index (1 byte)
// - authority (32 bytes, optional)
// - addresses (32 bytes each)
pub const HEADER_SIZE: usize = 56;
pub const SEMAPHORE_PERMITS: usize = 10;
