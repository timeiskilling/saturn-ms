
use crate::password_encryptions::encryption_parms::EncryptionParams;
use crate::password_encryptions::impl_encryptions::{
    CryptoError, Encrypt, EncryptInfo, WalletMetadata, decrypt_seed_versioned, verify_password
};
use crate::password_encryptions::secure_string::SecureString;
use solana_sdk::pubkey::Pubkey;
use tokio::sync::RwLock;

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
