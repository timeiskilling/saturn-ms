import React from "react";
import { useAccounts, useDisconnect, usePhantom } from "@phantom/react-sdk";
import { LogOut, CheckCircle2 } from "lucide-react";

export function CustomWalletProfile() {
  const { isConnected } = usePhantom();
  const { disconnect, isDisconnecting } = useDisconnect();
  const accounts = useAccounts();

  if (!isConnected || !accounts) return null;

  // Grab the first Solana address specifically
  const solAddress = accounts.find((a) => a.addressType === "Solana")?.address;

  // Format it beautifully (e.g. 5x12...3kLq)
  const shortAddress = solAddress
    ? `${solAddress.slice(0, 4)}...${solAddress.slice(-4)}`
    : "Unknown";

  return (
    <div className="flex flex-col w-full p-4 bg-[#1A1A1A] border border-zinc-800/80 rounded-2xl shadow-sm group hover:border-zinc-700/80 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-white/10 shadow-inner" />
            <div className="absolute -bottom-0.5 -right-0.5 bg-[#1A1A1A] rounded-full p-[1px] group-hover:bg-[#1E1E1E] transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 fill-green-400/20" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">
              Connected Wallet
            </span>
            <span className="text-sm text-zinc-100 font-semibold tracking-wide">
              {shortAddress}
            </span>
          </div>
        </div>

        <button
          onClick={() => disconnect()}
          disabled={isDisconnecting}
          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
