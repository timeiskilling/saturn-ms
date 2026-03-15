import type { TokenBalance } from "@solana/web3.js";

interface BalanceContextState {
  balances: TokenBalance[];
  isLoading: boolean;
  lastUpdate: Date | null;
  error: string | null;
}
