// Auto-generated types from streaming_status.proto

export interface SignedTransactions {
  transactions: string[];
  userPk: string;
}

export interface BuiltTransaction {
  id: string;
  transactionBase58: string;
}

export interface TransactionsToSign {
  transactions: BuiltTransaction[];
  delta?: BundleDelta;
}

export interface BundleDelta {
  swaps: TransactionDelta[];
  jitoTipLamports: number;
  totalNetworkFeeLamports: number;
}

export interface TransactionsBuld {
  transactions: TrasnactionInstruction[];
}

export interface TransactionDelta {
  inputMint: string;
  inputAmount: number;
  outputMint: string;
  expectedOutput: number;
  minimumOutput: number;
  jitoTipLamports: number;
  networkFeeLamports: number;
  platformFeeBps: number;
  id: string;
}

export interface TrasnactionInstruction {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps: number;
  options?: QuoteOptions;
  userPk: string;
  id: string;
}

export interface QuoteOptions {
  swapMode?: number;
  dexes: string[];
  excludeDexes: string[];
  dynamicSlippage?: boolean;
}

export interface Empty {}

export interface CoinsData {
  price: string;
  changePercent: string;
  imageUrl: string;
  rank?: number;
  coinName: string;
}

export interface AddBundlesRequest {
  bundleIds: string[];
  userId: string;
}

export interface UserBundleUpdate {
  bundleId: string;
  oldStatus: string;
  newStatus: BundleStage;
  timestamp: number;
  slot?: number;
}

export enum BundleStage {
  BUNDLE_STAGE_UNSPECIFIED = 0,
  BUNDLE_STAGE_SUBMITTED = 1,
  BUNDLE_STAGE_IN_FLIGHT = 2,
  BUNDLE_STAGE_LANDED = 3,
  BUNDLE_STAGE_CONFIRMED = 4,
  BUNDLE_STAGE_FINALIZED = 5,
  BUNDLE_STAGE_FAILED = 6,
}
