// src/rpc_layer/mod.rs

pub mod rpc_provider;
pub mod retry_config;
pub mod rpc_metrics;
pub mod rpc_manager;

// #[cfg(not(target_arch = "wasm32"))]
pub mod managed_rpc_client;

// #[cfg(target_arch = "wasm32")]


// #[cfg(target_arch = "wasm32")]
// pub use wasm_rpc_client::WasmRpcClient;