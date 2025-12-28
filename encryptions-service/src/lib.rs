#![cfg(target_arch = "wasm32")]
// pub mod endpoints;
pub mod error_handling;
// pub mod password_encryptions;
// pub mod rpc_layer;
// pub mod state;
pub mod traits;
// pub mod batching;
// pub mod transactions;


pub mod wasm;

pub use error_handling::error_code::{WalletError, RpcError, KeystoreError};

pub use wasm::wasm_wallet_manager::WasmWalletManager;