use jupiter_trader_data::models::jupiter_models::{
    JupiterQuoteResponse, JupiterSwapInstructionsRsponse, JupiterSwapRequest, PriorityLevel,
};
use rand::seq::IndexedRandom;
use redis::AsyncCommands;
use solana_sdk::pubkey::Pubkey;
use std::collections::HashMap;
use std::fs::File;
use std::io::Write;
use std::str::FromStr;
use std::sync::Arc;
use tokio::signal;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .init();

    let client = redis::Client::open("redis://127.0.0.1:6381")?;
    let connect = client.get_multiplexed_tokio_connection().await?;
    let connect = Arc::new(Mutex::new(connect));

    let coins1 = [
        "So11111111111111111111111111111111111111112".to_string(),
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v".to_string(),
        "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB".to_string(),
        "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv".to_string(),
        "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs".to_string(),
        "9xzF5pmvWcEhmCCnuXKXttdF6HfQFy5V246v34SFpump".to_string(),
        "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN".to_string(),
        "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263".to_string(),
        "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4".to_string(),
        // "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij".to_string(),
        // "9tqjeRS1swj36Ee5C1iGiwAxjQJNGAVCzaTLwFY8bonk".to_string(),
        // "BFgdzMkTPdKKJeTipv2njtDEwhKxkgFueJQfJGt1jups".to_string(),
    ];

    let mut rng = rand::rng();
    let mut interval = tokio::time::interval(std::time::Duration::from_secs(2));

    let tracker = JupiterTracker {
        http_client: reqwest::Client::builder().build().unwrap(),
        jupiter_base_url: "https://lite-api.jup.ag/swap/v1".to_string(),
    };
    let pubkey = Pubkey::from_str("jdocuPgEAjMfihABsPgKEvYtsmMzjUHeq9LX4Hvs7f3").unwrap();
    let redis_hash_key = "alt_usage_counts";

    let connect_clone = connect.clone();
    let redis_hash_key_clone = redis_hash_key.to_string();

    tokio::spawn(async move {
        signal::ctrl_c().await.expect("Failed to listen for ctrl-c");

        if let Err(e) = export_redis_data_to_file(&connect_clone, &redis_hash_key_clone).await {
            eprintln!("Err by export data: {}", e);
        }

        std::process::exit(0);
    });

    loop {
        interval.tick().await;
        let random1 = coins1.choose(&mut rng).unwrap();
        let random2 = coins1.choose(&mut rng).unwrap();

        if random1 == random2 {
            continue;
        }
        let random_amount: u32 = rand::Rng::random_range(&mut rng, ..=50000);
        let amount = round_up(random_amount, 1000);

        let random_slipage: u16 = rand::Rng::random_range(&mut rng, 10..=100);
        let slipage: u16 = round_up(random_slipage.into(), 10).try_into().unwrap();

        let quote_response = match tracker
            .get_quote(random1, random2, amount.into(), slipage)
            .await
        {
            Ok(quote) => quote,
            Err(e) => {
                eprintln!("Failed to get quote: {}. Skipping this iteration.", e);
                continue;
            }
        };

        println!("WE HAVE QUOTE {}", quote_response.in_amount);
        let instruction: Vec<String> = match tracker
            .create_swap_transaction(quote_response, &pubkey)
            .await
        {
            Ok(instr) => {
                tracing::info!("ALL OK");
                instr
            }
            Err(e) => {
                eprintln!(
                    "Failed to create swap instruction: {}. Quote likely expired. Skipping.",
                    e
                );
                continue;
            }
        };

        let pubkeys = match fetch_address_lookup_tables(&instruction).await {
            Ok(keys) => keys,
            Err(e) => {
                eprintln!("Failed to fetch address lookup tables: {}. Skipping.", e);
                continue;
            }
        };

        let mut connect_guard = connect.lock().await;
        let mut pipe = redis::pipe();
        pipe.atomic();

        for pk in pubkeys {
            let field = pk.to_string();
            pipe.hincr(redis_hash_key, field, 1);
        }

        pipe.query_async::<Vec<u32>>(&mut *connect_guard)
            .await
            .unwrap();

        drop(connect_guard);
    }
}

async fn export_redis_data_to_file(
    connect: &Arc<Mutex<redis::aio::MultiplexedConnection>>,
    hash_key: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let mut connect_guard = connect.lock().await;

    let data: HashMap<String, u32> = connect_guard.hgetall(hash_key).await?;
    drop(connect_guard);

    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
    let filename = format!("alt_usage_counts_{}.txt", timestamp);
    let mut file = File::create(&filename)?;

    writeln!(file, "Address Lookup Table Usage Counts")?;
    writeln!(
        file,
        "Generated at: {}",
        chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC")
    )?;
    writeln!(file, "Total entries: {}", data.len())?;
    writeln!(file, "{}", "=".repeat(80))?;
    writeln!(file)?;

    let mut sorted_data: Vec<_> = data.iter().collect();
    sorted_data.sort_by(|a, b| b.1.cmp(a.1));

    for (pubkey, count) in sorted_data {
        writeln!(file, "{} : {}", pubkey, count)?;
    }

    Ok(())
}

fn round_up(value: u32, base: u32) -> u32 {
    value.div_ceil(base) * base
}

struct JupiterTracker {
    http_client: reqwest::Client,
    jupiter_base_url: String,
}

impl JupiterTracker {
    pub async fn get_quote(
        &self,
        input_mint: &str,
        output_mint: &str,
        amount: u64,
        slippage_bps: u16,
    ) -> Result<JupiterQuoteResponse, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/quote", self.jupiter_base_url);

        let params = [
            ("inputMint", input_mint),
            ("outputMint", output_mint),
            ("amount", &amount.to_string()),
            ("slippageBps", &slippage_bps.to_string()),
        ];

        tracing::info!("We into quote");
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("Accept", "application/json".parse()?);

        let response = self
            .http_client
            .get(&url)
            .query(&params)
            .headers(headers)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_txt = response.text().await?;
            tracing::error!("Jupiter API err : {}", error_txt);
            return Err(format!("Jupiter API error: {}", error_txt).into());
        }

        let quote: JupiterQuoteResponse = response.json().await?;

        Ok(quote)
    }

    async fn create_swap_transaction(
        &self,
        quote: JupiterQuoteResponse,
        pubkey: &Pubkey,
    ) -> Result<Vec<String>, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/swap-instructions", self.jupiter_base_url);
        tracing::info!("CREATING_TRANSACTION");
        let swap_request = JupiterSwapRequest::new(
            pubkey.to_string(),
            quote,
            100_000_000,
            PriorityLevel::VeryHigh,
            true,
        );

        let response = self
            .http_client
            .post(&url)
            .json(&swap_request)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_txt = response.text().await?;
            tracing::error!("Jupiter API err : {}", error_txt);
            return Err("err".into());
        }

        let swap_instructions: JupiterSwapInstructionsRsponse = response.json().await?;

        Ok(swap_instructions.address_lookup_table_addresses)
    }
}

async fn fetch_address_lookup_tables(
    alt_address: &[String],
) -> Result<Vec<Pubkey>, Box<dyn std::error::Error + Send + Sync>> {
    let vec_pubkeys: Result<Vec<Pubkey>, _> = alt_address
        .iter()
        .map(|address| Pubkey::from_str(address))
        .collect();

    let vec_pubkeys = vec_pubkeys?;
    Ok(vec_pubkeys)
}
