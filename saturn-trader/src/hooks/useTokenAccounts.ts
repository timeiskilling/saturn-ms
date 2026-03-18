import { type TokenAccount } from "@/solanaAccountData/tokenAccount";
import { usePhantom } from "@phantom/react-sdk";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
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
) {
  const { isConnected, addresses } = usePhantom();
  const [tokens, setTokens] = useState<TokenAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTokenAccounts = useCallback(
    async (forceRefresh = false) => {
      if (!addresses?.[0] || !isConnected) {
        setTokens([]);
        return;
      }

      const address = addresses[0].address;
      const cacheKey = `${address}-${rpcUrl}`;

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
        const connection = new Connection(rpcUrl);
        const publicKey = new PublicKey(address);

        const [splTokenAccounts, token2022Accounts] = await Promise.all([
          connection.getParsedTokenAccountsByOwner(
            publicKey,
            { programId: TOKEN_PROGRAM_ID },
            "confirmed",
          ),
          connection.getParsedTokenAccountsByOwner(
            publicKey,
            { programId: TOKEN_2022_PROGRAM_ID },
            "confirmed",
          ),
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
    [addresses, isConnected, rpcUrl],
  );

  useEffect(() => {
    fetchTokenAccounts();
  }, [fetchTokenAccounts]);

  return { tokens, loading, error, refetch: () => fetchTokenAccounts(true) };
}
