export interface AppConfig {
  priceServiceBaseUrl: string;
  tokenListRefreshIntervalMs: number;
}

export const appConfig: AppConfig = {
  // Use environment variables if available, otherwise default to local price_service
  priceServiceBaseUrl:
    import.meta.env?.VITE_PRICE_SERVICE_URL || "http://127.0.0.1:8080",

  // Default to 5 minutes (300,000 ms) for refreshing the token list
  tokenListRefreshIntervalMs:
    Number(import.meta.env?.VITE_TOKEN_LIST_REFRESH_INTERVAL_MS) || 300000,
};
