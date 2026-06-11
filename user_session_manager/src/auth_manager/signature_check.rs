use std::marker::PhantomData;

use saturn_errors::error::{UserAuthError, UserServiceError};
use solana_sdk::signature::Signature;

use crate::endpoints::{errors::ApiError, models::VerifySignature};

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

#[derive(Debug, Clone)]
pub struct Verified;
#[derive(Debug, Clone)]
pub struct Unverified;

pub trait Verifiable {
    type VerifiedType;
    fn verify(self) -> Result<Self::VerifiedType, UserAuthError>;
}

#[derive(Debug, Clone)]
pub struct SolSignature<State = Unverified> {
    pub public_key: [u8; 32],
    pub message: Vec<u8>,
    pub signature: [u8; 64],
    _state: PhantomData<State>,
}

impl SolSignature<Unverified> {
    pub fn new(public_key: [u8; 32], message: Vec<u8>, signature: [u8; 64]) -> Self {
        Self {
            public_key,
            message,
            signature,
            _state: PhantomData,
        }
    }
}

impl Verifiable for SolSignature<Unverified> {
    type VerifiedType = SolSignature<Verified>;

    fn verify(self) -> Result<Self::VerifiedType, UserAuthError> {
        if self.public_key.len() != 32 {
            return Err(UserAuthError::InvalidPublicKey);
        }

        if self.signature.len() != 64 {
            return Err(UserAuthError::InvalidSignatureFormat);
        }

        let signature = Signature::from(self.signature);

        let is_valid = signature.verify(&self.public_key, self.message.as_slice());

        if is_valid {
            Ok(SolSignature {
                public_key: self.public_key,
                message: self.message,
                signature: self.signature,
                _state: PhantomData,
            })
        } else {
            Err(UserAuthError::VerificationFailed)
        }
    }
}

#[derive(Debug, Clone)]
pub struct EthSignature<State = Unverified> {
    pub address: [u8; 20],
    pub message: Vec<u8>,
    pub signature: [u8; 65],
    _state: PhantomData<State>,
}

impl EthSignature<Unverified> {
    pub fn new(address: [u8; 20], message: Vec<u8>, signature: [u8; 65]) -> Self {
        Self {
            address,
            message,
            signature,
            _state: PhantomData,
        }
    }
}

impl Verifiable for EthSignature<Unverified> {
    type VerifiedType = EthSignature<Verified>;

    fn verify(self) -> Result<Self::VerifiedType, UserAuthError> {
        // TODO crate `k256`  `ethers-core` for check
        // 1. Add prefix: "\x19Ethereum Signed Message:\n" + len(message)
        // 2. Add Keccak256 hash from message
        // 3. Add `recover` public key from signature [r, s, v] and hash
        // 4. Generate address from recovered public key and compare with `self.address`

        let is_valid = true;

        if is_valid {
            Ok(EthSignature {
                address: self.address,
                message: self.message,
                signature: self.signature,
                _state: PhantomData,
            })
        } else {
            Err(UserAuthError::VerificationFailed)
        }
    }
}

pub trait IntoVerifiable {
    type VerifiableType: Verifiable + Send + 'static;
    fn get_public_key(&self) -> &str;
    fn try_into_domain(
        self,
        expected_message: Vec<u8>,
    ) -> Result<Self::VerifiableType, UserServiceError>;
}

impl IntoVerifiable for VerifySignature {
    type VerifiableType = SolSignature<Unverified>;

    fn try_into_domain(
        self,
        expected_message: Vec<u8>,
    ) -> Result<Self::VerifiableType, UserServiceError> {
        let unverified_signature =
            decode_sol_signature(&self.public_key, &self.signature, expected_message)?;
        Ok(unverified_signature)
    }

    fn get_public_key(&self) -> &str {
        &self.public_key
    }
}

pub async fn verify_payload_signature<T>(
    payload_data: T,
    expected_message: String,
    expected_pubkey: Option<&str>,
) -> Result<(), ApiError>
where
    T: IntoVerifiable + Send + 'static,
{
    if let Some(expected) = expected_pubkey {
        let payload = payload_data.get_public_key();

        if payload != expected {
            tracing::warn!(
                "Security breach attempt: payload {} does not match session pubkey {}",
                payload,
                expected
            );
            return Err(ApiError(UserServiceError::Unauthorized));
        }
    }
    let task = tokio::task::spawn_blocking(move || -> Result<(), UserServiceError> {
        let unverified_signature = payload_data.try_into_domain(expected_message.into_bytes())?;

        // Type-State garanted, that if verify() not returned Err, then signature is valid.
        let _verified = unverified_signature
            .verify()
            .map_err(|_| UserServiceError::InvalidSignature)?;

        Ok(())
    });

    task.await
        .map_err(|err| {
            tracing::error!("Crypto blocking task panicked: {:?}", err);
            ApiError(UserServiceError::InternalError(
                "Internal cryptography error".to_string(),
            ))
        })?
        .map_err(ApiError)
}
