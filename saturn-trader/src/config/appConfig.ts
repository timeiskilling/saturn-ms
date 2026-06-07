export interface AppConfig {
  priceServiceBaseUrl: string;
  tokenListRefreshIntervalSec: number;
  sessionBaseUrl: string;
  grpcBaseUrl: string;
  heliuspUrl: string;
  useDevnet: boolean;
}

// Global flag to toggle between Devnet and Mainnet for testing
const USE_DEVNET =
  typeof window !== "undefined"
    ? localStorage.getItem("saturn_network") === "devnet"
    : false;

export const appConfig: AppConfig = {
  priceServiceBaseUrl:
    process.env.VITE_PRICE_SERVICE_URL || "https://sutrn.com",

  tokenListRefreshIntervalSec: Number(
    process.env.VITE_TOKEN_LIST_REFRESH_INTERVAL_SEC || 7320,
  ),

  sessionBaseUrl: process.env.VITE_SESSION_URL || "https://sutrn.com",

  grpcBaseUrl: process.env.VITE_GRPC_URL || "https://sutrn.com",

  heliuspUrl: USE_DEVNET
    ? "https://api.devnet.solana.com"
    : process.env.VITE_HELIUS_API_KEY
      ? `https://mainnet.helius-rpc.com/?api-key=${process.env.VITE_HELIUS_API_KEY}`
      : "https://api.mainnet-beta.solana.com",

  useDevnet: USE_DEVNET,
};
