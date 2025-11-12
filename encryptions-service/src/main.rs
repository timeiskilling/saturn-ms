use tracing_subscriber::fmt::format::FmtSpan;

mod password_encryptions;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_span_events(FmtSpan::CLOSE)
        .with_target(false)
        .init();
    
    password_encryptions::impl_encryptions::example_flow();
}
