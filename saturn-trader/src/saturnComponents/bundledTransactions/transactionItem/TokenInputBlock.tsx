import React from "react";
import { TokenSelect } from "../TokenSelect";
import { MaxButton } from "./MaxButton";
import { HalfButton } from "./HalfButton";

interface TokenInputBlockProps {
  label: "From" | "To";
  amount: string;
  onAmountChange: (value: string) => void;
  mint: string;
  onMintChange: (value: string) => void;
  isInput: boolean;
  maxDecimals: number;
  balance: string | null;
  usdRate?: number | null;
}

function formatDecimalInput(value: string, maxDecimals: number): string {
  let val = value.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  let parts = val.split(".");
  if (parts.length > 2) {
    const intPart = parts[0] ?? "0";
    val = intPart + "." + parts.slice(1).join("");
    parts = val.split(".");
  }
  if (parts.length === 2) {
    const integerPart = parts[0] === "" ? "0" : (parts[0] ?? "0");
    const fractionalPart = parts[1] ?? "";
    if (maxDecimals === 0) {
      val = integerPart;
    } else if (fractionalPart.length > maxDecimals) {
      val = integerPart + "." + fractionalPart.slice(0, maxDecimals);
    } else if (parts[0] === "") {
      val = "0." + fractionalPart;
    }
  }
  return val;
}

export function TokenInputBlock({
  label,
  amount,
  onAmountChange,
  mint,
  onMintChange,
  isInput,
  maxDecimals,
  balance,
  usdRate = null,
}: TokenInputBlockProps) {
  // Validate if user has enough balance (only applies if isInput is true and balance is known)
  const isInsufficientBalance =
    isInput &&
    balance !== null &&
    parseFloat(amount || "0") > parseFloat(balance);

  const handleMaxClick = () => {
    if (balance) {
      onAmountChange(balance);
    }
  };

  const handleHalfClick = () => {
    if (balance) {
      const half = (parseFloat(balance) / 2).toString();
      onAmountChange(formatDecimalInput(half, maxDecimals));
    }
  };

  return (
    <div className="relative bg-[#1A1A1A] rounded-2xl p-4 border border-zinc-800/50 flex flex-col gap-4 group transition-colors hover:bg-[#1E1E1E]">
      {/* Top section: Mint selection */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex shrink-0 items-center justify-center border border-zinc-700/50 shadow-sm overflow-hidden">
          {/* Default avatar placeholder, wait for real token icons */}
          <div className="w-full h-full bg-zinc-600/50" />
        </div>

        <div className="flex flex-col flex-1 min-w-0 pr-20">
          <span className="text-sm font-semibold text-zinc-100">{label}</span>
          <div className="w-full mt-0.5">
            <TokenSelect
              value={mint}
              onChange={onMintChange}
              isInput={isInput}
              minimalistic
            />
          </div>
        </div>
      </div>

      {/* Bottom section: Amount input */}
      <div className="flex items-center justify-between mt-2">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => {
            const val = formatDecimalInput(e.target.value, maxDecimals);
            onAmountChange(val);
          }}
          className={`bg-transparent text-3xl font-medium outline-none w-full mr-4 placeholder:text-zinc-700 transition-colors ${
            isInsufficientBalance ? "text-red-400" : "text-zinc-100"
          }`}
          placeholder="0.00"
        />

        {isInput && (
          <div className="flex items-center gap-2 shrink-0">
            <HalfButton onClick={handleHalfClick} />
            <MaxButton onClick={handleMaxClick} />
          </div>
        )}
      </div>

      {/* USD Value / Balance Row */}
      <div className="flex items-center justify-between text-xs font-medium mt-1">
        <span className="text-zinc-600">
          {amount && parseFloat(amount) > 0
            ? usdRate !== null
              ? `≈ $${(parseFloat(amount) * usdRate).toFixed(2)}`
              : "≈ $0.00"
            : "-"}
        </span>

        {isInput && balance !== null && (
          <span
            className={`cursor-pointer hover:underline decoration-zinc-500 underline-offset-2 transition-colors ${
              isInsufficientBalance ? "text-red-400/80" : "text-zinc-500"
            }`}
            onClick={handleMaxClick}
          >
            Balance:{" "}
            {parseFloat(balance).toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}
          </span>
        )}
      </div>
    </div>
  );
}
