import React, { useEffect, useState, useMemo, useRef } from "react";
import { TokenSelect } from "../TokenSelect";
import { MaxButton } from "./MaxButton";
import { HalfButton } from "./HalfButton";
import { useTokenList } from "@/hooks/useTokenList";
import { type TransactionInstruction } from "../types";

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
  transactions?: TransactionInstruction[];
  index?: number;
  walletAddress?: string;
  onWalletChange?: (address: string) => void;
  actualBalance?: string | null;
}

function formatTokenDisplay(value: string, maxDecimals: number): string {
  if (!value) return "";
  const num = parseFloat(value);
  if (isNaN(num) || num === 0) return value;

  if (num < 0.0001) {
    return num.toFixed(Math.min(maxDecimals, 10)).replace(/\.?0+$/, "");
  }

  let displayDecimals = 6;
  if (num >= 1000) {
    displayDecimals = 2;
  } else if (num >= 1) {
    displayDecimals = 4;
  }

  displayDecimals = Math.min(displayDecimals, maxDecimals);
  return num.toFixed(displayDecimals).replace(/\.?0+$/, "");
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
  transactions = [],
  index = 0,
  walletAddress,
  onWalletChange,
  actualBalance = null,
}: TokenInputBlockProps) {
  const { tokens } = useTokenList();
  const tokenIcon = useMemo(
    () => tokens.find((t) => t.mint === mint)?.icon,
    [tokens, mint],
  );

  const onMintChangeRef = useRef(onMintChange);
  useEffect(() => {
    onMintChangeRef.current = onMintChange;
  }, [onMintChange]);

  const tokenSelectElement = useMemo(
    () => (
      <TokenSelect
        value={mint}
        onChange={(val) => onMintChangeRef.current(val)}
        isInput={isInput}
        minimalistic
        transactions={transactions}
        index={index}
        walletAddress={walletAddress}
        onWalletChange={onWalletChange}
      />
    ),
    [mint, isInput, transactions, index, walletAddress, onWalletChange],
  );

  const [displayAmount, setDisplayAmount] = useState(amount);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setDisplayAmount(amount || "");
    setIsUpdating(false);
  }, [amount]);

  const isWalletDisconnected = isInput && walletAddress === undefined;

  // Validate if user has enough balance (only applies if isInput is true and balance is known)
  const isInsufficientBalance =
    isInput &&
    balance !== null &&
    parseFloat(amount || "0") > parseFloat(balance) &&
    !isWalletDisconnected;

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
    <div className="relative bg-[#1A1A1A] rounded-2xl p-3 md:p-4 border border-zinc-800/50 flex flex-col gap-2 md:gap-4 group transition-colors hover:bg-[#1E1E1E]">
      {/* Top section: Mint selection */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 flex shrink-0 items-center justify-center border border-zinc-700/50 shadow-sm overflow-hidden">
          {tokenIcon ? (
            <img
              src={tokenIcon}
              alt="Token Icon"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-600/50" />
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0 pr-12 md:pr-20">
          <span className="text-xs md:text-sm font-semibold text-zinc-100">
            {label}
          </span>
          <div className="w-full mt-0.5">{tokenSelectElement}</div>
        </div>
      </div>

      {/* Bottom section: Amount input */}
      <div className="flex items-center justify-between mt-1 md:mt-2">
        <input
          type="text"
          inputMode="decimal"
          value={
            isInput
              ? displayAmount
              : formatTokenDisplay(displayAmount, maxDecimals)
          }
          onChange={(e) => {
            const val = formatDecimalInput(e.target.value, maxDecimals);
            onAmountChange(val);
          }}
          className={`bg-transparent text-xl md:text-3xl font-medium outline-none w-full mr-4 placeholder:text-zinc-700 transition-all duration-300 ${
            isInsufficientBalance || isWalletDisconnected
              ? "text-red-400"
              : "text-zinc-100"
          } ${isUpdating && !isInput ? "opacity-40 scale-[0.98] blur-[1px]" : "opacity-100 scale-100 blur-none"}`}
          placeholder="0.00"
          readOnly={!isInput}
          title={!isInput && displayAmount ? displayAmount : undefined}
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
        <span
          className={`text-zinc-600 transition-all duration-300 ${isUpdating && !isInput ? "opacity-40" : "opacity-100"}`}
        >
          {displayAmount && parseFloat(displayAmount) > 0
            ? usdRate !== null && usdRate > 0
              ? `≈ $${(parseFloat(displayAmount) * usdRate).toFixed(2)}`
              : "≈ $0.00"
            : "≈ $0.00"}
        </span>

        {isInput && isWalletDisconnected ? (
          <span className="text-red-400/80 transition-colors flex items-center gap-1">
            Wallet disconnected
          </span>
        ) : (
          isInput &&
          balance !== null && (
            <span
              className={`cursor-pointer hover:underline decoration-zinc-500 underline-offset-2 transition-colors flex items-center gap-1 ${
                isInsufficientBalance ? "text-red-400/80" : "text-zinc-500"
              }`}
              onClick={handleMaxClick}
              title={
                actualBalance !== null && actualBalance !== balance
                  ? `Real balance: ${parseFloat(actualBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}`
                  : undefined
              }
            >
              Balance:{" "}
              {parseFloat(balance).toLocaleString(undefined, {
                maximumFractionDigits: 4,
              })}
              {actualBalance !== null &&
                parseFloat(actualBalance) !== parseFloat(balance) && (
                  <span className="text-[10px] opacity-70">(Simulated)</span>
                )}
            </span>
          )
        )}
      </div>
    </div>
  );
}
