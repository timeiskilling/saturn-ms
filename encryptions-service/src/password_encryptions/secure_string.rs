use zeroize::{Zeroize, ZeroizeOnDrop};

#[derive(Zeroize, ZeroizeOnDrop)]
pub struct SecureString {
    inner: String,
}

impl SecureString {
    pub fn new(s: String) -> Self {
        Self { inner: s }
    }

    pub fn as_str(&self) -> &str {
        &self.inner
    }
}

impl From<String> for SecureString {
    fn from(s: String) -> Self {
        Self::new(s)
    }
}