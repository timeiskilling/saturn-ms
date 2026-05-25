export interface AppConfig {
  priceServiceBaseUrl: string;
  tokenListRefreshIntervalSec: number;
  sessionBaseUrl: string;
  grpcBaseUrl: string;
  heliuspUrl: string;
}
export const appConfig: AppConfig = {
  priceServiceBaseUrl:
    import.meta.env.VITE_PRICE_SERVICE_URL || "https://sutrn.com",

  tokenListRefreshIntervalSec: Number(
    import.meta.env.VITE_TOKEN_LIST_REFRESH_INTERVAL_SEC || 7320,
  ),

  sessionBaseUrl: import.meta.env.VITE_SESSION_URL || "https://sutrn.com",

  grpcBaseUrl: import.meta.env.VITE_GRPC_URL || "https://sutrn.com",

  heliuspUrl: import.meta.env.VITE_HELIUS_API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`
    : "https://api.devnet.solana.com",
};
