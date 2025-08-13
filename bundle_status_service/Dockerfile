FROM rust:latest AS builder

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    build-essential \
    libzstd-dev \
    libz-dev \
    librdkafka-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /bundle-service

COPY Cargo.toml ./
RUN mkdir src && echo "fn main() {}" > src/main.rs


RUN cargo build --release
RUN rm -rf src target/release/deps/bundle_status_service*

COPY . .

RUN cargo build --release

FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    librdkafka1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /bundle-service

COPY --from=builder /app/target/release/bundle_status_service ./bundle_status_service

RUN chmod +x ./bundle_status_service

EXPOSE 3000

CMD ["./bundle_status_service"]