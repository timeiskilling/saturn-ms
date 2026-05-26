import { getBestIcon } from "@/hooks/iconCache";
import { useState, useEffect } from "react";

interface TokenIconProps {
  token: { mint: string; symbol: string; icon?: string };
  className?: string;
}
export const TokenIcon = ({
  token,
  className = "w-6 h-6 rounded-full",
}: TokenIconProps) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sources = [
      token.icon,
      `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/${token.mint}/logo.png`,
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${token.mint}/logo.png`,
    ].filter(Boolean) as string[];

    setLoading(true);
    getBestIcon(token, sources).then((url) => {
      setResolvedSrc(url);
      setLoading(false);
    });
  }, [token.mint]);

  if (loading)
    return <div className={`animate-pulse bg-zinc-700 ${className}`} />;

  if (!resolvedSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 ${className}`}
      >
        {token.symbol[0]?.toUpperCase()}
      </div>
    );
  }

  return <img src={resolvedSrc} className={className} alt={token.symbol} />;
};
