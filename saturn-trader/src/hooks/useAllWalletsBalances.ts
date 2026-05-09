import { useState, useEffect, useCallback } from "react";
import { useConnectedWallets } from "./useConnectedWallets";
import { type TokenAccount } from "@/solanaAccountData/tokenAccount";
import { createSolanaClient, address, LAMPORTS_PER_SOL } from "gill";
import {
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "gill/programs";
import { appConfig } from "@/config/appConfig";

export interface WalletBalance {
  walletId: string;
  name: string;
  icon?: string;
  address: string;
  tokens: TokenAccount[];
  solBalance: number | null;
  loading: boolean;
  error: Error | null;
}

// Global cache for all wallets balances
const allWalletsCache: Record<
  string,
  {
    promise: Promise<{ tokens: TokenAccount[]; sol: number | null }> | null;
    data: { tokens: TokenAccount[]; sol: number | null } | null;
    timestamp: number;
  }
> = {};
const CACHE_TTL = 15000; // 15 seconds cache

export function useAllWalletsBalances(rpcUrl: string = appConfig.heliuspUrl) {
  const { savedWallets } = useConnectedWallets();
  const [balances, setBalances] = useState<Record<string, WalletBalance>>({});
  const [loading, setLoading] = useState(false);

  const fetchBalances = useCallback(
    async (forceRefresh = false) => {
      if (!savedWallets || savedWallets.length === 0) {
        setBalances({});
        return;
      }

      setLoading(true);

      const updatedBalances: Record<string, WalletBalance> = {};
      const promises = savedWallets.map(async (wallet) => {
        const solanaAccount = wallet.accounts.find(
          (a) => a.addressType === "solana" || !a.addressType,
        );
        const addressStr =
          solanaAccount?.address || wallet.accounts[0]?.address;

        if (!addressStr) return;

        const cacheKey = `${addressStr}-${rpcUrl}`;

        if (!allWalletsCache[cacheKey]) {
          allWalletsCache[cacheKey] = {
            promise: null,
            data: null,
            timestamp: 0,
          };
        }

        const entry = allWalletsCache[cacheKey];
        const now = Date.now();

        if (!forceRefresh && entry.data && now - entry.timestamp < CACHE_TTL) {
          updatedBalances[wallet.walletId] = {
            walletId: wallet.walletId,
            name: wallet.name,
            icon: wallet.icon,
            address: addressStr,
            tokens: entry.data.tokens,
            solBalance: entry.data.sol,
            loading: false,
            error: null,
          };
          return;
        }

        if (entry.promise) {
          try {
            const data = await entry.promise;
            updatedBalances[wallet.walletId] = {
              walletId: wallet.walletId,
              name: wallet.name,
              icon: wallet.icon,
              address: addressStr,
              tokens: data.tokens,
              solBalance: data.sol,
              loading: false,
              error: null,
            };
          } catch (err) {
            updatedBalances[wallet.walletId] = {
              walletId: wallet.walletId,
              name: wallet.name,
              icon: wallet.icon,
              address: addressStr,
              tokens: [],
              solBalance: null,
              loading: false,
              error: err instanceof Error ? err : new Error(String(err)),
            };
          }
          return;
        }

        entry.promise = (async () => {
          const { rpc } = createSolanaClient({ urlOrMoniker: rpcUrl });
          const publicKey = address(addressStr);

          const [splTokenAccounts, token2022Accounts, balanceLamports] =
            await Promise.all([
              rpc
                .getTokenAccountsByOwner(
                  publicKey,
                  { programId: TOKEN_PROGRAM_ADDRESS },
                  { commitment: "confirmed", encoding: "jsonParsed" },
                )
                .send(),
              rpc
                .getTokenAccountsByOwner(
                  publicKey,
                  { programId: TOKEN_2022_PROGRAM_ADDRESS },
                  { commitment: "confirmed", encoding: "jsonParsed" },
                )
                .send(),
              rpc.getBalance(publicKey).send(),
            ]);

          const allAccounts = [
            ...splTokenAccounts.value,
            ...token2022Accounts.value,
          ];

          const tokens = allAccounts.map((item) => {
            const info = item.account.data.parsed.info;
            return {
              mint: info.mint,
              balance: info.tokenAmount.uiAmountString || "0",
              decimals: info.tokenAmount.decimals,
            };
          });

          const sol = Number(balanceLamports.value) / Number(LAMPORTS_PER_SOL);
          return { tokens, sol };
        })();

        try {
          const data = await entry.promise;
          entry.data = data;
          entry.timestamp = Date.now();
          updatedBalances[wallet.walletId] = {
            walletId: wallet.walletId,
            name: wallet.name,
            icon: wallet.icon,
            address: addressStr,
            tokens: data.tokens,
            solBalance: data.sol,
            loading: false,
            error: null,
          };
        } catch (err) {
          updatedBalances[wallet.walletId] = {
            walletId: wallet.walletId,
            name: wallet.name,
            icon: wallet.icon,
            address: addressStr,
            tokens: [],
            solBalance: null,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          };
        } finally {
          entry.promise = null;
        }
      });

      await Promise.all(promises);
      setBalances(updatedBalances);
      setLoading(false);
    },
    [savedWallets, rpcUrl],
  );

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { balances, loading, refetch: () => fetchBalances(true) };
}
