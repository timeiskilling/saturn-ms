import React from "react";
import { ArrowRight, Zap, Trash2 } from "lucide-react";
import { BasicCard } from "../card";
import { type TransactionInstruction, type QuoteOptions } from "./types";
import { TokenSelect } from "./TokenSelect";

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
}

export function TransactionItem({
  tx,
  index,
  isLast,
  handleUpdateTx,
  handleUpdateOptions,
  handleRemoveTx,
}: TransactionItemProps) {
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
      <BasicCard className="flex-1 bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 transition-colors shadow-lg shadow-black/20 group-hover:shadow-black/40 overflow-visible">
        <div className="p-5">
          {/* Top Row: Mints */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                Input Mint (From)
              </label>
              <TokenSelect
                value={tx.inputMint}
                onChange={(value) => handleUpdateTx(tx.id, "inputMint", value)}
                isInput={true}
              />
            </div>

            <div className="mt-6">
              <ArrowRight className="w-5 h-5 text-zinc-600" />
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                Output Mint (To)
              </label>
              <TokenSelect
                value={tx.outputMint}
                onChange={(value) => handleUpdateTx(tx.id, "outputMint", value)}
              />
            </div>
          </div>

          {/* Bottom Row: Details */}
          <div className="flex items-end gap-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                Amount (Raw Units)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={tx.amount}
                onChange={(e) =>
                  handleUpdateTx(
                    tx.id,
                    "amount",
                    e.target.value.replace(/[^0-9]/g, ""),
                  )
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 transition-colors font-mono"
                placeholder="e.g. 1000000"
              />
            </div>

            <div className="w-32">
              <label
                className={`block text-xs font-medium mb-1.5 transition-colors ${
                  tx.options?.dynamicSlippage
                    ? "text-zinc-700"
                    : "text-zinc-500"
                }`}
              >
                Slippage (BPS)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={!!tx.options?.dynamicSlippage}
                  value={
                    tx.options?.dynamicSlippage ? "" : String(tx.slippageBps)
                  }
                  onChange={(e) =>
                    handleUpdateTx(
                      tx.id,
                      "slippageBps",
                      parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 0,
                    )
                  }
                  className={`w-full border rounded-lg pl-3 pr-8 py-2 text-sm outline-none transition-colors font-mono ${
                    tx.options?.dynamicSlippage
                      ? "bg-zinc-950/50 border-zinc-800/50 text-zinc-600 cursor-not-allowed"
                      : "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-blue-500"
                  }`}
                  placeholder={tx.options?.dynamicSlippage ? "Auto" : "0"}
                />
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors ${
                    tx.options?.dynamicSlippage
                      ? "text-zinc-700"
                      : "text-zinc-500"
                  }`}
                >
                  %
                </span>
              </div>
            </div>

            <div
              className="flex items-center gap-2 h-9.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors"
              onClick={() =>
                handleUpdateOptions(
                  tx.id,
                  "dynamicSlippage",
                  !tx.options?.dynamicSlippage,
                )
              }
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  tx.options?.dynamicSlippage
                    ? "bg-blue-500 border-blue-500"
                    : "bg-zinc-950 border-zinc-700"
                }`}
              >
                {tx.options?.dynamicSlippage && (
                  <Zap className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-xs font-medium text-zinc-300">
                Dynamic Slip
              </span>
            </div>

            <button
              onClick={() => handleRemoveTx(tx.id)}
              className="h-9.5 px-3 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-auto"
              title="Remove Transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </BasicCard>
    </div>
  );
}
