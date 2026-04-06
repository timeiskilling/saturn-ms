use rand::prelude::*;

pub fn generate_nonce() -> [u8; 32] {
    let mut rng = rand::rng();
    let mut nonce = [0u8; 32];
    rng.fill_bytes(&mut nonce);
    nonce
}
