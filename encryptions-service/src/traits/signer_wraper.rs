use crate::error_handling::error_code::KeystoreError;
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signature},
    signer::Signer as SolanaSdkSigner,
};
use std::time::Duration;
use tokio::time::Instant;

pub trait SaturnSigner: Send + Sync {
    fn sf_pubkey(&self) -> &Pubkey;
    fn sf_sign_message(&self, message: &[u8]) -> Signature;
}

pub trait KeyStoreManager: Send + Sync {
    type Signer: SaturnSigner;

    fn with_signer<F, R>(&self, f: F) -> Result<R, String>
    where
        F: FnOnce(&dyn SaturnSigner) -> R;

    fn unclock(&mut self, password: &str) -> Result<(), KeystoreError>;

    fn lock(&mut self);

    fn is_unlocked(&self) -> bool;
}

// impl SaturnSigner for Keypair {
//     fn sf_pubkey(&self) -> &Pubkey {
//         &self.pubkey
//     }

//     fn sf_sign_message(&self, message: &[u8]) -> Signature {
//         self.sign_message(message)
//     }
// }

pub struct SolanaKeypairSigner {
    keypair: Keypair,
    pubkey: Pubkey,
}

impl SolanaKeypairSigner {
    pub fn new(keypair: Keypair) -> Self {
        let pubkey = keypair.pubkey();
        Self { keypair, pubkey }
    }
}

impl SaturnSigner for SolanaKeypairSigner {
    fn sf_pubkey(&self) -> &Pubkey {
        &self.pubkey
    }

    fn sf_sign_message(&self, message: &[u8]) -> Signature {
        self.keypair.sign_message(message)
    }
}

pub struct SecureKeystore<S: SaturnSigner> {
    signer: Option<S>,
    unlock_time: Option<Instant>,
    unlock_expiry: Instant,
    timeout_duration: Duration,
}

impl<S: SaturnSigner> SecureKeystore<S> {
    pub fn new(timeout_duration: Duration) -> Self {
        Self {
            signer: None,
            unlock_expiry: Instant::now(),
            timeout_duration,
            unlock_time: None,
        }
    }

    pub fn unlock_with_signer(&mut self, signer: S) {
        let now = Instant::now();
        self.signer = Some(signer);
        self.unlock_time = Some(now);
        self.unlock_expiry = Instant::now() + self.timeout_duration;
    }

    pub fn with_signer<F, R>(&self, f: F) -> Result<R, KeystoreError>
    where
        F: FnOnce(&S) -> R,
    {
        let signer = self.signer.as_ref().ok_or(KeystoreError::Locked)?;

        let now = Instant::now();

        if now > self.unlock_expiry {
            let elapsed = self.unlock_time
                .map(|unlock| now.duration_since(unlock))
                .unwrap_or(Duration::from_secs(0));
            
            return Err(KeystoreError::Timeout {
                elapsed_seconds: elapsed.as_secs(),
                timeout_seconds: self.timeout_duration.as_secs(),
            });
        }
        Ok(f(signer))
    }

    pub fn lock(&mut self) {
        self.signer = None;
        self.unlock_time = None;
        self.unlock_expiry = Instant::now();
    }

    pub fn is_unlocked(&self) -> bool {
        self.signer.is_some() && Instant::now() <= self.unlock_expiry
    }

    pub fn refresh_timeout(&mut self) {
        if self.is_unlocked() {
            self.unlock_expiry = Instant::now() + self.timeout_duration;
        }
    }

    pub fn get_remaining_time(&self) -> Option<Duration> {
        if self.signer.is_some() {
            let now = Instant::now();
            if now < self.unlock_expiry {
                Some(self.unlock_expiry - now)
            } else {
                Some(Duration::from_secs(0))
            }
        } else {
            None
        }
    }

    pub fn get_session_duration(&self) -> Option<Duration> {
        self.unlock_time
            .map(|unlock| Instant::now().duration_since(unlock))
    }
}
