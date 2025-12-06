pub mod ednpoints;
pub mod error_handling;
pub mod password_encryptions;
pub mod rpc_layer;
pub mod state;
pub mod traits;
pub mod batching;
pub mod transactions;

#[cfg(target_arch = "wasm32")]
pub mod wasm;

pub use state::saturn_wallet_service::{WalletManager, WalletManagerConfig};
pub use error_handling::error_code::{WalletError, RpcError, KeystoreError};

#[cfg(target_arch = "wasm32")]
pub use wasm::wasm_wallet_manager::WasmWalletManager;