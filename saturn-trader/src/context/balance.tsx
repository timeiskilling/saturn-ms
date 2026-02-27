interface BalanceContextState {
  balances: TokenBalance[];
  isLoading: boolean;
  lastUpdate: Date | null;
  error: string | null;
}
