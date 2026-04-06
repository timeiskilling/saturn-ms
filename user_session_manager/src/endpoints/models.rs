use saturn_errors::error::UserServiceError;
use serde::{Deserialize, Serialize};

use crate::auth_manager::signature_check::{SolSignature, Unverified};

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

impl SolVerifyRequest {
    // Notice we pass the reconstructed message bytes as an argument now!
    pub fn try_into_domain(
        self,
        expected_message: Vec<u8>,
    ) -> Result<SolSignature<Unverified>, UserServiceError> {
        let pk_vec = bs58::decode(self.public_key)
            .into_vec()
            .map_err(|_| UserServiceError::InvalidSignature)?;

        let sig_vec = bs58::decode(self.signature)
            .into_vec()
            .map_err(|_| UserServiceError::InvalidSignature)?;

        let pk_array: [u8; 32] = pk_vec
            .try_into()
            .map_err(|_| UserServiceError::InvalidSignature)?;

        let sig_array: [u8; 64] = sig_vec
            .try_into()
            .map_err(|_| UserServiceError::InvalidSignature)?;
        Ok(SolSignature::new(pk_array, expected_message, sig_array))
    }
}
