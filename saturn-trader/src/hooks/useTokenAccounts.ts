import { type TokenAccount } from "@/solanaAccountData/tokenAccount";
import { usePhantom } from "@phantom/react-sdk";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";

export function useTokenAccounts(
  rpcUrl: string = "https://api.devnet.solana.com",
) {
  const { isConnected, addresses } = usePhantom();
  const [tokens, setTokens] = useState<TokenAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTokenAccounts = useCallback(async () => {
    if (!addresses?.[0] || !isConnected) {
      setTokens([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const connection = new Connection(rpcUrl);
      const publicKey = new PublicKey(addresses[0].address);

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

      const tokenList: TokenAccount[] = allAccounts.map((item) => {
        const info = item.account.data.parsed.info;
        return {
          mint: info.mint,
          balance: info.tokenAmount.uiAmountString || "0",
          decimals: info.tokenAmount.decimals,
        };
      });

      setTokens(tokenList);
    } catch (err) {
      console.error("Failed to fetch token accounts:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [addresses, isConnected, rpcUrl]);

  useEffect(() => {
    fetchTokenAccounts();
  }, [fetchTokenAccounts]);

  return { tokens, loading, error, refetch: fetchTokenAccounts };
}
