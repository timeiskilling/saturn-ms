import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Wallet,
  History,
  Activity,
  ArrowRight,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { type AccountInfo } from "./types";
import { WalletDropdown } from "./WalletDropdown";
import { useAllWalletsBalances } from "../../../hooks/useAllWalletsBalances";
import { type TransactionHistoryRecord } from "../../../api/history";
import { TokenIcon } from "@/saturnComponents/TokenIcon";

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

// Helper to shorten mint addresses for display
function shortMint(mint: string) {
  if (!mint || mint.length < 8) return mint;
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
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
  const { balances } = useAllWalletsBalances();

  const verifiedCount = useMemo(
    () =>
      allAccounts.filter(
        (a) => a.isVerified || verificationStatus[a.address] === "Verified!",
      ).length,
    [allAccounts, verificationStatus],
  );

  if (!showModal) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex justify-end p-3 sm:p-4 transition-all duration-300 ease-out ${
        isOpen && !isClosing
          ? "bg-black/70 backdrop-blur-md"
          : "bg-transparent backdrop-blur-none pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-104 h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ease-out ${
          isOpen && !isClosing
            ? "translate-x-0 opacity-100"
            : "translate-x-[110%] opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(160deg, #141414 0%, #111111 60%, #0e0e0e 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 80px -12px rgba(0,0,0,0.9), 0 0 40px -10px rgba(0,0,0,0.6)",
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0 border-b border-white/4">
          <div>
            <h3 className="text-[17px] font-semibold text-zinc-100 tracking-tight">
              My Wallets
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Manage your connected accounts
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-white/6 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
          {/* Portfolio summary */}
          <div
            className="rounded-xl p-4 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* decorative bg icon */}
            <Wallet className="absolute right-3 top-3 w-16 h-16 text-white/2.5 rotate-12 pointer-events-none" />

            <div className="grid grid-cols-2 gap-2.5 relative z-10">
              <div
                className="rounded-lg px-3 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span className="block text-[9px] text-zinc-500 uppercase font-semibold tracking-widest mb-1">
                  Active Wallets
                </span>
                <span className="text-base font-bold text-zinc-200">
                  {allAccounts.length}
                </span>
              </div>
              <div
                className="rounded-lg px-3 py-2.5"
                style={{
                  background: "rgba(52, 211, 153, 0.04)",
                  border: "1px solid rgba(52, 211, 153, 0.1)",
                }}
              >
                <span className="block text-[9px] text-emerald-600 uppercase font-semibold tracking-widest mb-1">
                  Verified
                </span>
                <span className="text-base font-bold text-emerald-400">
                  {verifiedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Connected wallets */}
          <section>
            <div className="flex items-center gap-2 mb-2 px-0.5">
              <span className="text-[9px] uppercase tracking-[0.12em] font-bold text-zinc-600">
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
          </section>

          {/* Transaction history */}
          <section>
            <div className="flex items-center gap-2 mb-2 px-0.5">
              <History className="w-3 h-3 text-zinc-600" />
              <span className="text-[9px] uppercase tracking-[0.12em] font-bold text-zinc-600">
                Transaction History
              </span>
              {history.length > 0 && (
                <span
                  className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {history.length}
                </span>
              )}
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Activity className="w-5 h-5 text-zinc-600 animate-spin" />
                  <span className="text-[11px] text-zinc-600">
                    Loading history…
                  </span>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <TrendingUp className="w-5 h-5 text-zinc-700" />
                  <span className="text-[11px] text-zinc-600">
                    No transactions yet
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-white/3">
                  {history.map((tx) => (
                    <TxRow key={tx.id} tx={tx} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
function TxRow({ tx }: { tx: TransactionHistoryRecord }) {
  const date = new Date(tx.transaction_date);
  const dateStr = date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="px-3 py-3 flex flex-col gap-2.5 hover:bg-white/2 transition-colors group">
      {/* top row: date + solscan */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] text-zinc-400 font-medium tabular-nums">
            {dateStr}
          </span>
          <span className="text-[10px] text-zinc-600 tabular-nums">
            {timeStr}
          </span>
        </div>
        <a
          href={`https://solscan.io/tx/${tx.tx_signature}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[10px] font-semibold text-zinc-600 hover:text-blue-400 transition-colors uppercase tracking-wider"
        >
          Solscan
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TokenIcon
            token={{
              mint: tx.input_mint,
              symbol: `${tx.input_mint.slice(0, 4)}`,
            }}
            className="w-7 h-7 rounded-full shrink-0 ring-1 ring-white/10"
          />
          <div className="flex flex-col min-w-0">
            <span
              className="text-[11px] font-bold text-zinc-300 truncate"
              title={tx.input_mint}
            >
              {tx.input_mint.slice(0, 4)}…{tx.input_mint.slice(-4)}
            </span>
            {tx.amount && (
              <span className="text-[10px] text-zinc-600 tabular-nums">
                {Number(tx.amount).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* arrow */}
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </div>

        {/* to token */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <div className="flex flex-col items-end min-w-0">
            <span
              className="text-[11px] font-bold text-zinc-300 truncate"
              title={tx.output_mint}
            >
              {tx.output_mint.slice(0, 4)}…{tx.output_mint.slice(-4)}
            </span>
          </div>
          <TokenIcon
            token={{
              mint: tx.output_mint,
              symbol: `${tx.output_mint.slice(0, 4)}`,
            }}
            className="w-7 h-7 rounded-full shrink-0 ring-1 ring-white/10"
          />
        </div>
      </div>
    </div>
  );
}
