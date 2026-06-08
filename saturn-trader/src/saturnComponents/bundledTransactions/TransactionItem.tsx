import React, { useRef, useState } from "react";
import { Trash2, Settings } from "lucide-react";
import { BasicCard } from "../card";
import { SwapButton } from "../../components/ui/swap-button";
import {
  type TransactionInstruction,
  type QuoteOptions,
  POPULAR_TOKENS,
} from "./types";
import { useAllWalletsBalances } from "@/hooks/useAllWalletsBalances";
import { useTokenList } from "@/hooks/useTokenList";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { TokenInputBlock } from "./transactionItem/TokenInputBlock";
import { AdvancedSettings as AdvancedSettingsV2 } from "./transactionItem/SettingsV2";
import { TransactionSimulationDetails } from "./transactionItem/TransactionSimulationDetails";

interface TransactionItemProps {
  tx: TransactionInstruction;
  transactions: TransactionInstruction[];
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

export const TransactionItem = React.memo(function TransactionItem({
  tx,
  transactions,
  index,
  isLast,
  handleUpdateTx,
  handleUpdateOptions,
  handleRemoveTx,
  handleSwapTxTokens,
}: TransactionItemProps) {
  const { balances, loading } = useAllWalletsBalances();
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
    outputPriceData?.price &&
    inputPriceData.price > 0 &&
    outputPriceData.price > 0
  ) {
    const inUsd = parseFloat(tx.amount) * inputPriceData.price;
    const outAmount = inUsd / outputPriceData.price;
    calculatedOutputAmount = outAmount.toFixed(9).replace(/\.?0+$/, "");
  }

  React.useEffect(() => {
    if (tx.calculatedOutput !== calculatedOutputAmount) {
      handleUpdateTx(tx.id, "calculatedOutput", calculatedOutputAmount);
    }
  }, [calculatedOutputAmount, handleUpdateTx, tx.id, tx.calculatedOutput]);

  const [showSettings, setShowSettings] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const connectedAddresses = React.useMemo(
    () => Object.values(balances).map((w) => w.address),
    [balances],
  );

  const activeWalletAddress =
    tx.userPk && connectedAddresses.includes(tx.userPk)
      ? tx.userPk
      : connectedAddresses[0];

  React.useEffect(() => {
    if (
      !loading &&
      connectedAddresses.length > 0 &&
      tx.userPk &&
      !connectedAddresses.includes(tx.userPk)
    ) {
      handleUpdateTx(tx.id, "userPk", connectedAddresses[0]);
    }
  }, [tx.userPk, connectedAddresses, handleUpdateTx, tx.id, loading]);

  const maxDecimals =
    POPULAR_TOKENS.find((t) => t.mint === tx.inputMint)?.decimals ??
    (activeWalletAddress && balances
      ? Object.values(balances)
          .find((w) => w.address === activeWalletAddress)
          ?.tokens.find((t) => t.mint === tx.inputMint)?.decimals
      : null) ??
    9;

  const outputMaxDecimals =
    POPULAR_TOKENS.find((t) => t.mint === tx.outputMint)?.decimals ??
    (activeWalletAddress && balances
      ? Object.values(balances)
          .find((w) => w.address === activeWalletAddress)
          ?.tokens.find((t) => t.mint === tx.outputMint)?.decimals
      : null) ??
    9;

  let actualInputTokenBalance: string | null = null;
  if (activeWalletAddress && balances) {
    const activeWallet = Object.values(balances).find(
      (w) => w.address === activeWalletAddress,
    );
    if (activeWallet) {
      if (tx.inputMint === "So11111111111111111111111111111111111111112") {
        actualInputTokenBalance =
          activeWallet.solBalance !== null
            ? activeWallet.solBalance.toString()
            : "0";
      } else {
        const token = activeWallet.tokens.find((t) => t.mint === tx.inputMint);
        if (token) {
          actualInputTokenBalance = token.balance;
        } else {
          actualInputTokenBalance = "0";
        }
      }
    }
  }

  let inputTokenBalance = actualInputTokenBalance;

  if (actualInputTokenBalance !== null && transactions) {
    const parseAmount = (val: string | number | undefined | null) => {
      if (!val) return 0;
      if (typeof val === "number") return val;
      const cleaned = val.replace(/,/g, "");
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    let simulatedBalance = parseAmount(actualInputTokenBalance);
    for (let i = 0; i < index; i++) {
      const prevTx = transactions[i];
      if (!prevTx) continue;
      const prevTxWallet = prevTx.userPk || Object.values(balances)[0]?.address;
      if (prevTxWallet === activeWalletAddress) {
        if (prevTx.inputMint === tx.inputMint) {
          simulatedBalance -= parseAmount(
            prevTx.amount ??
              (prevTx as any).inputAmount ??
              (prevTx as any).inputValue,
          );
        }
        if (
          prevTx.outputMint === tx.inputMint &&
          (prevTx.calculatedOutput ?? (prevTx as any).outputAmount)
        ) {
          simulatedBalance += parseAmount(
            prevTx.calculatedOutput ?? (prevTx as any).outputAmount,
          );
        }
      }
    }
    inputTokenBalance = Math.max(0, simulatedBalance).toString();
  }

  const handleSwapTokens = () => {
    handleSwapTxTokens(tx.id, calculatedOutputAmount);
  };

  return (
    <div className="relative flex group">
      {/* Step Number Line */}
      <div className="flex flex-col items-center mr-2 md:mr-4 w-6 md:w-8 shrink-0 relative">
        <div className="w-6 h-6 md:w-8 md:h-8 mt-2 rounded-full bg-[#141414] border border-zinc-800 flex items-center justify-center text-[10px] md:text-xs font-bold text-zinc-500 shadow-sm z-10 relative group-hover:border-zinc-700 group-hover:text-zinc-300 transition-colors">
          {index + 1}
        </div>
        {!isLast && (
          <div className="absolute top-8 md:top-10 -bottom-6 w-0.5 bg-zinc-800/80 group-hover:bg-zinc-700/80 transition-colors" />
        )}
      </div>

      {/* Transaction Card */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex justify-end items-center mb-1.5 md:mb-2 px-1">
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
            optionalDestination={tx.optionalDestination}
            onDestinationChange={(dest) =>
              handleUpdateTx(tx.id, "optionalDestination", dest)
            }
            // triggerRef={buttonRef}
          />
        )}

        <BasicCard className="bg-[#141414] border-zinc-800 shadow-lg p-2 md:p-3">
          {/* Horizontal layout for From / To */}
          <div className="flex flex-col lg:flex-row items-stretch gap-2 lg:gap-4 relative">
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
                actualBalance={actualInputTokenBalance}
                usdRate={
                  inputPriceData?.price && inputPriceData.price > 0
                    ? inputPriceData.price
                    : null
                }
                transactions={transactions}
                index={index}
                walletAddress={activeWalletAddress}
                onWalletChange={(address) =>
                  handleUpdateTx(tx.id, "userPk", address)
                }
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
                maxDecimals={outputMaxDecimals}
                balance={null}
                usdRate={
                  outputPriceData?.price && outputPriceData.price > 0
                    ? outputPriceData.price
                    : null
                }
                transactions={transactions}
                index={index}
                walletAddress={activeWalletAddress}
                onWalletChange={(address) =>
                  handleUpdateTx(tx.id, "userPk", address)
                }
              />
            </div>
          </div>{" "}
          <TransactionSimulationDetails
            txId={tx.id}
            amount={tx.amount || "0"}
            calculatedOutputAmount={calculatedOutputAmount}
            slippageBps={tx.slippageBps || 50}
            inputMint={tx.inputMint}
            outputMint={tx.outputMint}
            maxDecimals={maxDecimals}
            outputMaxDecimals={outputMaxDecimals}
            outputTokenSymbol={outputTokenSymbol || ""}
          />
        </BasicCard>
      </div>
    </div>
  );
});
