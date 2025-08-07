use crate::models::jupiter_models::{SwapMode, SwapType};

impl ToString for SwapMode {
    fn to_string(&self) -> String {
        match self {
            SwapMode::ExactIn => "ExactIn".to_string(),
            SwapMode::ExactOut => "ExactOut".to_string(),
        }
    }
}


impl ToString for SwapType {
    fn to_string(&self) -> String {
        match self {
            SwapType::Aggregator => "aggregator".to_string(),
            SwapType::Rfq => "rfq".to_string(),
            SwapType::Hashflow => "hashflow".to_string(),
        }
    }
}