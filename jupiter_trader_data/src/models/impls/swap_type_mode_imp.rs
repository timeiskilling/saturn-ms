use std::fmt::Display;

use crate::models::jupiter_models::{SwapMode, SwapType};

impl Display for SwapMode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SwapMode::ExactIn => write!(f, "ExactIn"),
            SwapMode::ExactOut => write!(f, "ExactOut"),
        }
    }
}

impl Display for SwapType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SwapType::Aggregator => write!(f, "aggregator"),
            SwapType::Rfq => write!(f, "rfq"),
            SwapType::Hashflow => write!(f, "hashflow"),
        }
    }
}
