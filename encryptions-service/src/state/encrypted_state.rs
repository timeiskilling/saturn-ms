use std::{str::FromStr, time::Duration};

use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{commitment_config::CommitmentConfig, pubkey::Pubkey, signature::Keypair};
use tokio::time::Instant;
use wallet_models::domain::models::{
    acc_data::{AccData, Network},
    token_models::TokenBalance,
    tx_models::SendedTransactions,
};
use zeroize::Zeroize;
use std::error::Error;

use crate::{
    ednpoints::{handlers::fetch_sol_acc_data, token_acc_info::TokenMetaDataProvider},
    password_encryptions::{encryption_parms::EncryptionParams, impl_encryptions::{
        EncryptedData, create_encrypt_data, decrypt_seed, encrypt_seed_with_verification, keypair_from_seed, verify_password,
    }, secure_string::SecureString},
    transactions::tokens_transactions::send_mint_token_transactions,
};

pub struct EncryptedState {
    rpc_node: RpcClient,
    unlocked_keypair: Option<Keypair>,
    encrypted_data: Option<EncryptedData>,
    lock_timer: Instant,
    time_to_lock_sec: u64,
}

impl EncryptedState {
    pub async fn new(rpc_url: &str) -> Self {
        let node = solana_client::nonblocking::rpc_client::RpcClient::new_with_commitment(
            rpc_url.to_string(),
            CommitmentConfig::confirmed(),
        );

        Self {
            rpc_node: node,
            unlocked_keypair: None,
            encrypted_data: None,
            lock_timer: Instant::now(),
            time_to_lock_sec: 900,
        }
    }

    pub async fn create_saturn_account(
        &mut self,
        password: SecureString,
        name: String,
        bip39_passphrase : Option<SecureString>
    ) -> Result<AccData, Box<dyn std::error::Error>> {
        let (encrypt_data,wallet_data) = create_encrypt_data(password, bip39_passphrase, EncryptionParams::mobile())?;
        // let data = fetch_sol_acc_data(&self.rpc_node, &encrypt_data.pubkey).await;
        let data = AccData {
            pubkey: encrypt_data.pubkey.to_string(),
            display_name: Some(name),
            network: Network::Solana,
            ..Default::default()
        };
        self.encrypted_data = Some(encrypt_data);

        Ok(data)
    }

    pub async fn unclok_wallet(
        &mut self,
        password: SecureString,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>>
    {
        if let Some(data) = &self.encrypted_data {
            self.lock_timer = Instant::now();
            let mut seed = decrypt_seed(&data.encrypt, password)?;
            self.unlocked_keypair = Some(keypair_from_seed(&seed)?);
            seed.zeroize();
            return Ok(());
        }
        Err("Invalid Pass".to_string().into())
    }

    pub async fn refresh_data<P>(
        &self,
        provider: &P,
    ) -> Result<AccData, Box<dyn Error + Send + Sync>>
    where
        P: TokenMetaDataProvider,
    {
        if let Some(data) = &self.encrypted_data {
            return fetch_sol_acc_data(&self.rpc_node, &data.pubkey, provider).await;
        }
        Err("No wallet data".into())
    }

    fn lock(&mut self) {
        self.unlocked_keypair = None;
    }

    fn set_up_time_to_lock(&mut self, time: u64) {
        self.time_to_lock_sec = time;
    }

    pub async fn send_tokens(
        &mut self,
        to: &Pubkey,
        amount: u64,
        mint: TokenBalance,
    ) -> Result<SendedTransactions, Box<dyn std::error::Error + Send + Sync>> {
        if let Some(key) = &self.unlocked_keypair {
            if self.lock_timer.elapsed() > Duration::from_secs(self.time_to_lock_sec) {
                self.lock();
                return Err("Wallet locked due to inactivity".to_string().into());
            }
            let token_program = &Pubkey::from_str(&mint.token_program.clone().unwrap()).unwrap();
            let response =
                send_mint_token_transactions(&self.rpc_node, token_program, key, to, amount, mint)
                    .await;

            match response {
                Ok(response) => Ok(response),
                Err(err) => Err(err),
            }
        } else {
            Err("Denied Acces".to_string().into())
        }
    }

    // pub fn change_pass(
    //     &mut self,
    //     password: SecureString,
    //     new_pass: String,
    // ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    //     if self.lock_timer.elapsed() > Duration::from_secs(self.time_to_lock_sec) {
    //         self.lock();
    //         return Err("Wallet locked due to inactivity".to_string().into());
    //     }
    //     if let Some(encrypt) = &self.encrypted_data {
    //         let pass_check = verify_password(&encrypt.encrypt, password)?;
    //         let new_encrytp = 
    //         if pass_check {

    //         }
    //     }
    //     Ok(())
    // }
}
