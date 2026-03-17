use serde::{Deserialize, Serialize};
use solana_sdk::pubkey::Pubkey;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Instruction {
    #[serde(rename = "programId", with = "pubkey_string")]
    pub program_id: Pubkey,

    pub accounts: Vec<AccountMeta>,

    pub data: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AccountMeta {
    #[serde(with = "pubkey_string")]
    pub pubkey: Pubkey,

    #[serde(rename = "isSigner")]
    pub is_signer: bool,

    #[serde(rename = "isWritable")]
    pub is_writable: bool,
}

pub mod pubkey_string {
    use serde::{self, Deserialize, Deserializer, Serializer};
    use solana_sdk::pubkey::Pubkey;
    use std::str::FromStr;

    pub fn serialize<S>(pubkey: &Pubkey, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&pubkey.to_string())
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Pubkey, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        Pubkey::from_str(&s).map_err(serde::de::Error::custom)
    }
}

pub mod pubkey_string_option {
    use serde::{self, Deserialize, Deserializer, Serializer};
    use solana_sdk::pubkey::Pubkey;
    use std::str::FromStr;

    pub fn serialize<S>(pubkey: &Option<Pubkey>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match pubkey {
            Some(pk) => serializer.serialize_str(&pk.to_string()),
            None => serializer.serialize_none(),
        }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<Pubkey>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let opt: Option<String> = Option::deserialize(deserializer)?;
        match opt {
            Some(s) => Pubkey::from_str(&s)
                .map(Some)
                .map_err(serde::de::Error::custom),
            None => Ok(None),
        }
    }
}
