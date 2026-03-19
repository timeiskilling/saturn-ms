import React, { useState } from "react";
import { Trash2, Settings } from "lucide-react";
import { BasicCard } from "../card";
import { SwapButton } from "../../components/ui/swap-button";
import {
  type TransactionInstruction,
  type QuoteOptions,
  POPULAR_TOKENS,
} from "./types";
import { useTokenAccounts } from "@/hooks/useTokenAccounts";
import { TokenInputBlock } from "./transactionItem/TokenInputBlock";
import { AdvancedSettings } from "./transactionItem/AdvancedSettings";

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
  handleSwapTxTokens: (txId: string) => void;
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
  const [showSettings, setShowSettings] = useState(false);

  const maxDecimals =
    POPULAR_TOKENS.find((t) => t.mint === tx.inputMint)?.decimals ??
    ownedTokens?.find((t) => t.mint === tx.inputMint)?.decimals ??
    9;

  const inputTokenBalance =
    ownedTokens?.find((t) => t.mint === tx.inputMint)?.balance ?? null;

  const handleSwapTokens = () => {
    handleSwapTxTokens(tx.id);
  };

  return (
    <div className="relative flex group">
      {/* Step Number Line */}
      <div className="flex flex-col items-center mr-4 w-8 shrink-0">
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 shadow-sm z-10">
          {index + 1}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-zinc-800 -my-1" />}
      </div>

      {/* Transaction Card */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex justify-end items-center mb-2 px-1">
          <div className="flex items-center gap-3">
            <button
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
          <AdvancedSettings
            options={tx.options}
            onUpdateOptions={(field, value) =>
              handleUpdateOptions(tx.id, field, value)
            }
            onClose={() => setShowSettings(false)}
            slippageBps={tx.slippageBps}
            onSlippageChange={(bps) =>
              handleUpdateTx(tx.id, "slippageBps", bps)
            }
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
              />
            </div>

            <div className="flex items-center justify-center -my-3 md:my-0 md:-mx-3 z-10">
              <SwapButton onClick={handleSwapTokens} />
            </div>

            <div className="flex-1">
              <TokenInputBlock
                label="To"
                amount={tx.amount} // Read-only or placeholder for 'To' side
                onAmountChange={() => {}} // Usually calculated, so read-only for now
                mint={tx.outputMint}
                onMintChange={(val) => handleUpdateTx(tx.id, "outputMint", val)}
                isInput={false}
                maxDecimals={9}
                balance={null}
              />
            </div>
          </div>
        </BasicCard>
      </div>
    </div>
  );
}
