FROM rust:latest AS builder

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    build-essential \
    protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

ARG BIN_NAME=bundle_status_service
RUN cargo build --release --bin ${BIN_NAME}

FROM ubuntu:24.04
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ARG BIN_NAME=bundle_status_service

COPY --from=builder /app/target/release/${BIN_NAME} ./app_binary

RUN chmod +x ./app_binary

EXPOSE 3000

CMD ["./app_binary"]
