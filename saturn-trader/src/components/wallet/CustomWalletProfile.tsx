import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  useAccounts,
  useDisconnect,
  usePhantom,
  useDiscoveredWallets,
  useConnect,
} from "@phantom/react-sdk";
import { CustomConnectButton, CustomConnectModal } from "./CustomConnectButton";
import { useConnectedWallets } from "../../hooks/useConnectedWallets";
import {
  LogOut,
  Sun,
  RefreshCw,
  X,
  Plus,
  Info,
  ChevronDown,
  Wallet,
} from "lucide-react";

export function CustomWalletProfile() {
  const { isConnected, user } = usePhantom();
  const { disconnect, isDisconnecting } = useDisconnect();
  const accounts = useAccounts();
  const { wallets } = useDiscoveredWallets();
  const { savedWallets, removeSavedWallet } = useConnectedWallets();
  const { connect } = useConnect();
  const [showModal, setShowModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isWalletExpanded, setIsWalletExpanded] = useState(true);

  const handleOpen = () => {
    setShowModal(true);
    requestAnimationFrame(() => setIsOpen(true));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const allAccounts = useMemo(() => {
    const accs: { address: string; addressType: string; walletId: string; icon?: string; name: string }[] = [];
    savedWallets.forEach((w) => {
      w.accounts.forEach((a) => {
        accs.push({
          address: a.address,
          addressType: a.addressType,
          walletId: w.walletId,
          icon: w.icon,
          name: w.name,
        });
      });
    });
    // Add current accounts if not already in savedWallets (to prevent flicker)
    if (accounts && isConnected) {
          accounts.forEach((a) => {
            if (!accs.find((sa) => sa.address === a.address)) {
              accs.push({
                address: a.address,
                addressType: a.addressType,
                walletId: user?.walletId || "",
                icon: user?.wallet?.icon,
                name: user?.wallet?.name || "Wallet",
              });
            }
          });
        }
        return accs;
  }, [savedWallets, accounts, user]);

  // Grab the first Solana address, or fallback to the first available account
  const primaryAccount =
    allAccounts.find((a) => a.addressType === "Solana") || allAccounts[0];

  // Format it beautifully (e.g. 5x12...3kLq)
  const shortAddress = primaryAccount?.address
    ? `${primaryAccount.address.slice(0, 4)}...${primaryAccount.address.slice(-4)}`
    : "Unknown";

  const connectedWalletInfo = wallets.find(
    (w) => w.id === user?.walletId || w.name === user?.wallet?.name,
  );

  const getWalletIconById = (walletId: string) => {
      const foundWallet = wallets.find((w) => w.id === walletId);
      return foundWallet?.icon;
    };

  // If there are no saved wallets and we are not connected, we have nothing to show.
  if ((!isConnected || !accounts || accounts.length === 0) && savedWallets.length === 0) {
    return <CustomConnectButton />;
  }

  return (
    <>
      <button
        onClick={handleOpen}
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

      <CustomConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />

      {showModal &&
        createPortal(
          <div
            className={`fixed inset-0 z-100 flex justify-end p-4 transition-all duration-300 ease-out ${
              isOpen && !isClosing
                ? "bg-black/60 backdrop-blur-sm"
                : "bg-transparent backdrop-blur-none"
            }`}
            onClick={handleClose}
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
                    onClick={handleClose}
                    className="hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 flex flex-col gap-4 flex-1 overflow-y-auto scrollbar-hide">
                <div className="flex flex-col bg-[#242424] rounded-2xl border border-zinc-800/80 overflow-hidden transition-all">
                  <button
                    onClick={() => setIsWalletExpanded(!isWalletExpanded)}
                    className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
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
                          handleClose();
                          setShowConnectModal(true);
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
                        className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isWalletExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  <div
                    className={`flex flex-col transition-all duration-300 overflow-hidden ${
                      isWalletExpanded
                        ? "max-h-100 opacity-100 overflow-y-auto scrollbar-hide"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-4 pb-2 flex flex-col gap-1">
                      {allAccounts.map((account, index) => {
                        const accShort = `${account.address.slice(0, 5)}...${account.address.slice(-5)}`;
                        const icon = account.icon || getWalletIconById(account.walletId);
                        const displayType =
                          account.addressType === "Ethereum"
                            ? "EVM"
                            : account.addressType;

                        return (
                          <div
                            key={`${account.address}-${index}`}
                            onClick={async () => {
                              if (account.walletId !== user?.walletId) {
                                try {
                                  await connect({ provider: "injected", walletId: account.walletId });
                                } catch (e: any) {
                                  console.error("Failed to switch wallet", e);
                                  alert(`Failed to connect to ${account.name}: ${e?.message || "User rejected request or extension unavailable."}`);
                                }
                              }
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl transition-colors group cursor-pointer border ${
                              account.walletId === user?.walletId
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'border-transparent hover:bg-zinc-800/50'
                            }`}
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
                                      {account.addressType
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                {account.walletId === user?.walletId && (
                                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#242424] shadow-sm"></div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-base font-bold transition-colors ${account.walletId === user?.walletId ? 'text-emerald-400' : 'text-zinc-100 group-hover:text-white'}`}>
                                  {accShort}
                                </span>
                                {account.walletId === user?.walletId && (
                                  <span className="text-[10px] font-semibold text-emerald-500/80 uppercase tracking-wider">
                                    Active Session
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-medium ${account.walletId === user?.walletId ? 'text-emerald-500/60' : 'text-zinc-500'}`}>
                                {displayType}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (account.walletId === user?.walletId) {
                                    disconnect();
                                    handleClose();
                                  } else {
                                    removeSavedWallet(account.walletId);
                                  }
                                }}
                                disabled={isDisconnecting && account.walletId === user?.walletId}
                                className={`transition-colors disabled:opacity-50 ml-1 ${account.walletId === user?.walletId ? 'text-emerald-500/50 hover:text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                title={account.walletId === user?.walletId ? "Disconnect Session" : "Remove Wallet"}
                              >
                                <LogOut className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        onClick={() => {
                          handleClose();
                          setShowConnectModal(true);
                        }}
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
                  <p className="text-sm text-zinc-500 font-medium">
                    No tokens yet.
                  </p>
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
        )}
    </>
  );
}
