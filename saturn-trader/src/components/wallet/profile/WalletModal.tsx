import React from "react";
import { createPortal } from "react-dom";
import { Sun, RefreshCw, X, ChevronDown, Info } from "lucide-react";
import { type AccountInfo } from "./types";
import { WalletDropdown } from "./WalletDropdown";

interface WalletModalProps {
  showModal: boolean;
  isOpen: boolean;
  isClosing: boolean;
  allAccounts: AccountInfo[];
  isWalletExpanded: boolean;
  setIsWalletExpanded: (expanded: boolean) => void;
  user: any;
  verificationStatus: Record<string, string>;
  getWalletIconById: (walletId: string) => string | undefined;
  onVerify: (address: string, walletId: string) => void;
  onClose: () => void;
  onRemove: (walletId: string) => void;
  onConnectAnother: () => void;
  onClearAll: () => void;
}

export function WalletModal({
  showModal,
  isOpen,
  isClosing,
  allAccounts,
  isWalletExpanded,
  setIsWalletExpanded,
  user,
  verificationStatus,
  getWalletIconById,
  onVerify,
  onClose,
  onRemove,
  onConnectAnother,
  onClearAll,
}: WalletModalProps) {
  if (!showModal) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex justify-end p-4 transition-all duration-300 ease-out ${
        isOpen && !isClosing
          ? "bg-black/60 backdrop-blur-sm"
          : "bg-transparent backdrop-blur-none"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-100 h-[calc(100vh-2rem)] flex flex-col bg-[#1A1A1A] border border-zinc-800 rounded-3xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-transform duration-300 ease-out ${
          isOpen && !isClosing ? "translate-x-0" : "translate-x-[110%]"
        }`}
      >
        <div className="p-6 pb-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-zinc-100">My Wallets</h3>
          <div className="flex items-center gap-4 text-zinc-500">
            <button className="hover:text-zinc-300 transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <button className="hover:text-zinc-300 transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="w-px h-5 bg-zinc-800"></div>
            <button
              onClick={onClose}
              className="hover:text-zinc-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-6 flex flex-col gap-4 flex-1 overflow-y-auto scrollbar-hide">
          <WalletDropdown
            allAccounts={allAccounts}
            isWalletExpanded={isWalletExpanded}
            setIsWalletExpanded={setIsWalletExpanded}
            user={user}
            verificationStatus={verificationStatus}
            getWalletIconById={getWalletIconById}
            onVerify={onVerify}
            onClose={onClose}
            onRemove={onRemove}
            onConnectAnother={onConnectAnother}
            onClearAll={onClearAll}
          />

          <div className="flex items-center gap-6 border-b border-zinc-800 mt-2">
            <button className="pb-2 border-b-2 border-emerald-500 text-sm font-semibold text-emerald-500">
              Assets
            </button>
            <button className="pb-2 border-b-2 border-transparent text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-colors">
              Transactions
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 transition-colors">
              Token: <span className="text-zinc-200">All</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 transition-colors">
              Network: <span className="text-zinc-200">All</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 py-12 flex flex-col items-center justify-center border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-900/30">
            <p className="text-sm text-zinc-500 font-medium">No tokens yet.</p>
          </div>
        </div>

        <div className="p-5 border-t border-zinc-800/50 flex items-center justify-between bg-[#141414] mt-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-zinc-200">
              Missing a CCTP Transfer?
            </span>
            <Info className="w-4 h-4 text-zinc-500" />
          </div>
          <button className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm transition-colors">
            Resume Claim
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
