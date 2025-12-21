use solana_sdk::{instruction::Instruction, message::Message, pubkey::Pubkey, transaction::Transaction};
use spl_token_interface::instruction::transfer_checked;

use crate::wasm::models::TokenBalance;

pub fn create_unsign_transaction(
    signer: &Pubkey,
    recipient: &Pubkey,
    amount: u64,
    token_mint: &TokenBalance,
    recent_blockhash: solana_sdk::hash::Hash,
) -> Result<Transaction, Box<dyn std::error::Error + Send + Sync>> {
    let transfer_instruction = create_token_transfer_instruction(
        signer,
        recipient,
        amount,
        token_mint,
    )?;
    let message = Message::new(
        &[transfer_instruction],
        Some(signer), 
    );
    let mut transaction = Transaction::new_unsigned(message);
    transaction.message.recent_blockhash = recent_blockhash;
    
    // let serialized_message = transaction.message_data();
    
    // let signature = signer.sf_sign_message(&serialized_message);
    // transaction.signatures = vec![signature];

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