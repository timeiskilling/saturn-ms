import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { simulateBundle } from "@/api/bundle";
import { motion, AnimatePresence } from "framer-motion";
import BigNumber from "bignumber.js";

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
    if (!showSimulation) return;

    if (!amount || parseFloat(amount) <= 0 || !calculatedOutputAmount) {
      setSimulation(null);
      return;
    }

    let isActive = true;

    const runSimulation = async () => {
      setIsSimulating(true);

      try {
        const inputAmountInt = new BigNumber(amount)
          .shiftedBy(maxDecimals)
          .integerValue(BigNumber.ROUND_DOWN)
          .toNumber();

        const expectedOutputInt = new BigNumber(calculatedOutputAmount)
          .shiftedBy(outputMaxDecimals)
          .integerValue(BigNumber.ROUND_DOWN)
          .toNumber();

        const res = await simulateBundle({
          swaps: [
            {
              id: txId,
              inputMint,
              inputAmount: inputAmountInt,
              outputMint,
              expectedOutput: expectedOutputInt,
              slippageBps: slippageBps || 50,
            },
          ],
        });

        const firstSwap = res?.swaps?.[0];

        if (isActive && firstSwap) {
          const maxOutputDecimals =
            outputMaxDecimals > 6 ? 6 : outputMaxDecimals;

          const parseSafeString = (val: any): string => {
            return val?.toString() || "0";
          };

          setSimulation({
            minimumOutput: new BigNumber(
              parseSafeString(firstSwap.minimumOutput),
            )
              .shiftedBy(-outputMaxDecimals)
              .decimalPlaces(maxOutputDecimals, BigNumber.ROUND_DOWN)
              .toString(),

            networkFee: new BigNumber(
              parseSafeString(firstSwap.networkFeeLamports),
            )
              .shiftedBy(-9)
              .decimalPlaces(6, BigNumber.ROUND_DOWN)
              .toString(),

            jitoTip: new BigNumber(parseSafeString(firstSwap.jitoTipLamports))
              .shiftedBy(-9)
              .decimalPlaces(6, BigNumber.ROUND_DOWN)
              .toString(),
          });
        }
      } catch (e) {
        if (isActive) {
          console.error("Simulation error", e);
          setSimulation(null);
        }
      } finally {
        if (isActive) {
          setIsSimulating(false);
        }
      }
    };
    const debounce = setTimeout(runSimulation, 1000);

    return () => {
      isActive = false;
      clearTimeout(debounce);
    };
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
        <span className="flex items-center gap-2">Transaction Details</span>
        {showSimulation ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {showSimulation && (
        <AnimatePresence mode="wait">
          <motion.div
            key={simulation ? "loaded" : "loading"}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden"
          >
            <div className="space-y-2 text-xs text-zinc-400 bg-zinc-900/30 rounded-lg p-3 border border-zinc-800/50">
              {isSimulating || !simulation ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.05,
                        duration: 0.2,
                      }}
                      className="flex justify-between items-center"
                    >
                      <div className="relative overflow-hidden rounded bg-zinc-800/80 h-3 w-24">
                        <motion.div
                          className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent"
                          animate={{
                            x: ["0%", "200%"],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.2,
                            ease: "linear",
                          }}
                        />
                      </div>

                      <div className="relative overflow-hidden rounded bg-zinc-800/80 h-3 w-16">
                        <motion.div
                          className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent"
                          animate={{
                            x: ["0%", "200%"],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.2,
                            ease: "linear",
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
