#![cfg(not(target_arch = "wasm32"))]

use std::{
    collections::HashMap,
    sync::{Arc, atomic::{AtomicU64, Ordering}},
};

use serde_json::{Value, json};
use tokio::sync::{mpsc, oneshot};

use crate::{
    batching::batching_config::BatchConfig, 
    error_handling::error_code::RpcError, 
    rpc_layer::{managed_rpc_client::{HttpTransport, ManagedHttpTransport}, rpc_provider::ManagedRpcClient},
};

struct BatchTask {
    request_id: u64,
    method: String,
    params: Value,
    respond_to: oneshot::Sender<Result<Value, RpcError>>,
}

pub struct BatchedRpcClient {
    queue_sender: mpsc::Sender<BatchTask>,
    transport: Arc<dyn HttpTransport>,
    config: BatchConfig,
    request_counter: AtomicU64,
}

impl BatchedRpcClient {
    pub fn new_with_managed_transport(
        managed_client: Arc<ManagedRpcClient>,
        config: BatchConfig,
    ) -> Self {
        let transport = Arc::new(ManagedHttpTransport::new(managed_client));
        Self::new_with_transport(transport, config)
    }

    pub fn new_with_transport(
        transport: Arc<dyn HttpTransport>,
        config: BatchConfig,
    ) -> Self {
        let (tx, rx) = mpsc::channel::<BatchTask>(config.channel_capacity);
        
        let transport_clone = transport.clone();
        let config_clone = config.clone();
        
        tokio::spawn(async move {
            Self::run_batch_processor(rx, transport_clone, config_clone).await;
        });
        
        Self {
            queue_sender: tx,
            transport,
            config,
            request_counter: AtomicU64::new(0),
        }
    }

    async fn run_batch_processor(
        mut rx: mpsc::Receiver<BatchTask>,
        transport: Arc<dyn HttpTransport>,
        config: BatchConfig,
    ) {
        let mut buffer: Vec<BatchTask> = Vec::with_capacity(config.max_batch_size);
        let mut interval = tokio::time::interval(config.max_wait_time);
        
        loop {
            tokio::select! {
                Some(task) = rx.recv() => {
                    buffer.push(task);
                    
                    if buffer.len() >= config.max_batch_size {
                        let current_batch = std::mem::replace(
                            &mut buffer, 
                            Vec::with_capacity(config.max_batch_size)
                        );
                        
                        let transport_clone = transport.clone();
                        
                        tokio::spawn(async move {
                            Self::flush_batch(transport_clone, current_batch).await;
                        });
                    }
                }
                
                _ = interval.tick() => {
                    if !buffer.is_empty() {
                        let current_batch = std::mem::replace(
                            &mut buffer, 
                            Vec::with_capacity(config.max_batch_size)
                        );
                        
                        let transport_clone = transport.clone();
                        
                        tokio::spawn(async move {
                            Self::flush_batch(transport_clone, current_batch).await;
                        });
                    }
                }
            }
        }
    }

    async fn flush_batch(
        transport: Arc<dyn HttpTransport>,
        tasks: Vec<BatchTask>,
    ) {
        if tasks.is_empty() {
            return;
        }
        
        let mut response_map: HashMap<u64, oneshot::Sender<Result<Value, RpcError>>> = 
            HashMap::with_capacity(tasks.len());
        
        let mut rpc_requests = Vec::with_capacity(tasks.len());
        
        for task in tasks {
            response_map.insert(task.request_id, task.respond_to);
            
            rpc_requests.push(json!({
                "jsonrpc": "2.0",
                "id": task.request_id,
                "method": task.method,
                "params": task.params,
            }));
        }
        
        tracing::debug!(
            batch_size = rpc_requests.len(),
            "Sending batch request through managed transport"
        );
        
        let batch_request = json!(rpc_requests);
        
        match transport.execute_json_rpc_request(batch_request).await {
            Ok(response_value) => {
                if let Some(responses) = response_value.as_array() {
                    for response_json in responses {
                        if let Some(id) = response_json.get("id").and_then(|v| v.as_u64())
                            && let Some(sender) = response_map.remove(&id) {
                                if let Some(error) = response_json.get("error") {
                                    let error_msg = error.get("message")
                                        .and_then(|m| m.as_str())
                                        .unwrap_or("Unknown RPC error");
                                    
                                    let _ = sender.send(Err(RpcError::RpcMethodFailed {
                                        method: "batch".to_string(),
                                        code: error.get("code")
                                            .and_then(|c| c.as_i64())
                                            .unwrap_or(-1),
                                        message: error_msg.to_string(),
                                    }));
                                } else if let Some(result) = response_json.get("result") {
                                    let _ = sender.send(Ok(result.clone()));
                                } else {
                                    let _ = sender.send(Err(RpcError::InvalidResponse {
                                        expected: "result or error field".to_string(),
                                        got: response_json.to_string(),
                                    }));
                                }
                            }
                    }
                    
                    for (_, sender) in response_map {
                        let _ = sender.send(Err(RpcError::InvalidResponse {
                            expected: "response for request ID".to_string(),
                            got: "missing response".to_string(),
                        }));
                    }
                } else {
                    for (_, sender) in response_map {
                        let _ = sender.send(Err(RpcError::InvalidResponse {
                            expected: "JSON array".to_string(),
                            got: response_value.to_string(),
                        }));
                    }
                }
            }
            Err(e) => {
                tracing::error!(error = ?e, "Batch request failed after retries");
                
                for (_, sender) in response_map {
                    let _ = sender.send(Err(e.clone()));
                }
            }
        }
    }

    pub async fn execute_batched_request(
        &self,
        method: &str,
        params: Value,
    ) -> Result<Value, RpcError> {
        let request_id = self.request_counter.fetch_add(1, Ordering::Relaxed);
        let (tx, rx) = oneshot::channel();
        
        let task = BatchTask {
            request_id,
            method: method.to_string(),
            params,
            respond_to: tx,
        };
        
        self.queue_sender
            .send(task)
            .await
            .map_err(|_| RpcError::ConnectionFailed {
                endpoint: "batch_queue".to_string(),
                reason: "Batch queue is closed".to_string(),
            })?;
        
        rx.await.map_err(|_| RpcError::ConnectionFailed {
            endpoint: "batch_queue".to_string(),
            reason: "Response channel closed".to_string(),
        })?
    }
    
    pub async fn execute_request(
        &self,
        method: &str,
        params: Value,
    ) -> Result<Value, RpcError> {
        let request_id = self.request_counter.fetch_add(1, Ordering::Relaxed);
        
        let rpc_request = json!({
            "jsonrpc": "2.0",
            "id": request_id,
            "method": method,
            "params": params,
        });
        
        let response_value = self.transport
            .execute_json_rpc_request(rpc_request)
            .await?;
        
        if let Some(error) = response_value.get("error") {
            let error_msg = error
                .get("message")
                .and_then(|m| m.as_str())
                .unwrap_or("Unknown RPC error");
            
            let code = error
                .get("code")
                .and_then(|c| c.as_i64())
                .unwrap_or(-1);
            
            return Err(RpcError::RpcMethodFailed {
                method: method.to_string(),
                code,
                message: error_msg.to_string(),
            });
        }
        
        if let Some(result) = response_value.get("result") {
            return Ok(result.clone());
        }
        
        Err(RpcError::InvalidResponse {
            expected: "result or error field".to_string(),
            got: response_value.to_string(),
        })
    }
}