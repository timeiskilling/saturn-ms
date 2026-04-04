import { BasicCard } from "./card";
import { usePhantom } from "@phantom/react-sdk";
import { useSolanaBalance } from "../hooks/useSolanaBalance";
import { useTokenAccounts } from "@/hooks/useTokenAccounts";
import { RefreshCw, Coins } from "lucide-react";

// Mock tokens for UI testing purposes
const MOCK_TOKENS = [
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    balance: "1250.50",
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
];

export function WalletSidebar() {
  const { isConnected } = usePhantom();
  const balance = useSolanaBalance();
  const {
    tokens: fetchedTokens,
    loading: tokensLoading,
    error: tokensError,
    refetch: fetchTokenAccounts,
  } = useTokenAccounts();

  // Combine real tokens with mock tokens for testing the UI
  // In production, we'll fetch actual token metadata for the real tokens
  const displayTokens = isConnected
    ? [
        ...MOCK_TOKENS,
        ...fetchedTokens.map((t) => ({
          ...t,
          symbol: "",
          name: "",
          icon: "",
        })),
      ]
    : MOCK_TOKENS;

  return (
    <BasicCard
      className="w-90 h-full rounded-none border-y-0 border-l-0 shadow-none overflow-y-auto shrink-0 bg-zinc-950 pb-6"
      classNames={{
        content: "flex flex-col gap-1 mt-4 px-6",
      }}
    >
      <div className="flex flex-col w-full gap-4">
        {/*{isConnected && (
          <div className="mt-6 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <h4 className="text-zinc-400 text-sm font-medium mb-1">
              Solana Balance
            </h4>
            <p className="text-white text-xl font-bold">
              {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
            </p>
          </div>
        )}*/}

        {/* Token List Header */}
        {/*<div className="mt-6 mb-3 flex items-center justify-between">
          <h4 className="text-zinc-400 text-sm font-medium">Your Tokens</h4>
          <button
            onClick={fetchTokenAccounts}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            title="Refresh tokens"
          >
            <RefreshCw
              className={`w-4 h-4 ${tokensLoading ? "animate-spin text-zinc-300" : ""}`}
            />
          </button>
        </div>*/}

        {/* Token List Content */}
      </div>
    </BasicCard>
  );
}
