pub mod handlers;
use std::{collections::HashMap, collections::HashSet, sync::Arc, time::Duration};

use axum::{extract::ws::WebSocket, routing::get, Router};
use common::models::DayTickerEvent;
use futures::{SinkExt, StreamExt};

use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;
use tokio_tungstenite::{connect_async, tungstenite::Message};
use tower_http::cors::{self, CorsLayer};
use tracing_subscriber::fmt::format::FmtSpan;

use crate::handlers::websocket_handler;

type SharedPriceState = Arc<Mutex<HashMap<String, DayTickerEvent>>>;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .with_span_events(FmtSpan::CLOSE)
        .init();

    println!("Starting ant_interface server...");
    let cors_layer = CorsLayer::new()
        .allow_origin(cors::Any)
        .allow_headers(cors::Any)
        .allow_methods(cors::Any);

    println!("CORS layer configured");
    let state = Arc::new(PriceManager::new());

    tokio::spawn(run_binance_ws_listener(state.clone()));

    let router = Router::new()
        .route("/ws/prices_v2", get(websocket_handler))
        .layer(cors_layer)
        .with_state(Arc::clone(&state));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();

    axum::serve(listener, router).await.unwrap();
}


pub struct PriceManager {
    http_client: reqwest::Client,
    shared_price_state: SharedPriceState,
}

impl PriceManager {
    fn new() -> Self {
        let http_client = reqwest::Client::builder().build().unwrap();
        Self {
            http_client,
            shared_price_state: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[derive(Deserialize, Debug)]
pub struct StreamWrapper<T> {
    pub stream: String,
    pub data: T,
}

#[derive(Serialize, Clone)]
struct SimplifiedPrice {
    price: String,
    change_percent: String,
    image_url: String,
    market_cap_rank: Option<u32>,
    coin_name: String,
}

#[derive(Deserialize, Debug)]
struct ExchangeInfo {
    symbols: Vec<SymbolInfo>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct SymbolInfo {
    symbol: String,
    status: String,
}

#[derive(Deserialize, Debug)]
struct CoinGeckoCoin {
    symbol: String,
    name: String,
    image: String,
    market_cap_rank: Option<u32>,
}

#[derive(Clone, Debug)]
struct CoinInfo {
    name: String,
    image_url: String,
    market_cap_rank: Option<u32>,
}

async fn get_top_coins_by_market_cap(
    state: Arc<PriceManager>,
) -> Result<(Vec<String>, HashMap<String, CoinInfo>), Box<dyn std::error::Error + Send + Sync>> {
    let binance_symbols: HashSet<String> = get_trading_usdt_pairs(state.clone())
        .await?
        .into_iter()
        .collect();

    tracing::info!(
        "Found {} tradable USDT pairs on Binance",
        binance_symbols.len()
    );

    tracing::info!("Requesting top coins by market cap from CoinGecko");

    let url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&category=solana-ecosystem&price_change_percentage=1h%2C24h%2C7d";

    let response = state
        .http_client
        .get(url)
        .header("Accept", "application/json")
        .header("User-Agent", "saturn-bot/1.0")
        .send()
        .await?;

    if !response.status().is_success() {
        tracing::error!("Error in CoinGecko API request");
        return Err(format!(
            "CoinGecko API request failed with status: {}",
            response.status()
        )
        .into());
    }

    let coingecko_coins: Vec<CoinGeckoCoin> = response.json().await?;

    let mut top_symbols = Vec::with_capacity(20);
    let mut coin_info_map = HashMap::new();

    for coin in coingecko_coins {
        let binance_symbol = format!("{}USDT", coin.symbol.to_uppercase());

        if binance_symbols.contains(&binance_symbol) {
            let coin_info = CoinInfo {
                name: coin.name,
                image_url: coin.image,
                market_cap_rank: coin.market_cap_rank,
            };

            coin_info_map.insert(binance_symbol.clone(), coin_info);
            top_symbols.push(binance_symbol);

            if top_symbols.len() >= 20 {
                break;
            }
        }
    }

    if !top_symbols.is_empty() {
        let first_few: Vec<&String> = top_symbols.iter().take(10).collect();
        tracing::info!("First 10 symbols by market cap: {:?}", first_few);
    }

    tracing::info!(
        "Selected top {} tradable symbols by market cap",
        top_symbols.len()
    );

    Ok((top_symbols, coin_info_map))
}

async fn get_top_coins_from_binance_fallback(
    state: Arc<PriceManager>,
) -> Result<(Vec<String>, HashMap<String, CoinInfo>), Box<dyn std::error::Error + Send + Sync>> {
    let trading_symbols: HashSet<String> = get_trading_usdt_pairs(state.clone())
        .await?
        .into_iter()
        .collect();

    tracing::warn!("Using Binance fallback (sorting by volume instead of market cap)");

    let url = "https://api.binance.com/api/v3/ticker/24hr";

    let response = state
        .http_client
        .get(url)
        .header("Accept", "application/json")
        .send()
        .await?;

    if !response.status().is_success() {
        return Err(format!(
            "Binance API request failed with status: {}",
            response.status()
        )
        .into());
    }

    #[derive(Deserialize)]
    struct BinanceTicker {
        symbol: String,
        #[serde(rename = "quoteVolume")]
        quote_volume: String,
    }

    let all_tickers: Vec<BinanceTicker> = response.json().await?;

    let mut tradable_with_volume: Vec<(String, f64)> = Vec::with_capacity(all_tickers.len());

    for ticker in all_tickers {
        if trading_symbols.contains(&ticker.symbol) {
            let volume = ticker.quote_volume.parse::<f64>().unwrap_or(0.0);
            tradable_with_volume.push((ticker.symbol, volume));
        }
    }

    tradable_with_volume.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

    let mut top_symbols = Vec::new();
    let mut coin_info_map = HashMap::new();

    for (symbol, _) in tradable_with_volume.into_iter().take(20) {
        let base_asset = symbol.trim_end_matches("USDT");

        let coin_info = CoinInfo {
            name: base_asset.to_string(),
            image_url: format!(
                "https://img.logokit.com/crypto/{}?token=pk_fr7aca0f83dcb0e28722cf",
                base_asset
            ),
            market_cap_rank: None,
        };

        coin_info_map.insert(symbol.clone(), coin_info);
        top_symbols.push(symbol);
    }

    Ok((top_symbols, coin_info_map))
}

async fn get_trading_usdt_pairs(
    state: Arc<PriceManager>,
) -> Result<Vec<String>, Box<dyn std::error::Error + Send + Sync>> {
    let url = "https://api.binance.com/api/v3/exchangeInfo";

    let response = state
        .http_client
        .get(url)
        .header("Accept", "application/json")
        .send()
        .await?
        .json::<ExchangeInfo>()
        .await?;

    let trading_pairs: Vec<String> = response
        .symbols
        .into_iter()
        .filter(|s| s.status == "TRADING" && s.symbol.ends_with("USDT"))
        .map(|s| s.symbol)
        .collect();

    Ok(trading_pairs)
}

async fn get_filtered_streams(
    state: Arc<PriceManager>,
) -> Result<(String, HashMap<String, CoinInfo>), Box<dyn std::error::Error + Send + Sync>> {
    let (trading_pairs, coin_info_map) = match get_top_coins_by_market_cap(state.clone()).await {
        Ok((pairs, info)) => {
            tracing::info!(
                "Successfully got {} coins sorted by market cap",
                pairs.len()
            );
            (pairs, info)
        }
        Err(e) => {
            tracing::warn!("Failed to get coins by market cap: {}, using fallback", e);

            get_top_coins_from_binance_fallback(state.clone()).await?
        }
    };

    let filtered_streams: Vec<String> = trading_pairs
        .into_iter()
        .map(|symbol| format!("{}@ticker", symbol.to_lowercase()))
        .collect();

    tracing::info!("Created {} filtered streams", filtered_streams.len());

    Ok((filtered_streams.join("/"), coin_info_map))
}

async fn run_binance_ws_listener(state: Arc<PriceManager>) {
    loop {
        let (filtered_stream, _coin_info_map) = match get_filtered_streams(state.clone()).await {
            Ok((stream, info)) => (stream, info),
            Err(e) => {
                tracing::error!(
                    "Failed to get filtered streams, will retry in 10 seconds: {}",
                    e
                );
                tokio::time::sleep(Duration::from_secs(10)).await;
                continue;
            }
        };

        if filtered_stream.is_empty() {
            tracing::warn!("Got an empty list of streams, will retry in 30 seconds.");
            tokio::time::sleep(Duration::from_secs(30)).await;
            continue;
        }

        let url = format!(
            "wss://stream.binance.com:9443/stream?streams={}",
            filtered_stream
        );

        match connect_async(&url).await {
            Ok((ws_stream, _)) => {
                tracing::info!("Successfully connected to Binance WebSocket");
                let (mut write, mut read) = ws_stream.split();

                while let Some(msg) = read.next().await {
                    match msg {
                        Ok(Message::Text(text)) => {
                            if let Ok(parsed) =
                                serde_json::from_str::<StreamWrapper<DayTickerEvent>>(&text)
                            {
                                let ticker_data = parsed.data;
                                let mut prices = state.shared_price_state.lock().await;
                                prices.insert(ticker_data.symbol.clone(), ticker_data);
                            } else {
                                tracing::warn!("Failed to parse JSON from Binance: {}", text);
                            }
                        }
                        Ok(Message::Ping(data)) => {
                            tracing::info!("Received Ping, sending Pong back.");
                            if write.send(Message::Pong(data)).await.is_err() {
                                break;
                            }
                        }
                        Err(e) => {
                            tracing::error!("Error reading from Binance WebSocket: {:?}", e);
                            break;
                        }
                        _ => {}
                    }
                }
                tracing::warn!("Disconnected from Binance WebSocket. Reconnecting...");
            }
            Err(e) => {
                tracing::error!("Failed to connect to Binance WebSocket: {:?}", e);
            }
        }
        tokio::time::sleep(Duration::from_secs(2)).await;
    }
}

async fn handle_websocket(mut socket: WebSocket, state: Arc<PriceManager>) {
    use axum::extract::ws::Message as AxumMessage;
    tracing::info!("new client WebSocket connect");
    let mut interval = tokio::time::interval(Duration::from_secs(2));

    let coin_info_map = match get_filtered_streams(state.clone()).await {
        Ok((_streams, info)) => info,
        Err(e) => {
            tracing::error!("Failed to get coin info: {}", e);
            HashMap::new()
        }
    };

    loop {
        interval.tick().await;

        let prices = {
            let prices_map = state.shared_price_state.lock().await;
            if prices_map.is_empty() {
                continue;
            }
            prices_map.clone()
        };

        let mut simplified_prices = std::collections::HashMap::new();

        for (symbol, ticker_data) in prices.iter() {
            let base_asset = symbol.trim_end_matches("USDT");

            let (image_url, market_cap_rank, coin_name) =
                if let Some(coin_info) = coin_info_map.get(symbol) {
                    (
                        coin_info.image_url.clone(),
                        coin_info.market_cap_rank,
                        coin_info.name.clone(),
                    )
                } else {
                    (
                        format!(
                            "https://img.logokit.com/crypto/{}?token=pk_fr7aca0f83dcb0e28722cf",
                            base_asset
                        ),
                        None,
                        base_asset.to_string(),
                    )
                };

            let simplified_data = SimplifiedPrice {
                price: ticker_data.current_close.clone(),
                change_percent: ticker_data.price_change_percent.clone(),
                image_url,
                market_cap_rank,
                coin_name,
            };

            simplified_prices.insert(symbol.clone(), simplified_data);
        }

        match serde_json::to_string(&simplified_prices) {
            Ok(json) => {
                if socket.send(AxumMessage::Text(json.into())).await.is_err() {
                    tracing::info!("Client send data to WebSocket");
                    break;
                }
            }
            Err(e) => {
                tracing::error!("Failed to serialize simplified prices: {}", e);
            }
        }
    }
}
