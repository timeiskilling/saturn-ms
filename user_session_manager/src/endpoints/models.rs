use saturn_errors::error::UserServiceError;
use serde::{Deserialize, Serialize};

use crate::auth_manager::signature_check::{SolSignature, Unverified};
fn decode_sol_signature(
    public_key: &str,
    signature: &str,
    expected_message: Vec<u8>,
) -> Result<SolSignature<Unverified>, UserServiceError> {
    let pk_array: [u8; 32] = bs58::decode(public_key)
        .into_vec()
        .map_err(|_| UserServiceError::InvalidSignature)?
        .try_into()
        .map_err(|_| UserServiceError::InvalidSignature)?;

    let sig_array: [u8; 64] = bs58::decode(signature)
        .into_vec()
        .map_err(|_| UserServiceError::InvalidSignature)?
        .try_into()
        .map_err(|_| UserServiceError::InvalidSignature)?;

    Ok(SolSignature::new(pk_array, expected_message, sig_array))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifySignature {
    pub request_id: String,
    pub public_key: String,
    pub signature: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PromoteSignature {
    pub signature: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NonceResponse {
    pub nonce: String,
    pub request_id: String,
    pub message_template: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SolVerifyRequest {
    #[serde(flatten)]
    pub verify_data: VerifySignature,
    pub wallet_id: String,
    pub address_type: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TargetPayload {
    pub target_wallet: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteAccountRequest {
    pub request_id: String,
    pub signature: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PromoteWalletRequest {
    #[serde(flatten)]
    pub verify_data: PromoteSignature,
    pub request_id: String,
    pub target_wallet: String,
    pub wallet_id: String,
    pub name: String,
    pub address_type: String,
}

impl PromoteSignature {
    pub fn try_into_domain(
        self,
        public_key: &str,
        expected_message: Vec<u8>,
    ) -> Result<SolSignature<Unverified>, UserServiceError> {
        decode_sol_signature(public_key, &self.signature, expected_message)
    }
}

impl VerifySignature {
    pub fn try_into_domain(
        self,
        expected_message: Vec<u8>,
    ) -> Result<SolSignature<Unverified>, UserServiceError> {
        decode_sol_signature(&self.public_key, &self.signature, expected_message)
    }
}

impl DeleteAccountRequest {
    pub fn try_into_domain(
        self,
        public_key: &str,
        expected_message: Vec<u8>,
    ) -> Result<SolSignature<Unverified>, UserServiceError> {
        decode_sol_signature(public_key, &self.signature, expected_message)
    }
}
