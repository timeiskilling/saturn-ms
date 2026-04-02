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

{
  /*
<div className="flex flex-col gap-2">
  {tokensError && (
    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
      <p className="text-red-400 text-xs">{tokensError.message}</p>
    </div>
  )}

  {displayTokens.length === 0 && !tokensLoading && (
    <div className="py-8 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
      <Coins className="w-8 h-8 mb-2 opacity-50" />
      <p className="text-sm">No tokens found</p>
    </div>
  )}

  {displayTokens.map((token, idx) => (
    <div
      key={`${token.mint}-${idx}`}
      className="flex items-center p-3 bg-zinc-900 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer group"
      onClick={() => {
        // Prepares road for a token detail page or action (e.g. swap)
        console.log("Navigating to token:", token.mint);
      }}
    >

      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 mr-3 border border-zinc-700">
        {token.icon ? (
          <img
            src={token.icon}
            alt={token.symbol}
            className="w-full h-full object-cover"
          />
        ) : (
          <Coins className="w-5 h-5 text-zinc-500" />
        )}
      </div>


      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white truncate pr-2 group-hover:text-blue-400 transition-colors">
            {token.symbol || "Unknown Token"}
          </p>
          <p className="text-sm font-medium text-white text-right">
            {Number(token.balance).toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}
          </p>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-zinc-500 truncate pr-2">
            {token.name ||
              `${token.mint.slice(0, 4)}...${token.mint.slice(-4)}`}
          </p>
          {token.symbol && (
            <p className="text-xs text-zinc-500 text-right">
              {/* You can add USD values here later */
}
{
  /*</p>
          )/}
        </div>
      </div>
    </div>
  ))}
</div >
*/
}
