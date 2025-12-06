#![cfg(target_arch = "wasm32")]

pub mod models;
pub mod wasm_wallet_manager;

use std::sync::Arc;

pub use wasm_wallet_manager::WasmWalletManager;


use wasm_bindgen::prelude::*;

use crate::{
    batching::{
        batching_client::BatchedRpcClient, 
        batching_config::BatchConfig
    }, ednpoints::token_acc_info::JupiterClient, rpc_layer::{retry_config::RetryConfig, rpc_provider::ManagedRpcClient}, state::saturn_wallet_service::{WalletManager, WalletManagerConfig}
};

#[wasm_bindgen(start)]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub async fn create_wallet_manager(rpc_url: String) -> Result<WasmWalletManager, JsValue> {
    let metadata_provider = 
        JupiterClient::new(&rpc_url)
            .map_err(|e| JsValue::from_str(&format!("Invalid provider: {}", e)))?;

    let managed_rpc = Arc::new(ManagedRpcClient::new(
        "https://mainnet.helius-rpc.com/?api-key=bd7b24dd-d644-4612-a486-a5acb8427920".to_string(),
        25,
        RetryConfig::default(),
    ));

    let batching_provider = Arc::new(BatchedRpcClient::new_with_managed_transport(
        managed_rpc,
        BatchConfig::default(),
    ));
    let wallet_config = WalletManagerConfig::default();

    let manager = WalletManager::new(batching_provider, wallet_config, metadata_provider);
    let wasm_manager = WasmWalletManager::new(manager);
    Ok(wasm_manager)
}
