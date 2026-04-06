use std::marker::PhantomData;

use saturn_errors::error::UserAuthError;
use solana_sdk::signature::Signature;

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
