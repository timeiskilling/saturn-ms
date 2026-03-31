import React, { useState, useMemo } from "react";
import {
  useConnect,
  usePhantom,
  useDiscoveredWallets,
} from "@phantom/react-sdk";
import { Loader2, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import { createPortal } from "react-dom";

export function CustomConnectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { connect } = useConnect();
  const { wallets } = useDiscoveredWallets();
  const [expandedSection, setExpandedSection] = useState<"EVM" | "SOLANA">(
    "SOLANA",
  );
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const solanaWallets = useMemo(() => {
    // The AddressType enum has "Solana"
    return wallets.filter((w) => w.addressTypes.includes("Solana" as any));
  }, [wallets]);

  const evmWallets = useMemo(() => {
    // The AddressType enum has "Ethereum"
    return wallets.filter((w) => w.addressTypes.includes("Ethereum" as any));
  }, [wallets]);

  const handleConnect = async (
    providerName: "injected" | "google",
    walletId: string,
  ) => {
    try {
      setConnectingWallet(walletId);
      // As per SDK, provider could be "injected" and walletId specifies which wallet extension.
      await connect({ provider: providerName, walletId });
      onClose();
    } catch (err) {
      console.error(
        `User rejected connection with ${providerName} (${walletId}) or error occurred:`,
        err,
      );
    } finally {
      setConnectingWallet(null);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] flex flex-col bg-[#1A1A1A] border border-zinc-800 rounded-3xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="p-6 pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-zinc-100">Connect Wallet</h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-[220px]">
              You can only connect one wallet per environment.
            </p>
          </div>
          <div className="flex items-center gap-4 text-zinc-500">
            <div className="w-px h-5 bg-zinc-800"></div>
            <button
              onClick={onClose}
              className="hover:text-zinc-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-2 overflow-y-auto max-h-[60vh] scrollbar-hide">
          {/* EVM Section */}
          <div className="flex flex-col border-b border-zinc-800/50 pb-2">
            <button
              onClick={() =>
                setExpandedSection(expandedSection === "EVM" ? "SOLANA" : "EVM")
              }
              className="flex items-center justify-between p-3 text-sm font-semibold text-zinc-200 hover:text-white transition-colors"
            >
              EVM ({evmWallets.length})
              {expandedSection === "EVM" ? (
                <ChevronUp className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {expandedSection === "EVM" && (
              <div className="flex flex-col gap-1 mt-1">
                {evmWallets.length > 0 ? (
                  evmWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleConnect("injected", wallet.id)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        {wallet.icon ? (
                          <img
                            src={wallet.icon}
                            alt={wallet.name}
                            className="w-10 h-10 rounded-xl object-cover bg-white"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                            <span className="text-xs font-bold text-zinc-400">
                              {wallet.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-zinc-100 text-base">
                            {wallet.name}
                          </span>
                          <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            Connect
                          </span>
                        </div>
                      </div>
                      {connectingWallet === wallet.id && (
                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                          Connecting...{" "}
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-zinc-500 text-center">
                    No EVM wallets discovered.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SOLANA Section */}
          <div className="flex flex-col pb-2 mt-2">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === "SOLANA" ? "EVM" : "SOLANA",
                )
              }
              className="flex items-center justify-between p-3 text-sm font-semibold text-zinc-200 hover:text-white transition-colors"
            >
              SOLANA ({solanaWallets.length})
              {expandedSection === "SOLANA" ? (
                <ChevronUp className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {expandedSection === "SOLANA" && (
              <div className="flex flex-col gap-1 mt-1">
                {solanaWallets.length > 0 ? (
                  solanaWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleConnect("injected", wallet.id)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        {wallet.icon ? (
                          <img
                            src={wallet.icon}
                            alt={wallet.name}
                            className="w-10 h-10 rounded-xl object-cover bg-white"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                            <span className="text-xs font-bold text-zinc-400">
                              {wallet.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-zinc-100 text-base">
                            {wallet.name}
                          </span>
                          <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            Connect
                          </span>
                        </div>
                      </div>
                      {connectingWallet === wallet.id && (
                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                          Connecting...{" "}
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-zinc-500 text-center">
                    No Solana wallets discovered.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function CustomConnectButton() {
  const { isConnecting } = useConnect();
  const { isConnected } = usePhantom();
  const [showOptions, setShowOptions] = useState(false);

  // If already connected, we don't need this button to render at all.
  if (isConnected) return null;

  return (
    <>
      <button
        onClick={() => setShowOptions(true)}
        disabled={isConnecting}
        className="flex items-center justify-center gap-2 py-2 px-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-100 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 group"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            <span className="text-zinc-400">Connecting...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      <CustomConnectModal
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
      />
    </>
  );
}
