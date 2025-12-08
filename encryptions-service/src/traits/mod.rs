pub mod signer_wraper;

// use std::marker::PhantomData;

// pub trait ParallelProcessor: Sized {
//     type Item;

//     fn process_parallel<F>(&self, worker: F)
//     where
//         F: Fn(Self::Item) + Sync + Send;

//     fn par_map<F, R>(self, transform: F) -> ParMap<Self, F>
//     where
//         F: Fn(Self::Item) -> R + Sync + Send,
//         R: Send,
//     {
//         ParMap {
//             source: self,
//             transform,
//             _phantom: PhantomData,
//         }
//     }

//     fn par_filter<P>(self, predicate: P) -> ParFilter<Self, P>
//     where
//         P: Fn(&Self::Item) -> bool + Sync + Send,
//     {
//         ParFilter {
//             source: self,
//             predicate,
//         }
//     }

//     fn par_for_each<F>(self, operation: F)
//     where
//         F: Fn(Self::Item) + Sync + Send,
//     {
//         self.process_parallel(operation);
//     }

//     fn par_collect<C>(self) -> C
//     where
//         C: Default + Extend<Self::Item> + Send,
//         Self::Item: Send,
//     {
//         let result = std::sync::Mutex::new(C::default());

//         self.process_parallel(|item| {
//             result.lock().unwrap().extend(std::iter::once(item));
//         });

//         result.into_inner().unwrap()
//     }
// }

// pub struct ParMap<Source, F> {
//     source: Source,
//     transform: F,
//     _phantom: PhantomData<F>,
// }

// pub struct ParFilter<Source, P> {
//     source: Source,
//     predicate: P,
// }

// impl<T: Send + Clone> ParallelProcessor for Vec<T> {
//     type Item = T;

//     fn process_parallel<F>(&self, worker: F)
//     where
//         F: Fn(Self::Item) + Sync + Send,
//     {
//         for item in self.iter().cloned() {
//             worker(item);
//         }
//     }
// }

// impl<Source, F, R> ParallelProcessor for ParMap<Source, F>
// where
//     Source: ParallelProcessor,
//     F: Fn(Source::Item) -> R + Sync + Send + Clone,
//     R: Send + Clone,
// {
//     type Item = R;

//     fn process_parallel<Worker>(&self, worker: Worker)
//     where
//         Worker: Fn(Self::Item) + Sync + Send,
//     {
//         let transform = self.transform.clone();
//         self.source.process_parallel(move |item| {
//             let transformed = transform(item);
//             worker(transformed);
//         });
//     }
// }

// impl<Source, P> ParallelProcessor for ParFilter<Source, P>
// where
//     Source: ParallelProcessor,
//     P: Fn(&Source::Item) -> bool + Sync + Send + Clone,
//     Source::Item: Clone,
// {
//     type Item = Source::Item;

//     fn process_parallel<Worker>(&self, worker: Worker)
//     where
//         Worker: Fn(Self::Item) + Sync + Send,
//     {
//         let predicate = self.predicate.clone();
//         self.source.process_parallel(move |item| {
//             if predicate(&item) {
//                 worker(item);
//             }
//         });
//     }
// }

// fn example_parallel_processing() {
//     let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

//     let result: Vec<i32> = numbers
//         .par_filter(|&x| x % 2 == 0)
//         .par_map(|x| x * x)
//         .par_collect();

//     let type2: Vec<i32> = result.par_map(|x| x + 1).par_collect();
//     println!("Результат: {:?}", type2);
// }

// pub trait DataSource {
//     type Item;
//     type Error;

//     fn fetch_next(&mut self) -> Result<Option<Self::Item>, Self::Error>;
// }

// pub trait DataProcessor {
//     type Source: DataSource;

//     type Output;

//     fn process(
//         &mut self,
//         source: &mut Self::Source,
//     ) -> Result<Option<Self::Output>, <Self::Source as DataSource>::Error>;
// }

// pub trait ProcessingPipeline {
//     type Source: DataSource;
//     type FinalOutput;

//     fn execute(
//         &mut self,
//         source: &mut Self::Source,
//     ) -> Result<Vec<Self::FinalOutput>, <Self::Source as DataSource>::Error>;
// }

// pub struct DatabaseSource {
//     connection: String,
//     current_row: usize,
// }

// impl DataSource for DatabaseSource {
//     type Item = String;
//     type Error = String;

//     fn fetch_next(&mut self) -> Result<Option<Self::Item>, Self::Error> {
//         if self.current_row < 5 {
//             self.current_row += 1;
//             Ok(Some(format!("Рядок {}", self.current_row)))
//         } else {
//             Ok(None)
//         }
//     }
// }

// pub struct UppercaseProcessor;

// impl DataProcessor for UppercaseProcessor {
//     type Source = DatabaseSource;
//     type Output = String;

//     fn process(&mut self, source: &mut Self::Source) -> Result<Option<Self::Output>, String> {
//         match source.fetch_next()? {
//             Some(item) => Ok(Some(item.to_uppercase())),
//             None => Ok(None),
//         }
//     }
// }

// pub struct FilterProcessor<S: DataSource, P> {
//     predicate: P,
//     _phantom: PhantomData<S>,
// }

// impl<S, P> DataProcessor for FilterProcessor<S, P>
// where
//     S: DataSource,
//     P: Fn(&S::Item) -> bool,
// {
//     type Source = S;
//     type Output = S::Item;

//     fn process(&mut self, source: &mut Self::Source) -> Result<Option<Self::Output>, S::Error> {
//         loop {
//             match source.fetch_next()? {
//                 Some(item) if (self.predicate)(&item) => return Ok(Some(item)),
//                 Some(_) => continue,
//                 None => return Ok(None),
//             }
//         }
//     }
// }


// use std::cell::RefCell;

// pub struct Lazy<T, F>
// where
//     F: FnOnce() -> T,
// {
//     initializer: RefCell<Option<F>>,
//     value: RefCell<Option<T>>,
// }

// impl<T, F> Lazy<T, F>
// where
//     F: FnOnce() -> T,
// {
//     pub fn new(initializer: F) -> Self {
//         Self {
//             initializer: RefCell::new(Some(initializer)),
//             value: RefCell::new(None),
//         }
//     }

//     pub fn get(&self) -> &T {
//         if self.value.borrow().is_none() {
//             let init = self
//                 .initializer
//                 .borrow_mut()
//                 .take()
//                 .expect("Initializer was already called");

//             let computed_value = init();
//             *self.value.borrow_mut() = Some(computed_value);
//         }
//         // once_cell або std::sync::OnceLock
//         unsafe { self.value.as_ptr().as_ref().unwrap().as_ref().unwrap() }
//     }
// }

// fn expensive_computation() -> Vec<u8> {
//     println!("Виконую складні обчислення...");
//     vec![1, 2, 3, 4, 5]
// }

// fn lazy_test() {
//     let lazy_value = Lazy::new(expensive_computation);
//     println!("Lazy created but no computing");
    
//     let value1 = lazy_value.get();
//     println!("Get value: {:?}", value1);

//     // Seccond call get cashed value
//     let value2 = lazy_value.get();
//     println!("Get cashed value: {:?}", value2);
// }



// pub struct MiddlewareChain<T> {
//     handlers: Vec<Box<dyn Fn(T) -> MiddlewareResult<T>>>,
// }

// pub enum MiddlewareResult<T> {
//     Continue(T),
//     Stop(T),
//     Error(String),
// }

// impl<T> MiddlewareChain<T> {
//     pub fn new() -> Self {
//         Self {
//             handlers: Vec::new(),
//         }
//     }
    
//     // Add middleware via FnOnce, what give borrow context
//     pub fn add<F>(mut self, handler: F) -> Self
//     where
//         F: Fn(T) -> MiddlewareResult<T> + 'static
//     {
//         self.handlers.push(Box::new(handler));
//         self
//     }
    
//     pub fn execute(&self, mut value: T) -> Result<T, String> {
//         for handler in &self.handlers {
//             match handler(value) {
//                 MiddlewareResult::Continue(v) => value = v,
//                 MiddlewareResult::Stop(v) => return Ok(v),
//                 MiddlewareResult::Error(e) => return Err(e),
//             }
//         }
//         Ok(value)
//     }
// }

// // fn create_http_middleware() -> MiddlewareChain<HttpRequest> {
// //     let rate_limiter = RateLimiter::new();
// //     let authenticator = Authenticator::new();
    
// //     MiddlewareChain::new()
// //         .add(move |req| {
// //             if rate_limiter.check(&req) {
// //                 MiddlewareResult::Continue(req)
// //             } else {
// //                 MiddlewareResult::Error("Rate limit exceeded".to_string())
// //             }
// //         })
// //         .add(move |mut req| {
// //             if let Some(token) = authenticator.get_token() {
// //                 req.headers.push(("Authorization".to_string(), token));
// //                 MiddlewareResult::Continue(req)
// //             } else {
// //                 MiddlewareResult::Error("Authentication failed".to_string())
// //             }
// //         })
// //         .add(|req| {
// //             println!("Processing request to: {}", req.url);
// //             MiddlewareResult::Continue(req)
// //         })
// // }


// use std::time::Duration;

// struct RetryConfig<F>
// where
//     F: Fn(usize) -> Option<Duration>
// {
//     max_attempts: usize,
//     backoff_strategy: F,
// }

// impl<F> RetryConfig<F>
// where
//     F: Fn(usize) -> Option<Duration>
// {
//     pub fn new(max_attempts: usize, backoff_strategy: F) -> Self {
//         Self {
//             max_attempts,
//             backoff_strategy,
//         }
//     }
    
//     // Execute operation retry logic
//     pub async fn execute<T, E, Op>(&self, mut operation: Op) -> Result<T, E>
//     where
//         Op: FnMut() -> Result<T, E>,
//     {
//         let mut attempt = 0;
        
//         loop {
//             attempt += 1;
            
//             match operation() {
//                 Ok(result) => return Ok(result),
//                 Err(e) if attempt >= self.max_attempts => return Err(e),
//                 Err(_) => {
//                     // Call backoff_strategy, for check how long waiting
//                     if let Some(delay) = (self.backoff_strategy)(attempt) {
//                         tokio::time::sleep(delay).await;
//                     } else {
//                         // if strategy return None, stop attemp
//                         break;
//                     }
//                 }
//             }
//         }
        
//         // if here return last Err
//         operation()
//     }
// }

// async fn example_with_different_strategies() {
//     // Exonetly backoff
//     let exponential_config = RetryConfig::new(5, |attempt| {
//         Some(Duration::from_millis(100 * 2_u64.pow(attempt as u32)))
//     });
    
//     // Lined backoff
//     let linear_config = RetryConfig::new(3, |attempt| {
//         Some(Duration::from_secs(attempt as u64))
//     });
    
//     // Fixed dealay with max
//     let fixed_config = RetryConfig::new(10, |_attempt| {
//         Some(Duration::from_secs(1))
//     });
    
//     // Retry without delay
//     let immediate_config = RetryConfig::new(3, |_| None);
    
//     // Custom strategy 
//     // let result = exponential_config.execute(|| {

//     //     make_network_request()
//     // }).await;
// }