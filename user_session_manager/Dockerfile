FROM rust:latest AS builder

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

ENV SQLX_OFFLINE=true

RUN cargo fetch

RUN cargo build -p user_session_manager --release

FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/user_session_manager ./user_session_manager

EXPOSE 8080

CMD ["./user_session_manager"]
