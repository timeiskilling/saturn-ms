use serde::Deserialize;

#[derive(Deserialize)]
pub struct ExchangeInfo {
    pub symbols: Vec<BinanceSymbol>,
}

#[derive(Deserialize, Debug)]
pub struct BinanceSymbol {
    pub symbol: String,
    pub status: String,
    #[serde(rename = "baseAsset")]
    pub base_asset: String,
    #[serde(rename = "quoteAsset")]
    pub quote_asset: String,
}
