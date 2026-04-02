export interface QuoteOptions {
  swapMode?: number;
  dexes: string[];
  excludeDexes: string[];
  dynamicSlippage?: boolean;
  restrictIntermediateTokens?: boolean;
  onlyDirectRoutes?: boolean;
  asLegacyTransaction?: boolean;
  maxAccounts?: number;
}

export interface TransactionInstruction {
  id: string;
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps: number;
  options?: QuoteOptions;
  userPk?: string;
  calculatedOutput?: string;
}

export interface Template {
  id: string;
  name: string;
  transactions: TransactionInstruction[];
}

export const POPULAR_TOKENS = [
  {
    symbol: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    color: "text-purple-400",
    decimals: 9,
  },
  {
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    color: "text-blue-400",
    decimals: 6,
  },
  {
    symbol: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    color: "text-orange-400",
    decimals: 5,
  },
  {
    symbol: "ETH",
    mint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    color: "text-blue-400",
    decimals: 8,
  },
  {
    symbol: "JUP",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    color: "text-teal-400",
    decimals: 6,
  },
];

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: "t_1",
    name: "Yield Strategy (USDC -> SOL -> ETH)",
    transactions: [
      {
        id: "tx_1",
        inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        outputMint: "So11111111111111111111111111111111111111112",
        amount: "50",
        slippageBps: 50,
      },
      {
        id: "tx_2",
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
        amount: "0.1",
        slippageBps: 100,
        options: {
          dexes: ["Jupiter"],
          excludeDexes: [],
          dynamicSlippage: true,
        },
      },
    ],
  },
  {
    id: "t_2",
    name: "Arb Loop (SOL -> JUP -> SOL)",
    transactions: [
      {
        id: "tx_3",
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        amount: "1",
        slippageBps: 30,
      },
      {
        id: "tx_4",
        inputMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        outputMint: "So11111111111111111111111111111111111111112",
        amount: "2500",
        slippageBps: 30,
      },
    ],
  },
];
