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
pub struct NonceResponse {
    pub nonce: String,
    pub request_id: String,
    pub message_template: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SolVerifyRequest {
    pub request_id: String,
    pub public_key: String, // Base58 encoded string from Phantom
    pub signature: String,  // Base58 encoded string from Phantom
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
    pub request_id: String,
    pub target_wallet: String,
    pub signature: String,
}

impl PromoteWalletRequest {
    pub fn try_into_domain(
        self,
        public_key: &str,
        expected_message: Vec<u8>,
    ) -> Result<SolSignature<Unverified>, UserServiceError> {
        decode_sol_signature(public_key, &self.signature, expected_message)
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

impl SolVerifyRequest {
    pub fn try_into_domain(
        self,
        expected_message: Vec<u8>,
    ) -> Result<SolSignature<Unverified>, UserServiceError> {
        decode_sol_signature(&self.public_key, &self.signature, expected_message)
    }
}
