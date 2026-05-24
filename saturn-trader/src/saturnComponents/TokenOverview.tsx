import { useEffect, useState, useRef } from "react";
import { useTokenPrice } from "@/hooks/useTokenPrice";

const TOP_TOKENS = ["SOL", "ETH", "WBTC", "JUP", "PENGU"];

const TOKEN_ICONS: Record<string, string> = {
  SOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  ETH: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png",
  WBTC: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh/logo.png",
  JUP: "https://static.jup.ag/jup/icon.png",
  PENGU: "https://arweave.net/BW67hICaKGd2_wamSB0IQq-x7Xwtmr2oJj1WnWGJRHU",
};

function ChangeTriangle({ dir }: { dir: "up" | "dn" }) {
  return (
    <span
      className={`
        inline-block w-0 h-0 shrink-0 transition-transform duration-300
        border-l-4 border-r-4 border-l-transparent border-r-transparent
        ${
          dir === "up"
            ? "border-b-[6px] border-b-current"
            : "border-t-[6px] border-t-current"
        }
      `}
    />
  );
}

function TokenRow({ symbol }: { symbol: string }) {
  const priceData = useTokenPrice(symbol);
  const [flashDir, setFlashDir] = useState<"up" | "dn" | null>(null);
  const [tickDir, setTickDir] = useState<"up" | "dn" | null>(null);
  const prevPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!priceData || prevPriceRef.current === null) {
      prevPriceRef.current = priceData?.price ?? null;
      return;
    }
    if (priceData.price !== prevPriceRef.current) {
      const dir = priceData.price > prevPriceRef.current ? "up" : "dn";
      setFlashDir(dir);
      setTickDir(dir);
      const t = setTimeout(() => setFlashDir(null), 500);
      prevPriceRef.current = priceData.price;
      return () => clearTimeout(t);
    }
    prevPriceRef.current = priceData.price;
  }, [priceData?.price]);

  const formatPrice = (price: number) => {
    if (price >= 1000)
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const isPositive = priceData ? priceData.percentChange >= 0 : true;
  const currentDir = tickDir || (isPositive ? "up" : "dn");

  const priceColor =
    flashDir === "up"
      ? "text-green-400"
      : flashDir === "dn"
        ? "text-red-400"
        : "text-zinc-300";

  const pctColor = currentDir === "up" ? "text-green-400" : "text-red-400";

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-900/40 transition-colors">
      {/* Icon + symbol */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-zinc-500">
          {TOKEN_ICONS[symbol] ? (
            <img
              src={TOKEN_ICONS[symbol]}
              alt={symbol}
              className="w-full h-full object-cover"
            />
          ) : (
            symbol.slice(0, 2)
          )}
        </div>
        <span className="text-sm font-bold text-zinc-100">{symbol}</span>
      </div>

      {/* Price + change */}
      <div className="flex items-center gap-4 shrink-0">
        {priceData ? (
          <>
            <span
              className={`text-sm font-mono tabular-nums transition-colors duration-300 ${priceColor}`}
            >
              {formatPrice(priceData.price)}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium w-15 justify-end tabular-nums ${pctColor}`}
            >
              <ChangeTriangle dir={currentDir} />
              {Math.abs(priceData.percentChange).toFixed(2)}%
            </span>
          </>
        ) : (
          <>
            <div className="h-4 w-16 bg-zinc-800/50 rounded animate-pulse" />
            <div className="h-4 w-12 bg-zinc-800/50 rounded animate-pulse" />
          </>
        )}
      </div>
    </div>
  );
}

export function TokenOverview() {
  return (
    <div className="flex flex-col gap-3">
      {/* Minimal header */}
      <div className="flex items-center gap-1.5 px-1 mb-2">
        <span className="relative flex h-1.5 w-1.5"></span>
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
          Market info
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-auto ml-0.5 opacity-60"
          viewBox="-76.3875 -25.59 662.025 153.54"
        >
          <g transform="translate(-39.87 -50.56)">
            <path
              d="M63 101.74L51.43 113.3l-11.56-11.56 11.56-11.56zm28.05-28.07l19.81 19.82 11.56-11.56-31.37-31.37-31.37 31.37 11.56 11.56zm39.63 16.51l-11.56 11.56 11.56 11.56 11.55-11.56zm-39.63 39.63L71.24 110l-11.56 11.55 31.37 31.37 31.37-31.37L110.86 110zm0-16.51l11.56-11.56-11.56-11.56-11.56 11.56zm122 1.11v-.16c0-7.54-4-11.31-10.51-13.79 4-2.25 7.38-5.78 7.38-12.11v-.16c0-8.82-7.06-14.52-18.53-14.52h-26.04v56.14h26.7c12.67 0 21.02-5.13 21.02-15.4zm-15.4-24c0 4.17-3.45 5.94-8.9 5.94h-11.37V84.5h12.19c5.21 0 8.1 2.08 8.1 5.77zm3.13 22.46c0 4.17-3.29 6.09-8.75 6.09h-14.65v-12.33h14.27c6.34 0 9.15 2.33 9.15 6.1zM239 129.81V73.67h-12.39v56.14zm66.39 0V73.67h-12.23v34.57l-26.3-34.57h-11.39v56.14h12.19V94.12l27.18 35.69zm68.41 0l-24.1-56.54h-11.39l-24.05 56.54h12.59l5.15-12.59h23.74l5.13 12.59zm-22.45-23.5h-14.96l7.46-18.2zm81.32 23.5V73.67h-12.23v34.57l-26.31-34.57h-11.38v56.14h12.18V94.12l27.19 35.69zm63.75-9.06l-7.85-7.94c-4.41 4-8.34 6.57-14.76 6.57-9.62 0-16.28-8-16.28-17.64v-.16c0-9.62 6.82-17.48 16.28-17.48 5.61 0 10 2.4 14.36 6.33l7.83-9.06c-5.21-5.13-11.54-8.66-22.13-8.66-17.24 0-29.27 13.07-29.27 29v.16c0 16.12 12.27 28.87 28.79 28.87 10.81.03 17.22-3.82 22.99-9.99zm52.7 9.06v-11H518.6V107h26.47V96H518.6V84.66h30.08v-11h-42.35v56.14z"
              fill="#f0b90b"
            />
          </g>
        </svg>
      </div>

      {/* Token rows — no table, no borders, just tight flex rows */}
      {TOP_TOKENS.map((symbol) => (
        <TokenRow key={symbol} symbol={symbol} />
      ))}
    </div>
  );
}
