import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Info, ArrowRight, Percent, Layers3 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { type Template, type TransactionInstruction } from "./types";
import { TokenIcon } from "../TokenIcon";
import { useTokenList } from "@/hooks/useTokenList";
import { POPULAR_TOKENS } from "./types";

interface TemplateRecapProps {
  template: Template;
  getTokenSymbol: (mint: string) => string;
}

type PopoverPosition = {
  top?: number;
  bottom?: number;
  left: number;
  maxHeight: number;
  isUp: boolean;
};

export function TemplateRecap({
  template,
  getTokenSymbol,
}: TemplateRecapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPosition | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { tokens: allTokens } = useTokenList();

  const getTokenDetails = (mint: string) => {
    return (
      allTokens.find((t) => t.mint === mint) ||
      POPULAR_TOKENS.find((t) => t.mint === mint) || {
        mint,
        symbol: getTokenSymbol(mint),
      }
    );
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      const isUp = spaceBelow < 350 && spaceAbove > spaceBelow;

      const dropdownWidth = 320;
      let left = rect.left + rect.width / 2 - dropdownWidth / 2;

      left = Math.max(16, Math.min(left, viewportWidth - dropdownWidth - 16));

      setPos({
        top: isUp ? undefined : rect.bottom + 8,
        bottom: isUp ? viewportHeight - rect.top + 8 : undefined,
        left,
        maxHeight: Math.max(200, (isUp ? spaceAbove : spaceBelow) - 24),
        isUp,
      });
    }
    setIsOpen((prev) => !prev);
  };

  const instructions: TransactionInstruction[] = template.transactions || [];

  const dropdown = (
    <AnimatePresence>
      {isOpen && pos && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.96, y: pos.isUp ? 8 : -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: pos.isUp ? 8 : -8 }}
          transition={{ duration: 0.16 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            maxHeight: Math.min(500, pos.maxHeight),
          }}
          className="
            flex flex-col
            w-70 md:w-[320px]
            rounded-2xl
            border border-zinc-800
            bg-[#090909]/98
            backdrop-blur-xl
            shadow-2xl
            overflow-hidden
          "
        >
          <div className="shrink-0 flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-zinc-200">
                Execution Steps
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {instructions.length} step{instructions.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2 scrollbar-hide">
            {instructions.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-600">
                Empty template
              </div>
            ) : (
              instructions.map((ix, idx) => {
                const inputToken = getTokenDetails(ix.inputMint);
                const outputToken = getTokenDetails(ix.outputMint);

                const amountDisplay = ix.amount?.includes("%")
                  ? ix.amount
                  : `${ix.amount}`;

                const slippage =
                  typeof ix.slippageBps === "number"
                    ? (ix.slippageBps / 100).toFixed(2)
                    : "0.50";

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-zinc-800/50 pb-2">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-semibold">
                        Step {idx + 1}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-orange-400 font-mono font-medium">
                        <Percent className="w-3 h-3" />
                        {slippage}%
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      {/* FROM */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 mb-1.5">
                          From
                        </span>
                        <div className="flex items-center gap-1.5">
                          <TokenIcon
                            token={inputToken as any}
                            className="w-4 h-4 rounded-full bg-zinc-800 shrink-0 text-[8px] flex items-center justify-center font-bold text-zinc-400 overflow-hidden shadow-sm"
                          />
                          <span className="text-xs md:text-sm font-semibold text-zinc-100 truncate">
                            {inputToken.symbol}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-blue-400 mt-1 truncate max-w-full">
                          {amountDisplay}
                        </span>
                      </div>

                      <div className="flex items-center justify-center pt-3 shrink-0 mx-1">
                        <div className="w-6 h-6 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                      </div>

                      <div className="flex flex-col items-end text-right min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 mb-1.5">
                          To
                        </span>
                        <div className="flex items-center gap-1.5 flex-row-reverse">
                          <TokenIcon
                            token={outputToken as any}
                            className="w-4 h-4 rounded-full bg-zinc-800 shrink-0 text-[8px] flex items-center justify-center font-bold text-zinc-400 overflow-hidden shadow-sm"
                          />
                          <span className="text-xs md:text-sm font-semibold text-zinc-100 truncate">
                            {outputToken.symbol}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 mt-1 truncate max-w-full">
                          Market
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative flex items-center">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`p-1.5 rounded-md transition-colors ${
          isOpen
            ? "text-blue-400 bg-blue-500/15"
            : "text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"
        }`}
        title="Execution Recap"
      >
        <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </button>

      {typeof window !== "undefined" &&
        ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
}
