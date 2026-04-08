use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DeviceSession {
    pub public_id: String,
    pub wallet: String,
    pub device_name: String,
    pub created_at: String,
}
