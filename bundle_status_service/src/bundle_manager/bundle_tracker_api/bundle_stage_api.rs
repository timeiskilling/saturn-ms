use serde::{Serialize,Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Context {
    pub slot: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BundleStatusResponse {
    pub context: Context,
    pub value: Vec<Option<BundleStatus>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BundleStatusUpdate {
    pub bundle_id: String,
    pub status: String,
    pub timestamp: u64,
    pub slot: Option<u64>,
    pub stage: BundleStage,
    pub version: u64,
    pub user_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BundleStage {
    Submitted,
    InFlight,
    Landed,
    Confirmed,
    Finalized,
    Failed,
}

impl BundleStage {
    pub fn can_transition_to(&self, new_stage: &BundleStage) -> bool {
        matches!(
            (self, new_stage),
            (BundleStage::Submitted, BundleStage::InFlight)
                | (BundleStage::InFlight, BundleStage::Landed)
                | (BundleStage::InFlight, BundleStage::Failed)
                | (BundleStage::Landed, BundleStage::Confirmed)
                | (BundleStage::Landed, BundleStage::Failed)
                | (BundleStage::Confirmed, BundleStage::Finalized)
                | (BundleStage::Confirmed, BundleStage::Failed)
                | (_, BundleStage::Failed)
        )
    }

    pub fn is_terminal(&self) -> bool {
        matches!(self, BundleStage::Finalized | BundleStage::Failed)
    }
}

impl std::fmt::Display for BundleStage {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            BundleStage::Submitted => "Submitted",
            BundleStage::InFlight => "InFlight",
            BundleStage::Landed => "Landed",
            BundleStage::Confirmed => "Confirmed",
            BundleStage::Finalized => "Finalized",
            BundleStage::Failed => "Failed",
        };
        write!(f, "{}", s)
    }
}


impl From<BundleStage> for i32 {
    fn from(value: BundleStage) -> Self {
        match value {
            BundleStage::Submitted => 1,
            BundleStage::InFlight => 2,
            BundleStage::Landed => 3,
            BundleStage::Confirmed => 4,
            BundleStage::Finalized => 5,
            BundleStage::Failed => 6,
        }
    }
}


#[derive(Debug, Serialize, Deserialize)]
pub struct InflightBundleStatusResponse {
    pub context: Context,
    pub value: Vec<Option<InflightBundleStatus>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BundleStatus {
    pub bundle_id: String,
    pub transactions: Vec<String>,
    pub slot: u64,
    pub confirmation_status: String,
    pub err: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InflightBundleStatus {
    pub bundle_id: String,
    pub status: String,
    pub landed_slot: Option<u64>,
}