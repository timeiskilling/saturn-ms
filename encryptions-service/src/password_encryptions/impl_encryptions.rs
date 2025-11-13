use std::str::FromStr;
use argon2::{Argon2,password_hash::SaltString};
use argon2::Params;
use argon2::password_hash::rand_core::{OsRng as RandOsRng, RngCore};
use chacha20poly1305::{ChaCha20Poly1305, KeyInit, Nonce, aead::{Aead, OsRng}};
use solana_sdk::signer::{SeedDerivable, Signer};
use solana_sdk::{signature::Keypair};
use bip39::Mnemonic;

#[derive(Debug)]
pub struct EncryptedData {
    pub ciphertext: Vec<u8>,
    pub nonce: [u8; 12],
    pub salt: String,
}


pub fn seed_from_mnemonic(mnemonic_str: &str, bip39_passphrase: &str) -> [u8; 32] {
    let mnemonic = Mnemonic::from_str(mnemonic_str).expect("invalid mnemonic");
    let seed_bytes = mnemonic.to_seed(bip39_passphrase); 
    let mut seed32 = [0u8; 32];
    seed32.copy_from_slice(&seed_bytes[..32]);
    seed32
}

fn derive_key_argon2(password: &str, salt: &SaltString) -> [u8; 32] {
    let params = Params::new(65536, 3, 1, None).expect("valid params"); // memory_kib=64MB, t=3
    let argon2 = Argon2::new(argon2::Algorithm::Argon2id, argon2::Version::V0x13, params);

    let mut out = [0u8; 32];
    argon2.hash_password_into(password.as_bytes(), salt.as_ref().as_bytes(), &mut out)
        .expect("argon2 derive");
    out
}

fn encrypt_seed(seed: &[u8; 32], password: &str) -> EncryptedData {
    let salt = SaltString::generate(&mut RandOsRng);
    let key = derive_key_argon2(password, &salt);
    let cipher = ChaCha20Poly1305::new_from_slice(&key).unwrap();

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, seed.as_ref()).expect("encrypt failed");

    EncryptedData {
        ciphertext,
        nonce: nonce_bytes,
        salt: salt.to_string(),
    }
}

fn decrypt_seed(ed: &EncryptedData, password: &str) -> Result<[u8; 32], &'static str> {
    let salt = SaltString::from_b64(&ed.salt).map_err(|_| "bad salt")?;
    let key = derive_key_argon2(password, &salt);
    let cipher = ChaCha20Poly1305::new_from_slice(&key).unwrap();
    let nonce = Nonce::from_slice(&ed.nonce);

    let plain = cipher.decrypt(nonce, ed.ciphertext.as_ref()).map_err(|_| "decrypt failed")?;
    if plain.len() != 32 { return Err("unexpected seed length"); }
    let mut seed = [0u8; 32];
    seed.copy_from_slice(&plain);
    Ok(seed) 
}

fn keypair_from_seed(seed: &[u8; 32]) -> Keypair {
    Keypair::from_seed(seed).expect("invalid seed")
}

pub fn example_flow() {
    let mut entropy = [0u8; 32];
    OsRng.fill_bytes(&mut entropy);
    let mnemonic = Mnemonic::from_entropy(&entropy).unwrap();
    let mnemonic_string = mnemonic.to_string();

    let seed = seed_from_mnemonic(&mnemonic_string, "");
    let kp = keypair_from_seed(&seed);
    let pubkey = kp.pubkey();
    println!("pubkey: {}", pubkey);

    let password = "user-password";
    let encrypted = encrypt_seed(&seed, password);

    let seed_other = seed_from_mnemonic(&mnemonic_string, "");
    let kp_other = keypair_from_seed(&seed_other);
    assert_eq!(kp_other.pubkey(), pubkey);

    let decrypted_seed = decrypt_seed(&encrypted, password).expect("bad password");
    let kp_from_decrypted = keypair_from_seed(&decrypted_seed);
    assert_eq!(kp_from_decrypted.pubkey(), pubkey);
}
