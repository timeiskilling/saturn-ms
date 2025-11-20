#[derive(Debug, Clone)]
pub struct EncryptionParams {
    pub argon2_memory_kib: u32,
    pub argon2_iterations: u32,
    pub argon2_parallelism: u32,
}

impl Default for EncryptionParams {
    fn default() -> Self {
        Self {
            argon2_memory_kib: 131072, // 128 MB
            argon2_iterations: 4,
            argon2_parallelism: 4,
        }
    }
}

impl EncryptionParams {
    pub fn mobile() -> Self {
        Self {
            argon2_memory_kib: 47104, // 46 MB
            argon2_iterations: 3,
            argon2_parallelism: 2,
        }
    }
    
    pub fn high_security() -> Self {
        Self {
            argon2_memory_kib: 262144, // 256 MB
            argon2_iterations: 5,
            argon2_parallelism: 8,
        }
    }
}