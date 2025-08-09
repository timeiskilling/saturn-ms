// use futures::{SinkExt as _, StreamExt};
// use serde::{Deserialize, Serialize};
// use std::{collections::HashMap, sync::Arc, time::Duration};
// use tokio::sync::RwLock;
// use tokio_tungstenite::{connect_async, tungstenite::Message};

// #[derive(Debug, Serialize, Deserialize)]
// pub struct JitoResponse {
//     pub time: String,
//     pub landed_tips_25th_percentile: f64,
//     pub landed_tips_50th_percentile: f64,
//     pub landed_tips_75th_percentile: f64,
//     pub landed_tips_95th_percentile: f64,
//     pub landed_tips_99th_percentile: f64,
//     pub ema_landed_tips_50th_percentile: f64,
// }

// pub struct TipManager {
//     jito_tip: Arc<RwLock<HashMap<String, f64>>>,
// }

// impl TipManager {
//     pub fn new() -> Self {
//         Self {
//             jito_tip: Arc::new(RwLock::new(HashMap::new())),
//         }
//     }

//     pub async fn run_jito_tip_listener(&self) {
//         let url = format!("wss://bundles.jito.wtf/api/v1/bundles/tip_stream");
//         let mut tip_write = self.jito_tip.write().await;

//         loop {
//             match connect_async(&url).await {
//                 Ok((ws_steam, _)) => {
//                     tracing::info!("Successfully connected to Jito tip Websocket");

//                     let (mut write, mut read) = ws_steam.split();

//                     while let Some(msg) = read.next().await {
//                         match msg {
//                             Ok(Message::Text(text)) => {
//                                 if let Ok(parsed) = serde_json::from_str::<Vec<JitoResponse>>(&text)
//                                 {
//                                     for jito_data in parsed {
//                                         tip_write.insert(
//                                             "tip".to_string(),
//                                             jito_data.landed_tips_99th_percentile,
//                                         );
//                                     }
//                                 } else {
//                                     tracing::warn!("Failed to parse JSON from JITO : {}", text);
//                                 }
//                             }

//                             Ok(Message::Ping(data)) => {
//                                 tracing::debug!("Received Ping, sending Pong back.");
//                                 if write.send(Message::Pong(data)).await.is_err() {
//                                     break;
//                                 }
//                             }
//                             Err(e) => {
//                                 tracing::error!("Error reading from JITO WebSocket: {:?}", e);
//                                 break;
//                             }
//                             _ => {}
//                         }
//                     }
//                     tracing::warn!("Disconnected from JITO WebSocket. Reconnecting...");
//                 }

//                 Err(e) => {
//                     tracing::error!("Failed to connect to JITO WebSocket: {:?}", e);
//                 }
//             }
//             tokio::time::sleep(Duration::from_secs(10)).await;
//         }
//     }

//     pub async fn get_price(&self) -> Option<f64> {
//         let tip = self.jito_tip.read().await;
//         tip.get("tip").cloned()
//     }
// }
