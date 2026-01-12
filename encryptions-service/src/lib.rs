#![cfg(target_arch = "wasm32")]

pub mod error_handling;

pub mod traits;



pub mod wasm;

pub use error_handling::error_code::{WalletError, RpcError, KeystoreError};

pub use wasm::wasm_wallet_manager::WasmWalletManager;