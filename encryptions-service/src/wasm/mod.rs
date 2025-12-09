// #![cfg(target_arch = "wasm32")]

pub mod models;
pub mod wasm_encryptions;
pub mod wasm_rpc_client;
pub mod wasm_solana_methods;
pub mod wasm_state;
pub mod wasm_token_acc_info;
pub mod wasm_types;
pub mod wasm_wallet_manager;
pub mod wasm_wallet_service;
use std::rc::Rc;

pub use wasm_wallet_manager::WasmWalletManager;

use wasm_bindgen::prelude::*;

use crate::wasm::{
    wasm_rpc_client::WasmRpcClient,
    wasm_token_acc_info::JupiterClient,
    wasm_wallet_service::{WalletManager, WalletManagerConfig},
};

#[wasm_bindgen(start)]
pub fn init_panic_hook() -> Result<(), JsValue> {
    console_error_panic_hook::set_once();
    tracing_wasm::set_as_global_default();
    Ok(())
}

#[wasm_bindgen]
pub async fn create_wallet_manager(rpc_url: String,jupiter_base_url : String) -> Result<WasmWalletManager, JsValue> {
    
    let metadata_provider = JupiterClient::new(&jupiter_base_url)
        .map_err(|e| JsValue::from_str(&format!("Invalid provider: {}", e)))?;

    // let managed_rpc = Arc::new(ManagedRpcClient::new(
    //     "https://mainnet.helius-rpc.com/?api-key=bd7b24dd-d644-4612-a486-a5acb8427920".to_string(),
    //     25,
    //     RetryConfig::default(),
    // ));

    let rpc_provider = Rc::new(WasmRpcClient::new(rpc_url));
    let wallet_config = WalletManagerConfig::default();

    let manager = WalletManager::new(rpc_provider, wallet_config, metadata_provider);
    let wasm_manager = WasmWalletManager::new(manager);
    Ok(wasm_manager)
}
