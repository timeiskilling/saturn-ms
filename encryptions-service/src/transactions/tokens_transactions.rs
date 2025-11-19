use std::sync::Arc;

use chrono::Utc;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{instruction::Instruction, message::Message, pubkey::Pubkey, signature::{Keypair, Signature}, signer::Signer, transaction::Transaction};
use spl_token_interface::instruction::transfer_checked;
use tokio::sync::Mutex;
use wallet_models::domain::models::{
    acc_data::{AccData, Network},
    token_models::TokenBalance,
    tx_models::SendedTransactions,
};

use crate::traits::signer_wraper::{SaturnSigner, SecureKeystore};

pub async fn send_mint_token_transactions(
    rpc: &RpcClient,
    token_program: &Pubkey,
    source_keypair: &dyn SaturnSigner,
    destination_pubkey: &Pubkey,
    amount: u64,
    mint: TokenBalance,
) -> Result<SendedTransactions, Box<dyn std::error::Error + Send + Sync>> {
    let source_pubkey = &source_keypair.sf_pubkey();
    let transfer = transfer_checked(
        token_program,
        source_pubkey,
        &Pubkey::from_str_const(&mint.mint),
        destination_pubkey,
        source_pubkey,
        &[source_pubkey],
        amount,
        mint.decimals,
    )
    .unwrap();
    let message = Message::new(&[transfer],Some(source_pubkey));
    let mut transaction = Transaction::new_unsigned(message);
    let blockhash = rpc.get_latest_blockhash().await.unwrap();
    transaction.message.recent_blockhash = blockhash;
    let serialize_message = transaction.message_data();
    let signature = source_keypair.sf_sign_message(&serialize_message);

    transaction.signatures = vec![signature];


    // let tx = Transaction::new_signed_with_payer(
    //     &[transfer],
    //     Some(source_pubkey),
    //     &[source_keypair],
    //     blockhash,
    // );

    let sending = rpc.send_and_confirm_transaction_with_spinner(&transaction).await;

    match sending {
        Ok(signature) => {
            let sig_str = signature.to_string();
            let solscan_url = format!("https://solscan.io/tx/{}", sig_str);

            Ok(SendedTransactions {
                signature_url: solscan_url,
                sendet_at: Some(Utc::now()),

                to: destination_pubkey.to_string(),
                mint: mint.mint,
                amount,
            })
        }
        Err(err) => Err(format!("Rpc: {:?};\nError: {:?}", err.request, err.kind).into()),
    }
}

//--------------------------

pub async fn send_tokens_with_proper_locking(
    keystore: Arc<Mutex<SecureKeystore>>,
    rpc: Arc<RpcClient>,
    recipient: Pubkey,
    amount: u64,
    token_mint: TokenBalance
) -> Result<SendedTransactions, Box<dyn std::error::Error + Send + Sync>> {
    
    let recent_blockhash = rpc.get_latest_blockhash().await?;
    
    let signed_transaction = {
        let keystore_guard = keystore.lock().await;
        keystore_guard.with_signer(|signer| {
            sign_transaction(
                signer,
                &recipient,
                amount,
                &token_mint,
                recent_blockhash,
            )
        })?
    }?;

    let sending = rpc.send_and_confirm_transaction_with_spinner(&signed_transaction).await;

    match sending {
        Ok(signature) => {
            let sig_str = signature.to_string();
            let solscan_url = format!("https://solscan.io/tx/{}", sig_str);

            Ok(SendedTransactions {
                signature_url: solscan_url,
                sendet_at: Some(Utc::now()),
                to: recipient.to_string(),
                mint: token_mint.mint,
                amount,
            })
        }
        Err(err) => Err(format!("Rpc: {:?};\nError: {:?}", err.request, err.kind).into()),
    }
}

pub fn sign_transaction(
    signer: &dyn SaturnSigner,
    recipient: &Pubkey,
    amount: u64,
    token_mint: &TokenBalance,
    recent_blockhash: solana_sdk::hash::Hash,
) -> Result<Transaction, Box<dyn std::error::Error + Send + Sync>> {
    let signer_pubkey = &signer.sf_pubkey();
    let transfer_instruction = create_token_transfer_instruction(
        signer_pubkey,
        recipient,
        amount,
        token_mint,
    )?;
    let message = Message::new(
        &[transfer_instruction],
        Some(signer_pubkey), 
    );
    let mut transaction = Transaction::new_unsigned(message);
    transaction.message.recent_blockhash = recent_blockhash;
    
    let serialized_message = transaction.message_data();
    
    let signature = signer.sf_sign_message(&serialized_message);
    transaction.signatures = vec![signature];

    Ok(transaction)
}

fn create_token_transfer_instruction(
    from: &Pubkey,
    to: &Pubkey,
    amount: u64,
    token_mint: &TokenBalance,
) -> Result<Instruction, Box<dyn std::error::Error + Send + Sync>> {    

     let instruction = transfer_checked(
        &Pubkey::from_str_const(&token_mint.token_program.clone().unwrap()),
        from,
        &Pubkey::from_str_const(&token_mint.mint),
        to,
        from,
        &[from],
        amount,
        token_mint.decimals,
    )?;
    
    Ok(instruction)
}