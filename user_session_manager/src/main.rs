pub mod app_state;
pub mod auth_manager;
pub mod endpoints;
pub mod postgres;
pub mod redis;
pub mod state_config;
pub mod state_manager;

#[tokio::main]
async fn main() {
    println!("Hello, world!");
}
