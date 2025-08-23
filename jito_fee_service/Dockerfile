# --- SIMPLIFIED & RECOMMENDED builder stage ---
FROM rust:latest AS builder

# 1. Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copy your entire project at once
COPY . .

# 3. Build your specific service in a single, clean step
RUN cargo build --release --bin jito_fee_service


# --- runtime stage ---
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy just the final, compiled binary from the builder
COPY --from=builder /app/target/release/jito_fee_service ./jito_fee_service

CMD ["./jito_fee_service"]