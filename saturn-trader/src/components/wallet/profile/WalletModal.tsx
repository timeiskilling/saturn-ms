import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import {
  RefreshCw,
  X,
  Info,
  Wallet,
  ShieldCheck,
  ExternalLink,
  History,
  Activity,
  ArrowRight,
} from "lucide-react";
import { type AccountInfo } from "./types";
import { WalletDropdown } from "./WalletDropdown";
import { useAllWalletsBalances } from "../../../hooks/useAllWalletsBalances";
import { type TransactionHistoryRecord } from "../../../api/history";

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
  history: TransactionHistoryRecord[];
  loadingHistory: boolean;
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
  history,
  loadingHistory,
}: WalletModalProps) {
  const { balances, loading, refetch } = useAllWalletsBalances();

  const totalSol = useMemo(() => {
    return Object.values(balances).reduce(
      (acc, curr) => acc + (curr.solBalance || 0),
      0,
    );
  }, [balances]);

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
        <div className="p-6 pb-4 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-zinc-100">My Wallets</h3>
            <span className="text-xs text-zinc-500 font-medium tracking-tight">
              Manage your connected accounts
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 flex flex-col gap-6 flex-1 overflow-y-auto scrollbar-hide py-2">
          {/* Portfolio Summary Card */}
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="w-24 h-24 rotate-12" />
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              <div className="bg-zinc-950/40 rounded-xl p-3 border border-zinc-800/50">
                <span className="block text-[9px] text-zinc-500 uppercase font-bold mb-1">
                  Active Wallets
                </span>
                <span className="text-sm font-bold text-zinc-200">
                  {allAccounts.length}
                </span>
              </div>
              <div className="bg-zinc-950/40 rounded-xl p-3 border border-zinc-800/50">
                <span className="block text-[9px] text-zinc-500 uppercase font-bold mb-1">
                  Verified
                </span>
                <span className="text-sm font-bold text-emerald-500">
                  {
                    allAccounts.filter(
                      (a) =>
                        a.isVerified ||
                        verificationStatus[a.address] === "Verified!",
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                Connected Wallets
              </span>
            </div>
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
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2 px-1">
              <History className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                Transaction History
              </span>
            </div>
            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-2 overflow-hidden flex flex-col gap-2">
              {loadingHistory ? (
                <div className="flex items-center justify-center p-4">
                  <Activity className="w-4 h-4 text-zinc-500 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-xs text-zinc-500 font-medium">
                    No recent transactions
                  </span>
                </div>
              ) : (
                history.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex flex-col p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/50 gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-zinc-400">
                        {new Date(tx.transaction_date).toLocaleString()}
                      </span>
                      <a
                        href={`https://solscan.io/tx/${tx.tx_signature}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1"
                      >
                        Solscan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between mt-1 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-800/30">
                      <div className="flex items-center gap-2 max-w-[40%]">
                        <span
                          className="text-sm font-bold text-zinc-200 truncate"
                          title={tx.input_mint}
                        >
                          {tx.input_mint.slice(0, 4)}...
                          {tx.input_mint.slice(-4)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 shrink-0 text-zinc-500 px-2">
                        <span className="text-[10px] font-bold">
                          {tx.amount}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                      <div className="flex items-center gap-2 max-w-[40%] justify-end">
                        <span
                          className="text-sm font-bold text-zinc-200 truncate"
                          title={tx.output_mint}
                        >
                          {tx.output_mint.slice(0, 4)}...
                          {tx.output_mint.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
