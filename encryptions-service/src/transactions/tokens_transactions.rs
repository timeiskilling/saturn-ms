use chrono::Utc;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{pubkey::Pubkey, signature::Keypair, signer::Signer, transaction::Transaction};
use spl_token_interface::instruction::transfer_checked;
use wallet_models::domain::models::{
    acc_data::{AccData, Network},
    token_models::TokenBalance,
    tx_models::SendedTransactions,
};

pub async fn send_mint_token_transactions(
    rpc: &RpcClient,
    token_program: &Pubkey,
    source_keypair: &Keypair,
    destination_pubkey: &Pubkey,
    amount: u64,
    mint: TokenBalance,
) -> Result<SendedTransactions, Box<dyn std::error::Error + Send + Sync>> {
    let source_pubkey = &source_keypair.pubkey();
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

    let blockhash = rpc.get_latest_blockhash().await.unwrap();

    let tx = Transaction::new_signed_with_payer(
        &[transfer],
        Some(source_pubkey),
        &[source_keypair],
        blockhash,
    );

    let sending = rpc.send_and_confirm_transaction_with_spinner(&tx).await;

    match sending {
        Ok(signature) => {
            let sig_str = signature.to_string();
            let solscan_url = format!("https://solscan.io/tx/{}", sig_str);

            Ok(SendedTransactions {
                signature_url: solscan_url,
                sendet_at: Some(Utc::now()),
                from: source_pubkey.to_string(),
                to: destination_pubkey.to_string(),
                mint: mint.mint,
                amount,
            })
        }
        Err(err) => Err(format!("Rpc: {:?};\nError: {:?}", err.request, err.kind).into()),
    }
}
