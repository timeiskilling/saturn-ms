import { type TokenAccount } from "@/solanaAccountData/tokenAccount";
import { usePhantom } from "@phantom/react-sdk";
import { createSolanaClient,address } from "gill";
import { TOKEN_PROGRAM_ADDRESS, TOKEN_2022_PROGRAM_ADDRESS } from "gill/programs";
import { useCallback, useEffect, useState } from "react";

interface CacheEntry {
  promise: Promise<TokenAccount[]> | null;
  data: TokenAccount[] | null;
  timestamp: number;
}
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 15000; // 15 seconds cache

export function useTokenAccounts(
  rpcUrl: string = "https://api.devnet.solana.com",
  customAddress?: string,
) {
  const { isConnected, addresses } = usePhantom();
  const [tokens, setTokens] = useState<TokenAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTokenAccounts = useCallback(
    async (forceRefresh = false) => {
      const targetAddress = customAddress || addresses?.[0]?.address;

      if (!targetAddress || (!customAddress && !isConnected)) {
        setTokens([]);
        return;
      }

      const addressPb = targetAddress;
      const cacheKey = `${addressPb}-${rpcUrl}`;

      if (!cache[cacheKey]) {
        cache[cacheKey] = { promise: null, data: null, timestamp: 0 };
      }

      const entry = cache[cacheKey];
      const now = Date.now();

      if (!forceRefresh && entry.data && now - entry.timestamp < CACHE_TTL) {
        setTokens(entry.data);
        return;
      }

      if (entry.promise) {
        setLoading(true);
        try {
          const data = await entry.promise;
          setTokens(data);
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      entry.promise = (async () => {
        const { rpc } = createSolanaClient({
          urlOrMoniker: rpcUrl,
        });
        const publicKey = address(addressPb);

        const [splTokenAccounts, token2022Accounts] = await Promise.all([
          rpc.getTokenAccountsByOwner(
            publicKey,
            { programId: TOKEN_PROGRAM_ADDRESS },
            {
              commitment: "confirmed",
              encoding: "jsonParsed"
            },
          ).send(),
          rpc.getTokenAccountsByOwner(
            publicKey,
            { programId: TOKEN_2022_PROGRAM_ADDRESS },
            {
              commitment: "confirmed",
              encoding: "jsonParsed" },
          ).send(),
        ]);

        const allAccounts = [
          ...splTokenAccounts.value,
          ...token2022Accounts.value,
        ];

        return allAccounts.map((item) => {
          const info = item.account.data.parsed.info;
          return {
            mint: info.mint,
            balance: info.tokenAmount.uiAmountString || "0",
            decimals: info.tokenAmount.decimals,
          };
        });
      })();

      try {
        const data = await entry.promise;
        entry.data = data;
        entry.timestamp = Date.now();
        setTokens(data);
      } catch (err) {
        console.error("Failed to fetch token accounts:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        entry.promise = null;
        setLoading(false);
      }
    },
    [addresses, isConnected, rpcUrl, customAddress],
  );

  useEffect(() => {
    fetchTokenAccounts();
  }, [fetchTokenAccounts]);

  return { tokens, loading, error, refetch: () => fetchTokenAccounts(true) };
}
