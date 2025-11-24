use std::{
    collections::HashMap,
    sync::atomic::{AtomicU64, Ordering},
};

use serde_json::{Value, json};
use tokio::sync::{mpsc, oneshot};

use crate::{batching::batching_config::BatchConfig, error_handling::error_code::RpcError};

struct BatchTask {
    request_id: u64,
    method: String,
    params: Value,
    respond_to: oneshot::Sender<Result<Value, RpcError>>,
}

pub struct BatchedRpcClient {
    queue_sender: mpsc::Sender<BatchTask>,
    http_client: reqwest::Client,
    endpoint: String,
    config: BatchConfig,
    request_counter: AtomicU64,
}

impl BatchedRpcClient {
    pub fn new(endpoint: String, config: BatchConfig) -> Self {
        let (tx, rx) = mpsc::channel::<BatchTask>(config.channel_capacity);
        let http_client = reqwest::Client::new();

        let endpoint_clone = endpoint.clone();
        let http_clone = http_client.clone();
        let config_clone = config.clone();

        tokio::spawn(async move {
            Self::run_batch_processor(rx, http_clone, endpoint_clone, config_clone).await;
        });

        Self {
            queue_sender: tx,
            http_client,
            endpoint,
            config,
            request_counter: AtomicU64::new(0),
        }
    }

    async fn run_batch_processor(
        mut rx: mpsc::Receiver<BatchTask>,
        client: reqwest::Client,
        endpoint: String,
        config: BatchConfig,
    ) {
        let mut buffer: Vec<BatchTask> = Vec::with_capacity(config.max_batch_size);
        let mut interval = tokio::time::interval(config.max_wait_time);

        loop {
            tokio::select! {
                Some(task) = rx.recv() => {
                    buffer.push(task);

                    if buffer.len() >= config.max_batch_size {
                        let current_batch = std::mem::replace(&mut buffer, Vec::with_capacity(config.max_batch_size));

                        let client_clone = client.clone();
                        let endpoint_clone = endpoint.clone();

                        tokio::spawn(async move {
                            Self::flush_batch(client_clone, endpoint_clone, current_batch).await;
                        });
                    }
                }

                _ = interval.tick() => {
                    if !buffer.is_empty() {
                        let current_banch = std::mem::replace(&mut buffer, Vec::with_capacity(config.max_batch_size));

                        let client_clone = client.clone();
                        let endpoint_clone = endpoint.clone();
                        
                        tokio::spawn(async move {
                            Self::flush_batch(client_clone, endpoint_clone, current_banch).await;
                        });
                    }
                }
            }
        }
    }

    async fn flush_batch(client: reqwest::Client, endpoint: String, tasks: Vec<BatchTask>) {
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
            "Sending batch request to Helius"
        );

        let response = client.post(&endpoint).json(&rpc_requests).send().await;

        match response {
            Ok(resp) => match resp.json::<Vec<serde_json::Value>>().await {
                Ok(responses) => {
                    for response_json in responses {
                        if let Some(id) = response_json.get("id").and_then(|v| v.as_u64())
                            && let Some(sender) = response_map.remove(&id) {
                                if let Some(error) = response_json.get("error") {
                                    let error_msg = error
                                        .get("message")
                                        .and_then(|m| m.as_str())
                                        .unwrap_or("Unknown RPC error");

                                    let _ = sender.send(Err(RpcError::RpcMethodFailed {
                                        method: "batch".to_string(),
                                        code: error
                                            .get("code")
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
                }
                Err(e) => {
                    tracing::error!(error = %e, "Failed to parse batch response");

                    for (_, sender) in response_map {
                        let _ = sender.send(Err(RpcError::InvalidResponse {
                            expected: "valid JSON array".to_string(),
                            got: format!("parse error: {}", e),
                        }));
                    }
                }
            },
            Err(e) => {
                tracing::error!(error = %e, "Network error during batch request");
                for (_, sender) in response_map {
                    let _ = sender.send(Err(RpcError::ConnectionFailed {
                        endpoint: endpoint.clone(),
                        reason: e.to_string(),
                    }));
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
                endpoint: self.endpoint.clone(),
                reason: "Batch queue is closed".to_string(),
            })?;

        rx.await.map_err(|_| RpcError::ConnectionFailed {
            endpoint: self.endpoint.clone(),
            reason: "Response channel closed".to_string(),
        })?
    }
}
