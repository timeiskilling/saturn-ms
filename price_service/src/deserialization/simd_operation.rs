use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct CombinedStreamEvent<'a> {
    #[serde(borrow)]
    pub data: SmallTickerEvent<'a>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SmallTickerEvent<'a> {
    #[serde(borrow, rename = "s")]
    pub symbol: &'a str,
    #[serde(borrow, rename = "p")]
    pub price_change: &'a str,
    #[serde(borrow, rename = "P")]
    pub price_change_percent: &'a str,
    #[serde(borrow, rename = "x")]
    pub prev_close: &'a str,
}

#[inline]
pub fn parse_combined_ticker<'a>(payload: &'a mut [u8]) -> Option<CombinedStreamEvent<'a>> {
    simd_json::from_slice::<CombinedStreamEvent<'a>>(payload).ok()
}
