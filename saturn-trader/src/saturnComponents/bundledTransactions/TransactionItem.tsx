import React, { useRef, useState } from "react";
import { Trash2, Settings } from "lucide-react";
import { BasicCard } from "../card";
import { SwapButton } from "../../components/ui/swap-button";
import {
  type TransactionInstruction,
  type QuoteOptions,
  POPULAR_TOKENS,
} from "./types";
import { useTokenAccounts } from "@/hooks/useTokenAccounts";
import { useTokenList } from "@/hooks/useTokenList";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { TokenInputBlock } from "./transactionItem/TokenInputBlock";
import { AdvancedSettings } from "./transactionItem/AdvancedSettings";
import { AdvancedSettings as AdvancedSettingsV2 } from "./transactionItem/SettingsV2";

interface TransactionItemProps {
  tx: TransactionInstruction;
  index: number;
  isLast: boolean;
  handleUpdateTx: (
    txId: string,
    field: keyof TransactionInstruction,
    value: any,
  ) => void;
  handleUpdateOptions: (
    txId: string,
    field: keyof QuoteOptions,
    value: any,
  ) => void;
  handleRemoveTx: (txId: string) => void;
  handleSwapTxTokens: (txId: string, newAmount?: string) => void;
}

export function TransactionItem({
  tx,
  index,
  isLast,
  handleUpdateTx,
  handleUpdateOptions,
  handleRemoveTx,
  handleSwapTxTokens,
}: TransactionItemProps) {
  const { tokens: ownedTokens } = useTokenAccounts();
  const { tokens: allTokens } = useTokenList();

  const inputTokenSymbol =
    allTokens.find((t) => t.mint === tx.inputMint)?.symbol ||
    POPULAR_TOKENS.find((t) => t.mint === tx.inputMint)?.symbol;
  const outputTokenSymbol =
    allTokens.find((t) => t.mint === tx.outputMint)?.symbol ||
    POPULAR_TOKENS.find((t) => t.mint === tx.outputMint)?.symbol;

  const inputPriceData = useTokenPrice(inputTokenSymbol);
  const outputPriceData = useTokenPrice(outputTokenSymbol);

  let calculatedOutputAmount = "";
  if (
    tx.amount &&
    parseFloat(tx.amount) > 0 &&
    inputPriceData?.price &&
    outputPriceData?.price
  ) {
    const inUsd = parseFloat(tx.amount) * inputPriceData.price;
    const outAmount = inUsd / outputPriceData.price;
    calculatedOutputAmount = outAmount.toFixed(9).replace(/\.?0+$/, "");
  }

  const [showSettings, setShowSettings] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const maxDecimals =
    POPULAR_TOKENS.find((t) => t.mint === tx.inputMint)?.decimals ??
    ownedTokens?.find((t) => t.mint === tx.inputMint)?.decimals ??
    9;

  const inputTokenBalance =
    ownedTokens?.find((t) => t.mint === tx.inputMint)?.balance ?? null;

  const handleSwapTokens = () => {
    handleSwapTxTokens(tx.id, calculatedOutputAmount);
  };

  return (
    <div className="relative flex group">
      {/* Step Number Line */}
      <div className="flex flex-col items-center mr-4 w-8 shrink-0 relative">
        <div className="w-8 h-8 mt-2 rounded-full bg-[#141414] border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 shadow-sm z-10 relative group-hover:border-zinc-700 group-hover:text-zinc-300 transition-colors">
          {index + 1}
        </div>
        {!isLast && (
          <div className="absolute top-10 -bottom-6 w-[2px] bg-zinc-800/80 group-hover:bg-zinc-700/80 transition-colors" />
        )}
      </div>

      {/* Transaction Card */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex justify-end items-center mb-2 px-1">
          <div className="flex items-center gap-3">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
                console.log("clicked");
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Advanced Settings
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleRemoveTx(tx.id)}
              className="text-zinc-500 hover:text-red-400 transition-colors p-1"
              title="Remove Transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showSettings && (
          <AdvancedSettingsV2
            options={tx.options}
            onUpdateOptions={(field, value) =>
              handleUpdateOptions(tx.id, field, value)
            }
            onClose={() => setShowSettings(false)}
            slippageBps={tx.slippageBps}
            onSlippageChange={(bps) =>
              handleUpdateTx(tx.id, "slippageBps", bps)
            }
            // triggerRef={buttonRef}
          />
        )}

        <BasicCard className="bg-[#141414] border-zinc-800 shadow-lg p-3">
          {/* Horizontal layout for From / To */}
          <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-4 relative">
            <div className="flex-1">
              <TokenInputBlock
                label="From"
                amount={tx.amount}
                onAmountChange={(val) => handleUpdateTx(tx.id, "amount", val)}
                mint={tx.inputMint}
                onMintChange={(val) => handleUpdateTx(tx.id, "inputMint", val)}
                isInput={true}
                maxDecimals={maxDecimals}
                balance={inputTokenBalance}
                usdRate={inputPriceData?.price ?? null}
              />
            </div>

            <div className="flex items-center justify-center -my-3 md:my-0 md:-mx-3 z-10">
              <SwapButton onClick={handleSwapTokens} />
            </div>

            <div className="flex-1">
              <TokenInputBlock
                label="To"
                amount={calculatedOutputAmount} // Calculated output amount
                onAmountChange={() => {}} // Usually calculated, so read-only for now
                mint={tx.outputMint}
                onMintChange={(val) => handleUpdateTx(tx.id, "outputMint", val)}
                isInput={false}
                maxDecimals={9}
                balance={null}
                usdRate={outputPriceData?.price ?? null}
              />
            </div>
          </div>
        </BasicCard>
      </div>
    </div>
  );
}
