import React from "react";

interface MaxButtonProps {
  onClick: () => void;
}

export function MaxButton({ onClick }: MaxButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center h-7 px-3 rounded-2xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
      title="Max Balance"
    >
      Max
    </button>
  );
}
