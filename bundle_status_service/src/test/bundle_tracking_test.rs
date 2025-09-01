use std::sync::Arc;

use base64::{Engine, engine::general_purpose};
use jito_sdk_rust::JitoJsonRpcSDK;
use serde_json::json;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    signature::Keypair,
    signer::Signer,
    system_instruction,
    transaction::Transaction,
};
use tracing::info;

use crate::trader::JupiterTrader;

pub async fn send_bundle(
    trader : Arc<JupiterTrader>
) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let solana_rpc = solana_client::nonblocking::rpc_client::RpcClient::new_with_commitment(
        "https://mainnet.helius-rpc.com/?api-key=bd7b24dd-d644-4612-a486-a5acb8427920".to_string(),
        CommitmentConfig::confirmed(),
    );
    let jito_sdk = JitoJsonRpcSDK::new("https://mainnet.block-engine.jito.wtf/api/v1/", None);

    let sender = Keypair::new();
    info!("Sender pubkey: {}", sender.pubkey());

    let receiver = Pubkey::from_str_const("4dmPnKRp3kgN99fMvszGvabHFSE7zdjzniYT6GiTh6cp");
    info!("Get tip acc");
    let jito_tip_acc = solana_sdk::pubkey::Pubkey::from_str_const("96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5");
    let jito_tip_account = Pubkey::from_str_const(&jito_tip_acc.to_string());

    let main_transfer_amount = 1_000; // 0.000001 SOL
    let jito_tip_amount = 3_000; // 0.000003 SOL

    info!("Creating transcation");
    let main_transfer_ix =
        system_instruction::transfer(&sender.pubkey(), &receiver, main_transfer_amount);
    info!("Jito tip transcation");
    let jito_tip_ix =
        system_instruction::transfer(&sender.pubkey(), &jito_tip_account, jito_tip_amount);

    let memo_program_id = Pubkey::from_str_const("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
    let memo_ix = Instruction::new_with_bytes(
        memo_program_id,
        b"hello world jito bundle",
        vec![AccountMeta::new(sender.pubkey(), true)],
    );

    let mut transaction = Transaction::new_with_payer(
        &[main_transfer_ix, memo_ix, jito_tip_ix],
        Some(&sender.pubkey()),
    );

    let recent_blockhash = solana_rpc.get_latest_blockhash().await?;
    transaction.sign(&[&sender], recent_blockhash);

    let serialized_tx = general_purpose::STANDARD.encode(bincode::serialize(&transaction)?);

    let transactions = json!([serialized_tx]);

    let params = json!([
        transactions,
        {
            "encoding": "base64"
        }
    ]);
    info!("Sending bundle with 1 transaction...");

    let bundle_result = jito_sdk.send_bundle(Some(params), None).await;

    // let bundle_uuid = response["result"]
    //     .as_str()
    //     .ok_or_else(|| anyhow!("Failed to get bundle UUID from response"))?;
    // info!("Bundle sent with UUID: {}", bundle_uuid);

    match bundle_result {
        Ok(response_json) => {
            tracing::info!("Full Jito response: {:?}", response_json);

            match response_json["result"].as_str() {
                Some(bundle_uuid) => {
                    tracing::info!("Bundle sent successfully with UUID: {}", bundle_uuid);
                    if let Err(e) = trader
                        .bundle_status
                        .add_bundles(vec![bundle_uuid.to_string()], sender.pubkey().to_string())
                        .await
                    {
                        tracing::error!("Failed to save bundle {}: {}", bundle_uuid, e);
                    }
                    Ok(bundle_uuid.to_string())
                }
                None => {
                    if let Some(error) = response_json["error"].as_object() {
                        let error_msg = format!("Jito error: {:?}", error);
                        tracing::error!("{}", error_msg);
                        Err(error_msg.into())
                    } else {
                        let error_msg = format!(
                            "Failed to get bundle UUID from response JSON: {:?}",
                            response_json
                        );
                        tracing::error!("{}", error_msg);
                        Err(error_msg.into())
                    }
                }
            }
        }
        Err(e) => {
            tracing::error!("Failed to send bundle: {}", e);
            Err(e.into())
        }
    }
}
