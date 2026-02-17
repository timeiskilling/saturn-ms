use serde::{Deserialize, Serialize};
use solana_sdk::pubkey::Pubkey;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Instruction {
    #[serde(rename = "programId")]
    pub program_id: Pubkey,

    pub accounts: Vec<AccountMeta>,

    pub data: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AccountMeta {
    pub pubkey: Pubkey,

    #[serde(rename = "isSigner")]
    pub is_signer: bool,

    #[serde(rename = "isWritable")]
    pub is_writable: bool,
}
