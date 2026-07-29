# Saturn Trading Platform

Saturn is a full-stack cryptocurrency trading platform built for the Solana blockchain (it will also be implemented on Ethereum in the future) designed to give traders real-time market data and fast bundle transaction execution. The platform streams live token prices from Binance via WebSocket and Redis pub/sub, supports Jito MEV bundle submission and tracking, and provides Jupiter-powered token swaps all behind a single HAProxy reverse proxy that handles SSL termination, WebSocket routing, and gRPC-Web traffic. 

The backend is composed of five independent Rust microservices built with Axum and Tokio, backed by PostgreSQL and Redis Sentinel for high availability. The frontend is a React and TypeScript single-page application bundled with Bun and served via Nginx.

---

## How to Launch the Simulation Environment

The easiest way to launch the entire Saturn stack locally for testing and simulation is by using Docker Compose. This spins up the frontend, all five Rust microservices, the HAProxy router, PostgreSQL, and a complete Redis Sentinel cluster natively.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Docker Compose plugin)
- (Optional but recommended) [Bun](https://bun.sh/) if you wish to run the frontend independently in dev mode.

### 1. Clone the Repository
First, clone the Saturn repository to your local machine and navigate into the project directory:

```bash
git clone https://github.com/timeiskilling/saturn.git
cd saturn
```

### 2. Configure the Environment Variables
Before launching the stack, you must configure your environment variables. 

There is a provided `.example_env` file in the root of the repository. You must rename or copy this file to `.env`:

```bash
cp .example_env .env
```

**Required Edits in `.env`:**
Open the newly created `.env` file and replace the `_` placeholders with actual values:

- `JUPITER_API_KEY`: Your Jupiter API Key (if applicable, or leave empty if routing permits)
- `HELIUS_API_KEY`: Your [Helius](https://dev.helius.xyz/) RPC API key. This is critical for Solana mainnet interaction.
- `POSTGRES_USER` & `POSTGRES_PASSWORD`: Setup your local database credentials (e.g. `postgres` / `password123`)
- `POSTGRES_HOST`: Set to `10.0.0.20` (the static IP assigned to Postgres in the docker-compose file)
- `POSTGRES_PORT`: Set to `5432`
- `POSTGRES_DB`: Setup your local database name (e.g. `saturn`)
- `VITE_PRICE_SERVICE_URL`, `VITE_SESSION_URL`, `VITE_GRPC_URL`: If testing entirely locally via HAProxy, set these to `http://localhost` (or `http://10.0.0.5`). 
- `VITE_HELIUS_API_KEY`: The same Helius key from above, accessible to the frontend.

### 3. Launch the Local Simulation Stack

Once your `.env` file is ready, simply run:

```bash
docker-compose up --build -d
```

### 4. Accessing the Platform

Whether running locally or in production, the `docker-compose` files automatically set up an HAProxy load balancer on `10.0.0.5` which binds to your host's port `80` and `443`.

If you need to view the logs for any specific microservice to debug bundles or connections:
```bash
# View logs for the transaction builder
docker logs -f bundle_status_service

# View logs for user sessions and database queries
docker logs -f user-session-manager

# View logs for the live price streaming service
docker logs -f price_service
```

### Stopping the Environment
To spin down the environment and preserve your database volumes:
```bash
# For local simulation
docker-compose down

# For production
docker-compose -f docker-compose.prod.yml down
```
*(If you wish to completely wipe the PostgreSQL data and Redis cache, append the `-v` flag: `docker-compose down -v`)*
