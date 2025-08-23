FROM rust:latest AS builder

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    build-essential \
    protobuf-compiler \
    # libzstd-dev \
    # libz-dev \
    # librdkafka-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Cargo.toml ./

COPY bundle_status_service/Cargo.toml ./bundle_status_service/
COPY common/Cargo.toml ./common/
COPY config/Cargo.toml ./config/
COPY jito_fee_service/Cargo.toml ./jito_fee_service/
COPY jupiter_trader_data/Cargo.toml ./jupiter_trader_data/
COPY jupiter_trader_service/Cargo.toml ./jupiter_trader_service/
COPY price_service/Cargo.toml ./price_service/
COPY proto_models/Cargo.toml ./proto_models/
COPY service_v1/Cargo.toml ./service_v1/
COPY ws_price_service/Cargo.toml ./ws_price_service/


RUN mkdir -p bundle_status_service/src common/src config/src jito_fee_service/src \
    jupiter_trader_data/src jupiter_trader_service/src price_service/src \
    proto_models/src service_v1/src ws_price_service/src

RUN echo "fn main() {}" > bundle_status_service/src/main.rs
RUN echo "" > common/src/lib.rs
RUN echo "" > config/src/lib.rs  
RUN echo "fn main() {}" > jito_fee_service/src/main.rs
RUN echo "" > jupiter_trader_data/src/lib.rs
RUN echo "fn main() {}" > jupiter_trader_service/src/main.rs
RUN echo "fn main() {}" > price_service/src/main.rs
RUN echo "" > proto_models/src/lib.rs
RUN echo "fn main() {}" > service_v1/src/main.rs
RUN echo "fn main() {}" > ws_price_service/src/main.rs

RUN cargo build --release --bin bundle_status_service

RUN rm -f target/release/deps/bundle_status_service*
RUN rm -rf bundle_status_service/src common/src config/src jupiter_trader_data/src proto_models/src

COPY bundle_status_service/src ./bundle_status_service/src
COPY common/src ./common/src
COPY config/src ./config/src
COPY jupiter_trader_data/src ./jupiter_trader_data/src
COPY proto_models/src ./proto_models/src
COPY bundle_status_service/.env* ./
COPY .env ./

COPY proto_models/build.rs ./proto_models/
COPY proto_models/proto ./proto_models/proto


RUN cargo build --release --bin bundle_status_service

FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    protobuf-compiler \
    # librdkafka1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/bundle_status_service ./bundle_status_service

RUN chmod +x ./bundle_status_service

EXPOSE 3000

CMD ["./bundle_status_service"]