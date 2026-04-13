import { useCallback, useEffect, useState } from "react";
import { appConfig } from "../config/appConfig";

export type TokenInfo = {
  symbol: string;
  mint: string;
  decimals: number;
  icon: string;
};

// Global cache object so that all components using this hook share the same data.
// We only need one global cache for the main token list.
let globalCache: {
  promise: Promise<TokenInfo[]> | null;
  data: TokenInfo[] | null;
  timestamp: number;
} = {
  promise: null,
  data: null,
  timestamp: 0,
};

const tokenListListeners = new Set<(data: TokenInfo[]) => void>();

export function useTokenList() {
  const [tokens, setTokens] = useState<TokenInfo[]>(globalCache.data || []);
  const [loading, setLoading] = useState<boolean>(!globalCache.data);
  const [error, setError] = useState<Error | null>(null);

  const fetchTokenList = useCallback(
    async (forceRefresh = false): Promise<TokenInfo[]> => {
      const now = Date.now();
      const isCacheValid =
        globalCache.data &&
        now - globalCache.timestamp < appConfig.tokenListRefreshIntervalMs;

      // If cache is valid and we aren't forcing a refresh, return the cached data immediately.
      if (isCacheValid && !forceRefresh) {
        setTokens(globalCache.data!);
        return globalCache.data!;
      }

      // If a request is already in-flight, await that same promise instead of duplicating requests.
      if (globalCache.promise && !forceRefresh) {
        return globalCache.promise;
      }

      setLoading(true);
      setError(null);

      globalCache.promise = (async () => {
        try {
          const response = await fetch(
            `${appConfig.priceServiceBaseUrl}/get/list_of_tokens`,
            {
              headers: {
                "X-Auth-Token": "test-token", // Modify or pass down your real auth token logic
              },
            },
          );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch tokens: ${response.status} ${response.statusText}`,
            );
          }

          const data: TokenInfo[] = await response.json();

          globalCache.data = data;
          globalCache.timestamp = Date.now();
          setTokens(data);
          tokenListListeners.forEach((listener) => listener(data));

          return data;
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          console.warn(`Token list fetch error: ${error.message}`);
          return globalCache.data || [];
        } finally {
          globalCache.promise = null;
          setLoading(false);
        }
      })();

      return globalCache.promise;
    },
    [],
  );

  useEffect(() => {
    const listener = (data: TokenInfo[]) => {
      setTokens(data);
      setLoading(false);
    };
    tokenListListeners.add(listener);

    // Initial fetch on mount
    fetchTokenList()
      .then((data) => {
        setTokens(data);
        setLoading(false);
      })
      .catch((err) => console.warn(`Token list fetch failed: ${err.message}`));

    // Setup polling interval to keep tokens fresh
    const intervalId = setInterval(() => {
      // Pass forceRefresh=true if you strictly want to bypass the `isCacheValid` check on interval,
      // or false if you want to rely purely on the timestamp threshold. We'll pass false so it
      // naturally refreshes only when the timestamp expires.
      fetchTokenList()
        .then((data) => {
          setTokens(data);
          setLoading(false);
        })
        .catch((err) =>
          console.warn(`Token list fetch retry failed: ${err.message}`),
        );
    }, appConfig.tokenListRefreshIntervalMs);

    return () => {
      clearInterval(intervalId);
      tokenListListeners.delete(listener);
    };
  }, [fetchTokenList]);

  return {
    tokens,
    loading,
    error,
    refetch: () =>
      fetchTokenList(true).catch((err) => {
        console.warn(`Refetch failed: ${err.message}`);
        return [];
      }),
  };
}
