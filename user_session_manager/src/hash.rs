use sha2::{Digest, Sha256};

/// Hashes a wallet address using SHA-256 and returns the hex-encoded string.
/// This prevents raw wallet addresses from being exposed if the database or redis is compromised.
pub fn hash_wallet_address(address: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(address.as_bytes());
    let result = hasher.finalize();
    hex::encode(result)
}
