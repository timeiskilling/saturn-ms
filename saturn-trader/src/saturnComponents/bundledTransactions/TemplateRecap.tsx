import React, { useState } from "react";
import { Info, X, ArrowRight, Layers, Coins } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { type Template, type TransactionInstruction } from "./types";

interface TemplateRecapProps {
  template: Template;
  getTokenSymbol: (mint: string) => string;
}

export function TemplateRecap({
  template,
  getTokenSymbol,
}: TemplateRecapProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
  };

  const instructions: TransactionInstruction[] = template.transactions || [];

  return (
    <>
      <button
        onClick={handleOpen}
        className="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
        title="View Template Details"
      >
        <Info className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center px-4 sm:px-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">
                      {template.name || "Unnamed Template"}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase mt-0.5">
                      Execution Recap
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh] scrollbar-hide space-y-3">
                {instructions.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-sm">
                    No executable steps in this template.
                  </div>
                ) : (
                  instructions.map((ix, idx) => {
                    const inputSymbol = getTokenSymbol(ix.inputMint);
                    const outputSymbol = getTokenSymbol(ix.outputMint);

                    const amountDisplay = ix.amount?.includes("%")
                      ? ix.amount
                      : `${ix.amount}`;

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            Step {idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col flex-1 bg-zinc-950 p-2.5 rounded border border-zinc-800/80">
                            <span className="text-xs text-zinc-500 mb-1">
                              Sell
                            </span>
                            <div className="flex items-center gap-2">
                              <Coins className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="text-sm font-semibold text-zinc-200">
                                {inputSymbol}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-blue-400 mt-1">
                              {amountDisplay}
                            </span>
                          </div>

                          <div className="shrink-0 flex items-center justify-center p-1">
                            <ArrowRight className="w-4 h-4 text-zinc-600" />
                          </div>

                          <div className="flex flex-col flex-1 bg-zinc-950 p-2.5 rounded border border-zinc-800/80">
                            <span className="text-xs text-zinc-500 mb-1">
                              Buy
                            </span>
                            <div className="flex items-center gap-2">
                              <Coins className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="text-sm font-semibold text-zinc-200">
                                {outputSymbol}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-green-400 mt-1">
                              Market Price
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
