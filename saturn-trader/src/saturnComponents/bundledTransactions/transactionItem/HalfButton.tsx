import React from "react";

interface HalfButtonProps {
  onClick: () => void;
}

export function HalfButton({ onClick }: HalfButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center w-9 h-7 rounded-2xl border border-zinc-800 bg-transparent hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
      title="Half Balance"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 8H13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="8"
          cy="8"
          r="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="#1A1A1A"
        />
      </svg>
    </button>
  );
}
