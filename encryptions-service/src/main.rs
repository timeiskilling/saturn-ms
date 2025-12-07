use std::str::FromStr;

use solana_sdk::{commitment_config::CommitmentConfig, pubkey::Pubkey};
use tracing_subscriber::fmt::format::FmtSpan;

use crate::{
    password_encryptions::secure_string::SecureString,
};

mod endpoints;
mod error_handling;
mod password_encryptions;
mod state;
mod traits;
mod transactions;
mod rpc_layer;
mod wasm;
mod batching;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();

    // password_encryptions::impl_encryptions::example_flow();
    let _rpc = "https://mainnet.helius-rpc.com/?api-key=bd7b24dd-d644-4612-a486-a5acb8427920";
    // let mut state = EncryptedState::new(rpc).await;
    // let data = state
    //     .create_saturn_account(
    //         SecureString::new("Suchara".to_string()),
    //         String::from("Alohadance"),
    //         None,
    //     )
    //     .await;

    // let client = solana_client::nonblocking::rpc_client::RpcClient::new_with_commitment((&rpc).to_string(), CommitmentConfig::confirmed());

    // let pubkey = Pubkey::from_str("FVnv5qH7dsrBzEDwJ8dN2m9PFtKTBAQFtqWF3M9LpwMg").unwrap();

    // let response = fetch_sol_acc_data(&client,&pubkey).await.unwrap();

    // println!("response : {:#?}", data.unwrap());

    use chacha20poly1305::{ChaCha20Poly1305, KeyInit,aead::Aead}; // Aead trait
    use chacha20poly1305::aead::OsRng;
    
    let key = ChaCha20Poly1305::generate_key(&mut OsRng);
    let cipher = ChaCha20Poly1305::new(&key);
    let nonce = chacha20poly1305::Nonce::from_slice(b"unique nonce"); // 12 bytes

    let data_to_encrypt = [0u8; 32]; 

    let ciphertext = cipher.encrypt(nonce, data_to_encrypt.as_ref()).expect("encryption failure");

    println!("Input length: {}", data_to_encrypt.len());
    println!("Output length: {}", ciphertext.len());

    assert_eq!(ciphertext.len(), 32 + 16, "Ciphertext should include the 16-byte tag!");
}   
