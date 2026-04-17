import React from "react";

interface LinkButtonProps {
  onVerify: () => void;
  isVerifying: boolean;
  className?: string;
}

export function LinkButton({
  onVerify,
  isVerifying,
  className = "",
}: LinkButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onVerify();
      }}
      disabled={isVerifying}
      className={`px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors uppercase tracking-wider disabled:opacity-50 ${className}`}
    >
      {isVerifying ? "Verifying..." : "Verify"}
    </button>
  );
}
