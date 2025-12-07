use std::{str::FromStr, sync::Arc};

use chrono::Utc;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{pubkey::Pubkey, signature::Keypair};
use wallet_models::domain::models::{
    acc_data::{AccData, Network},
    token_models::TokenBalance,
    tx_models::SendedTransactions,
};
use std::error::Error;
use crate::{
    endpoints::token_acc_info::{JupiterClient, TokenMetaDataProvider, get_valid_tokens}, password_encryptions::impl_encryptions::create_encrypt_data, state::saturn_wallet_service::WalletManager, traits::signer_wraper::SaturnSigner, transactions::tokens_transactions::send_mint_token_transactions
};


type AsyncResult<T> = Result<T, Box<dyn Error + Send + Sync>>;

// pub async fn fetch_sol_acc_data<P>(
//     rpc: &RpcClient,
//     pubkey: &Pubkey,
//     provider : &P
// ) -> AsyncResult<AccData> 
// where P : TokenMetaDataProvider
// {
//     let account = rpc.get_account(pubkey).await?;
//     Ok(AccData {
//         pubkey: pubkey.to_string(),
//         native_balance: (account.lamports as f64 / 1_000_000_000.0).to_string(), // in SOL
//         network: Network::Solana,
//         tokens: get_valid_tokens(rpc, pubkey, provider).await?,
//         created_at: Some(Utc::now()),
//         ..Default::default()
//     })
// }

// pub async fn create_saturn_account(
//     password: String,
//     rpc: &RpcClient,
// ) -> Result<AccData, Box<dyn std::error::Error>> {
//     let encrypt_data = create_encrypt_data(password);
//     fetch_sol_acc_data(rpc, &encrypt_data.pubkey).await
// }

// pub async fn create_wallet_account(State(state) : State<Arc<WalletManager>>) {
//     state.create_wallet(password, bip39_passphrase, display_name, network, keystore_timeout)
// }


pub async fn send_tokens<T: SaturnSigner>(
    rpc: &RpcClient,
    to: &Pubkey,
    amount: u64,
    mint: TokenBalance,
    source: &T,
) -> Result<SendedTransactions, Box<dyn std::error::Error + Send + Sync>> {
    let token_program = &Pubkey::from_str(&mint.token_program.clone().unwrap()).unwrap();
    let response = send_mint_token_transactions(rpc, token_program, source, to, amount, mint).await;

    match response {
        Ok(response) => Ok(response),
        Err(err) => Err(err),
    }
}