import React from "react";
import { Wallet } from "lucide-react";
import { type AccountInfo } from "./types";
import { useDiscoveredWallets } from "@phantom/react-sdk";

interface ProfileButtonProps {
  allAccounts: AccountInfo[];
  onClick: () => void;
}

export function ProfileButton({ allAccounts, onClick }: ProfileButtonProps) {
  const { wallets } = useDiscoveredWallets();

  const getWalletIconById = (walletId: string) => {
    const foundWallet = wallets.find((w) => w.id === walletId);
    return foundWallet?.icon;
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 py-1.5 px-3 bg-zinc-900 border border-zinc-800 rounded-full shadow-sm hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center gap-1.5">
        {allAccounts.map((acc, i) => {
          const icon = acc.icon || getWalletIconById(acc.walletId);
          return icon ? (
            <img
              key={i}
              src={icon}
              alt={acc.addressType}
              className="w-5 h-5 rounded-md object-cover bg-white"
            />
          ) : (
            <div
              key={i}
              className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center shrink-0"
            >
              <span className="text-[10px] font-bold text-zinc-400">
                {acc.addressType.charAt(0).toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
      <span className="text-[15px] text-zinc-100 font-medium tracking-wide px-1">
        My Wallets
      </span>
      <Wallet className="w-5 h-5 text-zinc-300" />
    </button>
  );
}
