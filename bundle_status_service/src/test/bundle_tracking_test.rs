use crate::trader::JupiterTrader;
use anyhow::{Result, anyhow};
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
use std::{sync::Arc, time::Duration};
use tokio::time::sleep;
use tracing::{debug, error, info, warn};

#[derive(Debug)]
struct BundleStatus {
    confirmation_status: Option<String>,
    err: Option<serde_json::Value>,
    transactions: Option<Vec<String>>,
}

//  Result<String, Box<dyn std::error::Error + Send + Sync>>
pub async fn send_bundle(trader: Arc<JupiterTrader>) -> Result<()> {
    let solana_rpc = solana_client::nonblocking::rpc_client::RpcClient::new_with_commitment(
        "https://mainnet.helius-rpc.com/?api-key=bd7b24dd-d644-4612-a486-a5acb8427920".to_string(),
        CommitmentConfig::confirmed(),
    );
    let jito_sdk = JitoJsonRpcSDK::new(
        "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1",
        None,
    );
    let sender = Keypair::new();
    info!("Sender pubkey: {}", sender.pubkey());

    let receiver = Pubkey::from_str_const("4dmPnKRp3kgN99fMvszGvabHFSE7zdjzniYT6GiTh6cp");
    info!("Get tip acc");
    let jito_tip_acc =
        solana_sdk::pubkey::Pubkey::from_str_const("96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5");
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
    tokio::time::sleep(Duration::from_secs(10)).await;
    // let bundle_result = jito_sdk.send_bundle(Some(params), None).await?;

    let max_retries = 20;
    let mut delay = Duration::from_millis(200);
    let backoff_factor = 2.0;
    let mut bundle_result = None;
    
    for attempt in 1..=max_retries {
        info!("Sending bundle (attempt {}/{})", attempt, max_retries);
        match jito_sdk.send_bundle(Some(params.clone()), None).await {
            Ok(response) => {
                if response.get("error").is_some() {
                    error!(
                        "Jito returned an error in the response body: {:?}",
                        response
                    );
                } else {
                    info!("Bundle submitted successfully!");
                    bundle_result = Some(response);
                    break;
                }
            }
            Err(e) => {

                if e.to_string().contains("429 Too Many Requests") {
                    warn!("Rate limited. Retrying in {:?}...", delay);
                } else {
                    error!("Failed to send bundle with non-retriable error: {}", e);
                    return Err(e);
                }
            }
        }

        if attempt < max_retries {
            sleep(delay).await;
            delay = delay.mul_f32(backoff_factor);
        }
    }
    // let bundle_uuid = response["result"]
    //     .as_str()
    //     .ok_or_else(|| anyhow!("Failed to get bundle UUID from response"))?;
    // info!("Bundle sent with UUID: {}", bundle_uuid);

    // match bundle_result {
    //     Ok(response_json) => {
    //         tracing::info!("Full Jito response: {:?}", response_json);

    //         match response_json["result"].as_str() {
    //             Some(bundle_uuid) => {
    //                 tracing::info!("Bundle sent successfully with UUID: {}", bundle_uuid);
    //                 if let Err(e) = trader
    //                     .bundle_status
    //                     .add_bundles(vec![bundle_uuid.to_string()], sender.pubkey().to_string())
    //                     .await
    //                 {
    //                     tracing::error!("Failed to save bundle {}: {}", bundle_uuid, e);
    //                 }
    //                 Ok(bundle_uuid.to_string())
    //             }
    //             None => {
    //                 if let Some(error) = response_json["error"].as_object() {
    //                     let error_msg = format!("Jito error: {:?}", error);
    //                     tracing::error!("{}", error_msg);
    //                     Err(error_msg.into())
    //                 } else {
    //                     let error_msg = format!(
    //                         "Failed to get bundle UUID from response JSON: {:?}",
    //                         response_json
    //                     );
    //                     tracing::error!("{}", error_msg);
    //                     Err(error_msg.into())
    //                 }
    //             }
    //         }
    //     }
    //     Err(e) => {
    //         tracing::error!("Failed to send bundle: {}", e);
    //         Err(e.into())
    //     }
    // }
    let bundle_result = bundle_result.ok_or_else(|| {
        anyhow!(
            "Failed to send bundle after {} attempts due to rate limiting",
            max_retries
        )
    })?;

    info!("Extracting bundle UUID...");
    let bundle_uuid = bundle_result["result"]
        .as_str()
        .ok_or_else(|| anyhow!("Failed to get bundle UUID from response"))?;
    info!("Bundle sent with UUID: {}", bundle_uuid);

    // Confirm bundle status
    let max_retries = 30;
    let retry_delay = Duration::from_secs(2);

    for attempt in 1..=max_retries {
        debug!(
            "Checking bundle status (attempt {}/{})",
            attempt, max_retries
        );

        let status_response = jito_sdk
            .get_in_flight_bundle_statuses(vec![bundle_uuid.to_string()])
            .await?;

        if let Some(result) = status_response.get("result") {
            if let Some(value) = result.get("value") {
                if let Some(statuses) = value.as_array() {
                    if let Some(bundle_status) = statuses.first() {
                        if let Some(status) = bundle_status.get("status") {
                            match status.as_str() {
                                Some("Landed") => {
                                    info!("Bundle landed on-chain. Checking final status...");
                                    return check_final_bundle_status(&jito_sdk, bundle_uuid).await;
                                }
                                Some("Pending") => {
                                    debug!("Bundle is pending. Waiting...");
                                }
                                Some("Failed") => {
                                    error!("Bundle failed. Stopping polling process.");
                                    return Err(anyhow!("Bundle status returned Failed"));
                                }
                                // For "Invalid" status, we'll log a warning but continue polling
                                // since this might be a transient state
                                Some("Invalid") => {
                                    warn!(
                                        "Bundle currently marked as invalid. Continuing to poll..."
                                    );
                                }
                                Some(status) => {
                                    warn!("Unexpected bundle status: {}. Waiting...", status);
                                }
                                None => {
                                    warn!("Unable to parse bundle status. Waiting...");
                                }
                            }
                        } else {
                            warn!("Status field not found in bundle status. Waiting...");
                        }
                    } else {
                        warn!("Bundle status not found. Waiting...");
                    }
                } else {
                    warn!("Unexpected value format. Waiting...");
                }
            } else {
                warn!("Value field not found in result. Waiting...");
            }
        } else if let Some(error) = status_response.get("error") {
            error!("Error checking bundle status: {:?}", error);
        } else {
            warn!("Unexpected response format. Waiting...");
        }

        if attempt < max_retries {
            sleep(retry_delay).await;
        }
    }

    Err(anyhow!(
        "Failed to confirm bundle status after {} attempts",
        max_retries
    ))
}

async fn check_final_bundle_status(jito_sdk: &JitoJsonRpcSDK, bundle_uuid: &str) -> Result<()> {
    let max_retries = 10;
    let retry_delay = Duration::from_secs(2);

    for attempt in 1..=max_retries {
        debug!(
            "Checking final bundle status (attempt {}/{})",
            attempt, max_retries
        );

        let status_response = jito_sdk
            .get_bundle_statuses(vec![bundle_uuid.to_string()])
            .await?;
        let bundle_status = get_bundle_status(&status_response)?;

        match bundle_status.confirmation_status.as_deref() {
            Some("confirmed") => {
                info!("Bundle confirmed on-chain. Waiting for finalization...");
                check_transaction_error(&bundle_status)?;
            }
            Some("finalized") => {
                info!("Bundle finalized on-chain successfully!");
                check_transaction_error(&bundle_status)?;
                print_transaction_url(&bundle_status);
                return Ok(());
            }
            Some(status) => {
                warn!(
                    "Unexpected final bundle status: {}. Continuing to poll...",
                    status
                );
            }
            None => {
                warn!("Unable to parse final bundle status. Continuing to poll...");
            }
        }

        if attempt < max_retries {
            sleep(retry_delay).await;
        }
    }

    Err(anyhow!(
        "Failed to get finalized status after {} attempts",
        max_retries
    ))
}

fn get_bundle_status(status_response: &serde_json::Value) -> Result<BundleStatus> {
    status_response
        .get("result")
        .and_then(|result| result.get("value"))
        .and_then(|value| value.as_array())
        .and_then(|statuses| statuses.first())
        .ok_or_else(|| anyhow!("Failed to parse bundle status"))
        .map(|bundle_status| BundleStatus {
            confirmation_status: bundle_status
                .get("confirmation_status")
                .and_then(|s| s.as_str())
                .map(String::from),
            err: bundle_status.get("err").cloned(),
            transactions: bundle_status
                .get("transactions")
                .and_then(|t| t.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str().map(String::from))
                        .collect()
                }),
        })
}

fn check_transaction_error(bundle_status: &BundleStatus) -> Result<()> {
    if let Some(err) = &bundle_status.err {
        if err["Ok"].is_null() {
            info!("Transaction executed without errors.");
            Ok(())
        } else {
            error!("Transaction encountered an error: {:?}", err);
            Err(anyhow!("Transaction encountered an error"))
        }
    } else {
        Ok(())
    }
}

fn print_transaction_url(bundle_status: &BundleStatus) {
    if let Some(transactions) = &bundle_status.transactions {
        if let Some(tx_id) = transactions.first() {
            info!("Transaction URL: https://solscan.io/tx/{}", tx_id);
        } else {
            warn!("Unable to extract transaction ID.");
        }
    } else {
        warn!("No transactions found in the bundle status.");
    }
}
