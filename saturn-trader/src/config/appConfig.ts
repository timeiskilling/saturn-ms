export interface AppConfig {
  priceServiceBaseUrl: string;
  tokenListRefreshIntervalSec: number;
  sessionBaseUrl: string;
  grpcBaseUrl: string;
  heliuspUrl: string;
}

export const appConfig: AppConfig = {
  priceServiceBaseUrl:
    process.env.VITE_PRICE_SERVICE_URL || "https://sutrn.com",

  tokenListRefreshIntervalSec: Number(
    process.env.VITE_TOKEN_LIST_REFRESH_INTERVAL_SEC || 7320,
  ),

  sessionBaseUrl: process.env.VITE_SESSION_URL || "https://sutrn.com",

  grpcBaseUrl: process.env.VITE_GRPC_URL || "https://sutrn.com",

  heliuspUrl: process.env.VITE_HELIUS_API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${process.env.VITE_HELIUS_API_KEY}`
    : "https://api.devnet.solana.com",
};
