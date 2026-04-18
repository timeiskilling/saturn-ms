import React from "react";
import { LogOut, Sparkles } from "lucide-react";
import { type AccountInfo } from "./types";
import { useConnect, useDisconnect } from "@phantom/react-sdk";
import { logout } from "../../../api/logout";
import { PromoteButton } from "./PromoteButton";
import { LinkButton } from "./LinkButton";
import { useAllAccounts } from "./useAllAccounts";

interface WalletDropdownItemProps {
  account: AccountInfo;
  index: number;
  isActive: boolean;
  isPrimary: boolean;
  isVerified: boolean;
  icon?: string;
  verificationStatus: Record<string, string>;
  onVerify: (address: string, walletId: string) => void;
  onClose: () => void;
  onRemove: (walletId: string) => void;
  onClearAll: () => void;
}

export function WalletDropdownItem({
  account,
  index,
  isActive,
  isPrimary,
  isVerified,
  icon,
  verificationStatus,
  onVerify,
  onClose,
  onRemove,
  onClearAll,
}: WalletDropdownItemProps) {
  const { connect } = useConnect();
  const { disconnect, isDisconnecting } = useDisconnect();
  const { primaryAccount, user } = useAllAccounts();

  const isPrimaryActive = primaryAccount?.walletId === user?.walletId;

  const accShort = `${account.address.slice(0, 5)}...${account.address.slice(-5)}`;
  const displayType =
    account.addressType === "Ethereum" ? "EVM" : account.addressType;
  const status = verificationStatus[account.address];
  const isVerifying =
    status === "Verifying..." || status === "Checking session...";

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-xl transition-colors group border ${
        isActive
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "border-transparent hover:bg-zinc-800/50"
      }`}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={async () => {
          if (!isActive) {
            try {
              await connect({
                provider: "injected",
                walletId: account.walletId,
              });
            } catch (e: any) {
              console.error("Failed to switch wallet", e);
              alert(
                `Failed to connect to ${account.name}: ${
                  e?.message ||
                  "User rejected request or extension unavailable."
                }`,
              );
            }
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-zinc-700/50">
              {icon ? (
                <img
                  src={icon}
                  alt={account.addressType}
                  className="w-full h-full object-cover bg-white"
                />
              ) : (
                <span className="text-xs font-bold text-zinc-400">
                  {account.addressType.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {isActive && (
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#242424] shadow-sm"></div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className={`text-base font-bold transition-colors ${
                  isActive
                    ? "text-emerald-400"
                    : "text-zinc-100 group-hover:text-white"
                }`}
              >
                {accShort}
              </span>
              {isPrimary ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-400 text-blue-950 uppercase tracking-wider">
                  Primary
                </span>
              ) : isVerified ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                  Linked
                </span>
              ) : null}
              {!isVerified && isActive && isPrimary && (
                <LinkButton
                  onVerify={() => onVerify(account.address, account.walletId)}
                  isVerifying={isVerifying}
                />
              )}
            </div>
            <span
              className={`text-[11px] font-medium ${
                isActive ? "text-emerald-500/60" : "text-zinc-500"
              }`}
            >
              {displayType}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (isActive) {
                if (isPrimary) {
                  await logout();
                  onClearAll();
                } else {
                  onRemove(account.walletId);
                }
                await disconnect();
                onClose();
              } else {
                onRemove(account.walletId);
              }
            }}
            disabled={isDisconnecting && isActive}
            className={`transition-colors disabled:opacity-50 ml-1 ${
              isActive
                ? "text-emerald-500/50 hover:text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            title={isActive ? "Disconnect Session" : "Remove Wallet"}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isPrimary &&
        ((isActive && !isVerified) || (isPrimaryActive && isVerified)) && (
          <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Secondary wallet
            </span>
            <div className="flex items-center gap-2">
              {!isVerified ? (
                <LinkButton
                  onVerify={() => onVerify(account.address, account.walletId)}
                  isVerifying={isVerifying}
                />
              ) : (
                <PromoteButton
                  targetAddress={account.address}
                  oldPrimaryWalletId={primaryAccount?.walletId || "unknown"}
                  oldPrimaryName={primaryAccount?.name || "Linked Wallet"}
                  oldPrimaryAddressType={
                    primaryAccount?.addressType || "Solana"
                  }
                  onSuccess={async () => {
                    try {
                      await logout();
                    } catch (e) {
                      console.error("Logout error:", e);
                    }
                    onClearAll();
                    await disconnect();
                    onClose();
                    window.location.reload();
                  }}
                />
              )}
            </div>
          </div>
        )}
    </div>
  );
}
