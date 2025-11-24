use axum::{
    Router,
    extract::{Json, State},
    routing::post,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{collections::HashMap, net::SocketAddr, sync::Arc, time::Duration};
use tokio::sync::{mpsc, oneshot};

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "method", content = "params", rename_all = "camelCase")]
enum RpcMethod {
    GetTokenAccountsByOwnerV2(TokenAccountsParams),
}

struct BatchJob {
    request: RpcMethod,
    respond_to: oneshot::Sender<Result<Value, String>>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct UserRequest {
    owner: String,
}

#[derive(Serialize, Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TokenAccountsParams {
    owner_address: String,
    page: u64,
    limit: u64,
    display_options: DisplayOptions,
}

#[derive(Serialize, Clone, Debug, Deserialize)]
struct DisplayOptions {
    show_zero_balance: bool,
}

#[derive(Deserialize, Debug)]
struct RpcResponse {
    id: u64,
    result: Option<Value>,
    error: Option<Value>,
}

#[derive(Clone)]
struct AppState {
    queue_sender: mpsc::Sender<BatchJob>,
}

async fn get_tokens_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UserRequest>,
) -> Json<Value> {
    let (tx, rx) = oneshot::channel();

    let method = RpcMethod::GetTokenAccountsByOwnerV2(TokenAccountsParams {
        owner_address: payload.owner,
        page: 1,
        limit: 100,
        display_options: DisplayOptions {
            show_zero_balance: true,
        },
    });

    let job = BatchJob {
        request: method,
        respond_to: tx,
    };

    if state.queue_sender.send(job).await.is_err() {
        return Json(json!({ "error": "Server is too busy" }));
    }

    match rx.await {
        Ok(Ok(json_value)) => Json(json!({ "status": "ok", "data": json_value })),
        Ok(Err(e)) => Json(json!({ "status": "error", "message": e })),
        Err(_) => Json(json!({ "error": "Internal channel closed" })),
    }
}

async fn run_batcher(mut rx: mpsc::Receiver<BatchJob>) {
    let client = reqwest::Client::new();
    let api_key = "YOUR_API_KEY";
    let helius_url = format!("https://mainnet.helius-rpc.com/?api-key={}", api_key); // Arc<String> якщо URL довгий

    let mut buffer: Vec<BatchJob> = Vec::with_capacity(100);
    let mut interval = tokio::time::interval(Duration::from_millis(50));

    loop {
        tokio::select! {
            Some(job) = rx.recv() => {
                buffer.push(job);
                if buffer.len() >= 100 {
                    // Drain changed to swap, for give ownership in spawn
                    let current_batch = std::mem::replace(&mut buffer, Vec::with_capacity(100));

                    let client_clone = client.clone();
                    let url_clone = helius_url.clone();

                    tokio::spawn(async move {
                        flush_batch(client_clone, url_clone, current_batch).await;
                    });
                }
            }
            _ = interval.tick() => {
                if !buffer.is_empty() {
                    let current_batch = std::mem::replace(&mut buffer, Vec::with_capacity(100));
                    let client_clone = client.clone();
                    let url_clone = helius_url.clone();

                    tokio::spawn(async move {
                        flush_batch(client_clone, url_clone, current_batch).await;
                    });
                }
            }
        }
    }
}

async fn flush_batch(client: reqwest::Client, url: String, jobs: Vec<BatchJob>) {
    if jobs.is_empty() {
        return;
    }

    let mut rpc_requests = Vec::with_capacity(jobs.len());
    let mut response_map = HashMap::new();

    for (index, job) in jobs.into_iter().enumerate() {
        let req_id = index as u64;
        response_map.insert(req_id, job.respond_to);

        let method_json = serde_json::to_value(&job.request).unwrap();

        rpc_requests.push(json!({
            "jsonrpc": "2.0",
            "id": req_id,
            "method": method_json["method"],
            "params": method_json["params"]
        }));
    }

    let resp = client.post(&url).json(&rpc_requests).send().await;

    match resp {
        Ok(r) => {
            let results: Result<Vec<RpcResponse>, _> = r.json().await;

            match results {
                Ok(responses) => {
                    for response in responses {
                        if let Some(sender) = response_map.remove(&response.id) {
                            if let Some(result_val) = response.result {
                                let _ = sender.send(Ok(result_val));
                            } else {
                                let err_msg = response
                                    .error
                                    .map(|e| e.to_string())
                                    .unwrap_or_else(|| "Unknown RPC error".to_string());
                                let _ = sender.send(Err(err_msg));
                            }
                        }
                    }
                }
                Err(e) => {
                    for (_, sender) in response_map {
                        let _ = sender.send(Err(format!("Failed to parse batch response: {}", e)));
                    }
                    return;
                }
            }
        }
        Err(e) => {
            for (_, sender) in response_map {
                let _ = sender.send(Err(format!("Network error: {}", e)));
            }
            return;
        }
    }

    for (_, sender) in response_map {
        let _ = sender.send(Err("No response from RPC for this ID".to_string()));
    }
}

#[tokio::main]
async fn main() {
    let (tx, rx) = mpsc::channel::<BatchJob>(10000);

    tokio::spawn(async move {
        run_batcher(rx).await;
    });

    let state = Arc::new(AppState { queue_sender: tx });

    let app = Router::new()
        .route("/tokens", post(get_tokens_handler))
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
