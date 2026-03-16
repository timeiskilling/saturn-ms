FROM rust:latest AS builder

WORKDIR /usr/src/app
COPY . .
RUN cargo build --release --bin saturn-bundle-tracker

FROM debian:bookworm-slim
COPY --from=builder /usr/src/app/target/release/saturn-bundle-tracker /usr/local/bin/saturn-bundle-tracker
CMD ["saturn-bundle-tracker"]
