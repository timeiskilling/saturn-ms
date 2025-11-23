use std::str::FromStr;

use solana_sdk::{commitment_config::CommitmentConfig, pubkey::Pubkey};
use tracing_subscriber::fmt::format::FmtSpan;

use crate::{
    password_encryptions::secure_string::SecureString,
};

mod ednpoints;
mod error_handling;
mod password_encryptions;
mod state;
mod traits;
mod transactions;
mod rpc_layer;

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
}
