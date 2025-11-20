use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signature},
    signer::Signer as SolanaSdkSigner,
};
use tokio::time::Instant;

pub trait SaturnSigner {
    fn sf_pubkey(&self) -> Pubkey;
    fn sf_sign_message(&self, message: &[u8]) -> Signature;
}

impl SaturnSigner for Keypair {
    fn sf_pubkey(&self) -> Pubkey {
        self.pubkey()
    }

    fn sf_sign_message(&self, message: &[u8]) -> Signature {
        self.sign_message(message)
    }
}

pub struct SecureKeystore {
    keypair: Keypair,
    unlock_expiry: Instant,
}

impl SecureKeystore {
    pub fn with_signer<F, R>(&self, f: F) -> Result<R, String>
    where
        F: FnOnce(&dyn SaturnSigner) -> R,
    {
        if Instant::now() > self.unlock_expiry {
            return Err("Keystore locked".to_string());
        }
        Ok(f(&self.keypair))
    }


}

// pub async fn try_send_transaction(key_store : Arc<Mutex<SecureKeystore>>) {
//     let dat =key_store.lock().unwrap().with_signer(|signer| {
//         signer.sf_sign_message(message)
//     })
// }

use std::cell::RefCell;

pub struct Lazy<T, F>
where
    F: FnOnce() -> T,
{
    initializer: RefCell<Option<F>>,
    value: RefCell<Option<T>>,
}

impl<T, F> Lazy<T, F>
where
    F: FnOnce() -> T,
{
    pub fn new(initializer: F) -> Self {
        Self {
            initializer: RefCell::new(Some(initializer)),
            value: RefCell::new(None),
        }
    }

    pub fn get(&self) -> &T {
        if self.value.borrow().is_none() {
            let init = self
                .initializer
                .borrow_mut()
                .take()
                .expect("Initializer was already called");

            let computed_value = init();
            *self.value.borrow_mut() = Some(computed_value);
        }
        // once_cell або std::sync::OnceLock
        unsafe { self.value.as_ptr().as_ref().unwrap().as_ref().unwrap() }
    }
}

fn expensive_computation() -> Vec<u8> {
    println!("Виконую складні обчислення...");
    vec![1, 2, 3, 4, 5]
}

fn lazy_test() {
    let lazy_value = Lazy::new(expensive_computation);
    println!("Lazy created but no computing");
    
    let value1 = lazy_value.get();
    println!("Get value: {:?}", value1);

    // Seccond call get cashed value
    let value2 = lazy_value.get();
    println!("Get cashed value: {:?}", value2);
}



pub struct MiddlewareChain<T> {
    handlers: Vec<Box<dyn Fn(T) -> MiddlewareResult<T>>>,
}

pub enum MiddlewareResult<T> {
    Continue(T),
    Stop(T),
    Error(String),
}

impl<T> MiddlewareChain<T> {
    pub fn new() -> Self {
        Self {
            handlers: Vec::new(),
        }
    }
    
    // Add middleware via FnOnce, what give borrow context
    pub fn add<F>(mut self, handler: F) -> Self
    where
        F: Fn(T) -> MiddlewareResult<T> + 'static
    {
        self.handlers.push(Box::new(handler));
        self
    }
    
    pub fn execute(&self, mut value: T) -> Result<T, String> {
        for handler in &self.handlers {
            match handler(value) {
                MiddlewareResult::Continue(v) => value = v,
                MiddlewareResult::Stop(v) => return Ok(v),
                MiddlewareResult::Error(e) => return Err(e),
            }
        }
        Ok(value)
    }
}

// fn create_http_middleware() -> MiddlewareChain<HttpRequest> {
//     let rate_limiter = RateLimiter::new();
//     let authenticator = Authenticator::new();
    
//     MiddlewareChain::new()
//         .add(move |req| {
//             if rate_limiter.check(&req) {
//                 MiddlewareResult::Continue(req)
//             } else {
//                 MiddlewareResult::Error("Rate limit exceeded".to_string())
//             }
//         })
//         .add(move |mut req| {
//             if let Some(token) = authenticator.get_token() {
//                 req.headers.push(("Authorization".to_string(), token));
//                 MiddlewareResult::Continue(req)
//             } else {
//                 MiddlewareResult::Error("Authentication failed".to_string())
//             }
//         })
//         .add(|req| {
//             println!("Processing request to: {}", req.url);
//             MiddlewareResult::Continue(req)
//         })
// }


use std::time::Duration;

pub struct RetryConfig<F>
where
    F: Fn(usize) -> Option<Duration>
{
    max_attempts: usize,
    backoff_strategy: F,
}

impl<F> RetryConfig<F>
where
    F: Fn(usize) -> Option<Duration>
{
    pub fn new(max_attempts: usize, backoff_strategy: F) -> Self {
        Self {
            max_attempts,
            backoff_strategy,
        }
    }
    
    // Execute operation retry logic
    pub async fn execute<T, E, Op>(&self, mut operation: Op) -> Result<T, E>
    where
        Op: FnMut() -> Result<T, E>,
    {
        let mut attempt = 0;
        
        loop {
            attempt += 1;
            
            match operation() {
                Ok(result) => return Ok(result),
                Err(e) if attempt >= self.max_attempts => return Err(e),
                Err(_) => {
                    // Call backoff_strategy, for check how long waiting
                    if let Some(delay) = (self.backoff_strategy)(attempt) {
                        tokio::time::sleep(delay).await;
                    } else {
                        // if strategy return None, stop attemp
                        break;
                    }
                }
            }
        }
        
        // if here return last Err
        operation()
    }
}

async fn example_with_different_strategies() {
    // Exonetly backoff
    let exponential_config = RetryConfig::new(5, |attempt| {
        Some(Duration::from_millis(100 * 2_u64.pow(attempt as u32)))
    });
    
    // Lined backoff
    let linear_config = RetryConfig::new(3, |attempt| {
        Some(Duration::from_secs(attempt as u64))
    });
    
    // Fixed dealay with max
    let fixed_config = RetryConfig::new(10, |_attempt| {
        Some(Duration::from_secs(1))
    });
    
    // Retry without delay
    let immediate_config = RetryConfig::new(3, |_| None);
    
    // Custom strategy 
    // let result = exponential_config.execute(|| {

    //     make_network_request()
    // }).await;
}