#![cfg(target_arch = "wasm32")]

use argon2::Params;
use argon2::password_hash::rand_core::{OsRng as RandOsRng, RngCore};
use argon2::{Argon2, password_hash::SaltString};
use bip39::Mnemonic;
use chacha20poly1305::{
    ChaCha20Poly1305, KeyInit, Nonce,
    aead::{Aead, OsRng},
};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use solana_sdk::pubkey::Pubkey;
use async_lock::RwLock;
use solana_sdk::signature::Keypair;
use solana_sdk::signer::{SeedDerivable, Signer};
use zeroize::{Zeroize, ZeroizeOnDrop};


#[derive(Zeroize, ZeroizeOnDrop,Clone)]
pub struct SecureString {
    inner: String,
}

impl SecureString {
    pub fn new(s: String) -> Self {
        Self { inner: s }
    }

    pub fn as_str(&self) -> &str {
        &self.inner
    }
}

impl From<String> for SecureString {
    fn from(s: String) -> Self {
        Self::new(s)
    }
}

#[derive(Debug, Clone)]
pub struct EncryptionParams {
    pub argon2_memory_kib: u32,
    pub argon2_iterations: u32,
    pub argon2_parallelism: u32,
}

impl Default for EncryptionParams {
    fn default() -> Self {
        Self {
            argon2_memory_kib: 131072, // 128 MB
            argon2_iterations: 4,
            argon2_parallelism: 4,
        }
    }
}

impl EncryptionParams {
    pub fn mobile() -> Self {
        Self {
            argon2_memory_kib: 47104, // 46 MB
            argon2_iterations: 3,
            argon2_parallelism: 2,
        }
    }
    
    pub fn high_security() -> Self {
        Self {
            argon2_memory_kib: 262144, // 256 MB
            argon2_iterations: 5,
            argon2_parallelism: 8,
        }
    }
}

#[derive(Debug)]
pub struct EncryptedData {
    pub pubkey: Pubkey,
    pub encrypt: Encrypt,
}

#[derive(Debug)]
pub struct Encrypt {
    pub version: u8,
    pub ciphertext: Vec<u8>,
    pub nonce: [u8; 12],
    pub salt: String,
    pub argon2_params: EncryptionParams,
    pub password_verification: [u8; 32],
}

impl Encrypt {
    pub const CURRENT_VERSION: u8 = 1;

    pub fn new(
        ciphertext: Vec<u8>,
        nonce: [u8; 12],
        salt: String,
        argon2_params: EncryptionParams,
        password_verification: [u8; 32],
    ) -> Self {
        Self {
            version: Self::CURRENT_VERSION,
            ciphertext,
            nonce,
            salt,
            argon2_params,
            password_verification,
        }
    }
}

pub fn decrypt_seed_versioned(
    ed: &Encrypt,
    password: SecureString,
) -> Result<[u8; 32], CryptoError> {
    match ed.version {
        1 => decrypt_seed(ed, password),
        v => Err(CryptoError::DecryptionFailed(format!(
            "Unsupported encryption version: {}",
            v
        ))),
    }
}

pub fn seed_from_mnemonic(mnemonic: &Mnemonic, bip39_passphrase: &str) -> [u8; 32] {
    let mut seed_bytes = mnemonic.to_seed(bip39_passphrase);
    let mut seed32 = [0u8; 32];
    seed32.copy_from_slice(&seed_bytes[..32]);

    seed_bytes.zeroize();
    seed32
}

fn derive_key_argon2(
    password: &str,
    salt: &SaltString,
    params: &EncryptionParams,
) -> Result<[u8; 64], CryptoError> {
    let argon2_params = Params::new(
        params.argon2_memory_kib,
        params.argon2_iterations,
        params.argon2_parallelism,
        Some(64),
    )
    .map_err(|e| CryptoError::InvalidParams(e.to_string()))?;
    let argon2 = Argon2::new(
        argon2::Algorithm::Argon2id,
        argon2::Version::V0x13,
        argon2_params,
    );

    let mut out = [0u8; 64];
    argon2
        .hash_password_into(password.as_bytes(), salt.as_ref().as_bytes(), &mut out)
        .expect("argon2 derive");

    Ok(out)
}

pub fn encrypt_seed_with_verification(
    seed: &[u8; 32],
    password: SecureString,
    params: EncryptionParams,
) -> Result<Encrypt, CryptoError> {
    let salt = SaltString::generate(&mut RandOsRng);

    let mut key = derive_key_argon2(password.as_str(), &salt, &params)?;

    let mut mac = <Hmac<Sha256> as Mac>::new_from_slice(&key[32..])
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;
    mac.update(b"password_verification");

    let password_verification = mac.finalize().into_bytes();

    let cipher = ChaCha20Poly1305::new_from_slice(&key[..32])
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;
    key.zeroize();

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    if nonce_bytes.iter().all(|&b| b == 0) {
        return Err(CryptoError::EncryptionFailed(
            "Generated all-zero nonce, refusing to encrypt".to_string(),
        ));
    }

    let ciphertext = cipher
        .encrypt(nonce, seed.as_ref())
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;

    let mut verification_array = [0u8; 32];
    verification_array.copy_from_slice(&password_verification);

    Ok(Encrypt {
        version: Encrypt::CURRENT_VERSION,
        ciphertext,
        nonce: nonce_bytes,
        salt: salt.to_string(),
        argon2_params: params,
        password_verification: verification_array,
    })
}

pub fn verify_password(ed: &Encrypt, password: SecureString) -> Result<bool, CryptoError> {
    let salt = SaltString::from_b64(&ed.salt).map_err(|_| CryptoError::InvalidSalt)?;

    let mut key = derive_key_argon2(password.as_str(), &salt, &ed.argon2_params)?;

    let mut mac = <Hmac<Sha256> as Mac>::new_from_slice(&key[32..])
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;
    mac.update(b"password_verification");

    key.zeroize();

    Ok(mac.verify_slice(&ed.password_verification).is_ok())
}

pub fn decrypt_seed(ed: &Encrypt, password: SecureString) -> Result<[u8; 32], CryptoError> {
    let salt = SaltString::from_b64(&ed.salt).map_err(|_| CryptoError::InvalidSalt)?;

    let mut key = derive_key_argon2(password.as_str(), &salt, &ed.argon2_params)?;

    let cipher = ChaCha20Poly1305::new_from_slice(&key[..32])
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;
    key.zeroize();

    let nonce = Nonce::from_slice(&ed.nonce);

    let mut plain = cipher.decrypt(nonce, ed.ciphertext.as_ref()).map_err(|_| {
        CryptoError::DecryptionFailed("Invalid password or corrupted data".to_string())
    })?;

    if plain.len() != 32 {
        plain.zeroize();
        return Err(CryptoError::InvalidSeedLength);
    }

    let mut seed = [0u8; 32];
    seed.copy_from_slice(&plain);
    plain.zeroize();

    Ok(seed)
}

pub fn keypair_from_seed(seed: &[u8; 32]) -> Result<Keypair, CryptoError> {
    Keypair::from_seed(seed).map_err(|_| CryptoError::InvalidSeedLength)
}

pub fn create_encrypt_data(
    password: SecureString,
    bip39_passphrase: Option<SecureString>,
    params: EncryptionParams,
) -> Result<(EncryptInfo, Mnemonic), CryptoError> {
    let mut entropy = [0u8; 32];
    OsRng.fill_bytes(&mut entropy);

    let mnemonic = Mnemonic::from_entropy(&entropy)
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;
    entropy.zeroize();

    let passphrase_str = bip39_passphrase.as_ref().map(|s| s.as_str()).unwrap_or("");

    let mut seed = seed_from_mnemonic(&mnemonic, passphrase_str);

    let keypair = keypair_from_seed(&seed)?;
    let pubkey = keypair.pubkey();

    let encrypted = encrypt_seed_with_verification(&seed, password, params)?;
    seed.zeroize();

    let metadata = WalletMetadata {
        uses_bip39_passphrase: bip39_passphrase.is_some(),
    };

    let encrypt_info = EncryptInfo {
        encrypted_data: EncryptedData {
            pubkey,
            encrypt: encrypted,
        },
        metadata,
    };

    Ok((encrypt_info, mnemonic))
}

pub struct EncryptInfo {
    pub encrypted_data: EncryptedData,
    pub metadata: WalletMetadata,
}

#[derive(Debug)]
pub enum CryptoError {
    InvalidParams(String),
    KeyDerivationFailed(String),
    EncryptionFailed(String),
    DecryptionFailed(String),
    InvalidSeedLength,
    InvalidSalt,
}

impl std::fmt::Display for CryptoError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidParams(s) => write!(f, "Invalid crypto parameters: {}", s),
            Self::KeyDerivationFailed(s) => write!(f, "Key derivation failed: {}", s),
            Self::EncryptionFailed(s) => write!(f, "Encryption failed: {}", s),
            Self::DecryptionFailed(s) => write!(f, "Decryption failed: {}", s),
            Self::InvalidSeedLength => write!(f, "Invalid seed length"),
            Self::InvalidSalt => write!(f, "Invalid salt format"),
        }
    }
}

impl std::error::Error for CryptoError {}

#[derive(Debug, Clone)]
pub struct WalletMetadata {
    pub uses_bip39_passphrase: bool,
}

pub struct CryptoVault {
    encrypt_info: RwLock<EncryptInfo>,
    pubkey: Pubkey,
}

impl CryptoVault {
    pub fn new(encrypt_info: EncryptInfo) -> Self {
        let pubkey = encrypt_info.encrypted_data.pubkey;
        Self {
            encrypt_info : RwLock::new(encrypt_info),
            pubkey,
        }
    }

    pub fn pubkey(&self) -> &Pubkey {
        &self.pubkey
    }

    pub async fn verify_password(&self, password: &SecureString) -> Result<bool, CryptoError> {
        verify_password(&self.encrypt_info.read().await.encrypted_data.encrypt, password.clone())
    }

    pub async fn decrypt_seed(&self, password: SecureString) -> Result<[u8; 32], CryptoError> {
        decrypt_seed_versioned(&self.encrypt_info.read().await.encrypted_data.encrypt, password)
    }

    pub async fn metadata(&self) -> WalletMetadata {
        self.encrypt_info.read().await.metadata.clone()
    }

    pub async fn encrypt_params(&self) -> EncryptionParams {
        self.encrypt_info.read().await.encrypted_data.encrypt.argon2_params.clone()
    }

    pub async fn change_encrypt(&self, new_encrypt : Encrypt) {
        self.encrypt_info.write().await.encrypted_data.encrypt = new_encrypt;
    }
}
