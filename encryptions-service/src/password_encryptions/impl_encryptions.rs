use std::str::FromStr;
use argon2::{Argon2, password_hash::SaltString};
use argon2::Params;
use argon2::password_hash::rand_core::{OsRng as RandOsRng, RngCore};
use chacha20poly1305::{ChaCha20Poly1305, KeyInit, Nonce, aead::{Aead, OsRng}};
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::{SeedDerivable, Signer};
use solana_sdk::{signature::Keypair};
use bip39::Mnemonic;
use zeroize::Zeroize;

#[derive(Debug)]
pub struct EncryptedData {
    pub pubkey : Pubkey,
    pub encrypt : Encrypt
}

#[derive(Debug)]
pub struct Encrypt {
    pub ciphertext: Vec<u8>,
    pub nonce: [u8; 12],
    pub salt: String,
}

pub fn seed_from_mnemonic(mnemonic_str: &str, bip39_passphrase: &str) -> [u8; 32] {
    let mnemonic = Mnemonic::from_str(mnemonic_str).expect("invalid mnemonic");

    let mut seed_bytes = mnemonic.to_seed(bip39_passphrase); 
    let mut seed32 = [0u8; 32];
    seed32.copy_from_slice(&seed_bytes[..32]);

    seed_bytes.zeroize();
    seed32
}

fn derive_key_argon2(password: &str, salt: &SaltString) -> [u8; 32] {
    let params = Params::new(65536, 3, 1, None).expect("valid params");
    let argon2 = Argon2::new(argon2::Algorithm::Argon2id, argon2::Version::V0x13, params);

    let mut out = [0u8; 32];
    argon2.hash_password_into(password.as_bytes(), salt.as_ref().as_bytes(), &mut out)
        .expect("argon2 derive");

    out
}

fn encrypt_seed(seed: &[u8; 32], password: String) -> Encrypt {
    let salt = SaltString::generate(&mut RandOsRng);

    let mut key = derive_key_argon2(&password, &salt);
    let cipher = ChaCha20Poly1305::new_from_slice(&key).unwrap();
    key.zeroize();

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, seed.as_ref()).expect("encrypt failed");

    Encrypt {
        ciphertext,
        nonce: nonce_bytes,
        salt: salt.to_string(),
    }
}

fn decrypt_seed(ed: &EncryptedData, mut password: String) -> Result<[u8; 32], &'static str> {
    let salt = SaltString::from_b64(&ed.encrypt.salt).map_err(|_| "bad salt")?;

    let mut key = derive_key_argon2(&password, &salt);
    password.zeroize();
    let cipher = ChaCha20Poly1305::new_from_slice(&key).unwrap();
    key.zeroize();

    let nonce = Nonce::from_slice(&ed.encrypt.nonce);

    let mut plain = cipher.decrypt(nonce, ed.encrypt.ciphertext.as_ref())
        .map_err(|_| "decrypt failed")?;

    if plain.len() != 32 {
        plain.zeroize();
        return Err("unexpected seed length");
    }

    let mut seed = [0u8; 32];
    seed.copy_from_slice(&plain);

    plain.zeroize();

    Ok(seed)
}

fn keypair_from_seed(seed: &[u8; 32]) -> Keypair {
    Keypair::from_seed(seed).expect("invalid seed")
}

pub fn create_encrypt_data(password: String) -> EncryptedData {
    let mut entropy = [0u8; 32];
    OsRng.fill_bytes(&mut entropy);

    let mnemonic = Mnemonic::from_entropy(&entropy).unwrap();
    entropy.zeroize();

    let mut mnemonic_string = mnemonic.to_string();
    let mut seed = seed_from_mnemonic(&mnemonic_string, "");
    mnemonic_string.zeroize();

    let pubkey = keypair_from_seed(&seed).pubkey();
    let encrypted = encrypt_seed(&seed, password);
    seed.zeroize();

    EncryptedData {
        pubkey,
        encrypt: encrypted,
    }
}
