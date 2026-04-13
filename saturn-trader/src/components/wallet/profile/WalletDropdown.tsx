import React from "react";
import { ChevronDown, Plus } from "lucide-react";
import { type AccountInfo } from "./types";
import { WalletDropdownItem } from "./WalletDropdownItem";

interface WalletDropdownProps {
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
}

export function WalletDropdown({
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
}: WalletDropdownProps) {
  return (
    <div className="relative flex flex-col bg-[#242424] rounded-2xl border border-zinc-800/80 transition-all z-20">
      <button
        onClick={() => setIsWalletExpanded(!isWalletExpanded)}
        className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors rounded-2xl w-full"
      >
        <div className="flex items-center gap-2">
          {allAccounts.map((acc, i) => {
            const icon = acc.icon || getWalletIconById(acc.walletId);
            return icon ? (
              <img
                key={i}
                src={icon}
                alt={acc.addressType}
                className="w-6 h-6 rounded-md object-cover bg-white"
              />
            ) : (
              <div
                key={i}
                className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center shrink-0"
              >
                <span className="text-[10px] font-bold text-zinc-400">
                  {acc.addressType.charAt(0).toUpperCase()}
                </span>
              </div>
            );
          })}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onConnectAnother();
            }}
            className="w-6 h-6 rounded-md border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-300">
            {allAccounts.length}{" "}
            <span className="text-zinc-500">
              {allAccounts.length === 1 ? "Wallet" : "Wallets"}
            </span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
              isWalletExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`absolute left-0 right-0 top-[calc(100%+0.5rem)] bg-[#242424] border border-zinc-800/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-200 origin-top z-50 ${
          isWalletExpanded
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="p-2 flex flex-col gap-1 max-h-75 overflow-y-auto scrollbar-hide">
          {allAccounts.map((account, index) => {
            const isPrimary = index === 0;
            const isVerified =
              account.isVerified ||
              verificationStatus[account.address] === "Verified!";
            const isActive = account.walletId === user?.walletId;
            const icon = account.icon || getWalletIconById(account.walletId);

            return (
              <WalletDropdownItem
                key={`${account.address}-${index}`}
                account={account}
                index={index}
                isActive={isActive}
                isPrimary={isPrimary}
                isVerified={isVerified}
                icon={icon}
                verificationStatus={verificationStatus}
                onVerify={onVerify}
                onClose={onClose}
                onRemove={onRemove}
              />
            );
          })}

          <button
            onClick={onConnectAnother}
            className="flex items-center gap-3 p-3 mt-1 rounded-xl hover:bg-zinc-800/50 transition-colors group text-zinc-400 hover:text-zinc-200"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-semibold">
              Connect Another Wallet
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
