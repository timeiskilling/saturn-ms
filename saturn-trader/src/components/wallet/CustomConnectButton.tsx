import React, { useState } from "react";
import { useConnect, usePhantom } from "@phantom/react-sdk";
import { Loader2, Wallet, LogIn, MonitorSmartphone, Mail } from "lucide-react";
import { createPortal } from "react-dom";

export function CustomConnectButton() {
  const { connect, isConnecting } = useConnect();
  const { isConnected } = usePhantom();
  const [showOptions, setShowOptions] = useState(false);

  // If already connected, we don't need this button to render at all.
  if (isConnected) return null;

  const handleConnect = async (
    providerName: "injected" | "google" | "apple",
  ) => {
    try {
      await connect({ provider: providerName });
      setShowOptions(false);
    } catch (err) {
      console.error(
        `User rejected connection with ${providerName} or error occurred:`,
        err,
      );
    }
  };

  return (
    <>
      <button
        onClick={() => setShowOptions(true)}
        disabled={isConnecting}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-100 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 group"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            <span className="text-zinc-400">Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {/* Embedded Connect Options Modal */}
      {showOptions &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowOptions(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[360px] flex flex-col bg-[#121212] border border-zinc-800/80 rounded-3xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800/50 bg-zinc-900/20 text-center">
                <h3 className="text-lg font-bold text-zinc-100">
                  Connect to Saturn Trader
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Choose how you'd like to sign in
                </p>
              </div>

              <div className="p-6 flex flex-col gap-3">
                <button
                  onClick={() => handleConnect("injected")}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <MonitorSmartphone className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="font-semibold text-zinc-200 group-hover:text-white">
                      Phantom Extension
                    </span>
                  </div>
                  <LogIn className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-zinc-800/50"></div>
                  <span className="flex-shrink-0 mx-4 text-xs text-zinc-600 font-semibold uppercase tracking-wider">
                    Or Social Login
                  </span>
                  <div className="flex-grow border-t border-zinc-800/50"></div>
                </div>

                <button
                  onClick={() => handleConnect("google")}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="font-semibold text-zinc-200 group-hover:text-white">
                      Continue with Google
                    </span>
                  </div>
                  <LogIn className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </button>

                <button
                  onClick={() => setShowOptions(false)}
                  className="mt-2 py-3 text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
