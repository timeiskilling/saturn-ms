FROM rust:latest AS builder

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    build-essential \
    protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN cargo build --release --bin bundle_status_service

FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/bundle_status_service ./bundle_status_service

RUN chmod +x ./bundle_status_service

EXPOSE 3000

CMD ["./bundle_status_service"]
