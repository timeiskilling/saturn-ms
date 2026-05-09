export interface AppConfig {
  priceServiceBaseUrl: string;
  tokenListRefreshIntervalSec: number;
  sessionBaseUrl: string;
  grpcBaseUrl: string;
  heliuspUrl: string;
}

const getEnv = (key: string, defaultValue: any): any => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] ?? defaultValue;
  }
  return defaultValue;
};

export const appConfig: AppConfig = {
  priceServiceBaseUrl: getEnv(
    "VITE_PRICE_SERVICE_URL",
    "http://127.0.0.1:8080",
  ),

  tokenListRefreshIntervalSec: Number(
    getEnv("VITE_TOKEN_LIST_REFRESH_INTERVAL_SEC", 7320),
  ),

  sessionBaseUrl: getEnv("VITE_SESSION_URL", "http://127.0.0.1:3000"),

  grpcBaseUrl: getEnv("VITE_GRPC_URL", "http://127.0.0.1:3000"),

  heliuspUrl: getEnv("VITE_HELIUS_API_KEY", null)
    ? `https://mainnet.helius-rpc.com/?api-key=${getEnv("VITE_HELIUS_API_KEY", "")}`
    : "https://api.mainnet.solana.com",
};
