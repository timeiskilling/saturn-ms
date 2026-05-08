export interface AppConfig {
  priceServiceBaseUrl: string;
  tokenListRefreshIntervalSec: number;
  sessionBaseUrl: string;
  grpcBaseUrl: string;
}

export const appConfig: AppConfig = {
  priceServiceBaseUrl:
    import.meta.env.VITE_PRICE_SERVICE_URL || "http://127.0.0.1:8080",
  tokenListRefreshIntervalSec:
    Number(import.meta.env.VITE_TOKEN_LIST_REFRESH_INTERVAL_SEC) || 7_320,
  sessionBaseUrl: import.meta.env.VITE_SESSION_URL || "http://127.0.0.1:3000",
  grpcBaseUrl: import.meta.env.VITE_GRPC_URL || "http://127.0.0.1:3000",
};
