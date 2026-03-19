import React from "react";
import { ArrowDownUp } from "lucide-react";

interface SwapButtonProps {
  onClick: () => void;
  className?: string;
}

export function SwapButton({ onClick, className = "" }: SwapButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-full bg-[#1A1A1A] border-4 border-[#141414] flex items-center justify-center hover:bg-zinc-800 transition-colors group z-10 ${className}`}
      title="Swap Tokens"
    >
      <ArrowDownUp className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors md:rotate-90" />
    </button>
  );
}
