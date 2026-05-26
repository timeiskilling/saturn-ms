import type { TokenInfo } from "@/hooks/useTokenList";
import { useState, useEffect } from "react";

interface TokenIconProps {
  token: { mint: string; symbol: string; icon?: string };
  className?: string;
}

export const TokenIcon = ({
  token,
  className = "w-6 h-6 rounded-full",
}: TokenIconProps) => {
  const cleanIcon = token.icon?.startsWith("ipfs://")
    ? token.icon.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
    : token.icon;

  const sources = [
    cleanIcon,
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/${token.mint}/logo.png`, // Надійний Trust Wallet
    `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${token.mint}/logo.png`, // Старий репозиторій (як останній шанс)
  ].filter(Boolean) as string[];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setImageFailed(false);
  }, [token.mint]);

  const handleError = () => {
    if (currentIndex < sources.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setImageFailed(true);
    }
  };

  if (sources.length === 0 || imageFailed) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-zinc-300 font-bold ${className}`}
      >
        {token.symbol ? token.symbol[0]?.toUpperCase() : "?"}
      </div>
    );
  }

  return (
    <img
      src={sources[currentIndex]}
      alt={`${token.symbol} logo`}
      onError={handleError}
      className={className}
    />
  );
};
