FROM rust:latest AS builder

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y protobuf-compiler

COPY . .
RUN cargo build --release --bin saturn-bundle-tracker

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates tzdata && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/saturn-bundle-tracker /usr/local/bin/saturn-bundle-tracker
CMD ["saturn-bundle-tracker"]
