import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { simulateBundle } from "@/api/bundle";

interface TransactionSimulationDetailsProps {
  txId: string;
  amount: string;
  calculatedOutputAmount: string;
  slippageBps: number;
  inputMint: string;
  outputMint: string;
  maxDecimals: number;
  outputMaxDecimals: number;
  outputTokenSymbol: string;
}

export function TransactionSimulationDetails({
  txId,
  amount,
  calculatedOutputAmount,
  slippageBps,
  inputMint,
  outputMint,
  maxDecimals,
  outputMaxDecimals,
  outputTokenSymbol,
}: TransactionSimulationDetailsProps) {
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulation, setSimulation] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  React.useEffect(() => {
    const runSimulation = async () => {
      if (!showSimulation) return;

      if (!amount || parseFloat(amount) <= 0 || !calculatedOutputAmount) {
        setSimulation(null);
        return;
      }

      setIsSimulating(true);
      try {
        const inputAmountInt = Math.floor(
          parseFloat(amount) * Math.pow(10, maxDecimals),
        );
        const expectedOutputInt = Math.floor(
          parseFloat(calculatedOutputAmount) * Math.pow(10, outputMaxDecimals),
        );

        const res = await simulateBundle({
          swaps: [
            {
              id: txId,
              inputMint: inputMint,
              inputAmount: inputAmountInt,
              outputMint: outputMint,
              expectedOutput: expectedOutputInt,
              slippageBps: slippageBps || 50,
            },
          ],
        });

        if (res && res.swaps && res.swaps.length > 0) {
          setSimulation({
            minimumOutput: (
              Number(res.swaps[0]?.minimumOutput) /
              Math.pow(10, outputMaxDecimals)
            )
              .toFixed(outputMaxDecimals > 6 ? 6 : outputMaxDecimals)
              .replace(/\.?0+$/, ""),
            networkFee: (Number(res.totalNetworkFeeLamports) / Math.pow(10, 9))
              .toFixed(6)
              .replace(/\.?0+$/, ""),
            jitoTip: (Number(res.jitoTipLamports) / Math.pow(10, 9))
              .toFixed(6)
              .replace(/\.?0+$/, ""),
          });
        }
      } catch (e) {
        console.error("Simulation error", e);
      } finally {
        setIsSimulating(false);
      }
    };

    const debounce = setTimeout(runSimulation, 1500);
    return () => clearTimeout(debounce);
  }, [
    amount,
    calculatedOutputAmount,
    slippageBps,
    inputMint,
    outputMint,
    maxDecimals,
    outputMaxDecimals,
    txId,
    showSimulation,
  ]);

  if (parseFloat(amount || "0") <= 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-zinc-800/50 pt-3">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowSimulation(!showSimulation);
        }}
        className="flex items-center justify-between w-full text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <span className="flex items-center gap-2">
          Transaction Details
          {isSimulating && (
            <span className="animate-pulse text-zinc-500 text-[10px]">
              Calculating...
            </span>
          )}
        </span>
        {showSimulation ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {showSimulation && simulation && (
        <div
          className={`mt-3 space-y-2 text-xs text-zinc-400 bg-zinc-900/30 rounded-lg p-3 border border-zinc-800/50 transition-opacity duration-200 ${
            isSimulating ? "opacity-50" : "opacity-100"
          }`}
        >
          <div className="flex justify-between">
            <span>Minimum Received</span>
            <span className="text-zinc-200 font-mono">
              {simulation.minimumOutput} {outputTokenSymbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Max Slippage</span>
            <span className="text-zinc-200 font-mono">
              {(slippageBps || 50) / 100}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Network Fee</span>
            <span className="text-zinc-200 font-mono">
              {simulation.networkFee} SOL
            </span>
          </div>
          {parseFloat(simulation.jitoTip) > 0 && (
            <div className="flex justify-between">
              <span>Jito Tip (MEV Protection)</span>
              <span className="text-zinc-200 font-mono">
                {simulation.jitoTip} SOL
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
