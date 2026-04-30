import { useState } from "react";
import { BasicCard } from "./saturnComponents/card";
import { TradingViewWidget } from "./saturnComponents/tradingView";
import { WalletSidebar } from "./saturnComponents/walletSidebar";
import { BottomPanel } from "./saturnComponents/bottomPanel";
import { BundledTransactions } from "./saturnComponents/bundledTransactions";
import { Toaster, toast } from "sonner";

import { PhantomProvider, darkTheme, usePhantom } from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";
import { CustomWalletProfile } from "./components/wallet/CustomWalletProfile";

function AppContent() {
  const [activeTab, setActiveTab] = useState<"trading" | "bundles">("trading");

  return (
    <div className="select-none flex flex-col h-screen w-full overflow-x-auto overflow-y-hidden bg-zinc-950">
      <div className="flex flex-col w-full h-full min-w-5xl">
        <div className="shrink-0 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 pr-4">
          <BasicCard
            title="Saturn Trader"
            className="flex rounded-none border-none bg-transparent w-auto shadow-none"
          />

          <div className="flex items-center justify-end gap-4 ml-auto py-2">
            <div className="flex items-center gap-3">
              <div className="w-auto">
                <CustomWalletProfile />
              </div>
            </div>

            <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveTab("trading")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "trading"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Terminal
              </button>
              <button
                onClick={() => setActiveTab("bundles")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "bundles"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Bundles
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative w-full">
          <div
            className={`flex w-full h-full transition-transform duration-300 ease-in-out ${
              activeTab === "trading" ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Terminal Page */}
            <div className="flex w-full h-full shrink-0">
              <div className="h-full shrink-0 z-10">
                <WalletSidebar />
              </div>
              <div className="flex flex-1 flex-col overflow-hidden w-full bg-zinc-950">
                <div className="flex-1 min-h-0 w-full h-full pr-3">
                  <TradingViewWidget />
                </div>
                {/*<BottomPanel />*/}
              </div>
            </div>

            {/* Bundles Page */}
            <div className="flex w-full h-full shrink-0">
              <div className="flex flex-1 flex-col overflow-hidden w-full bg-zinc-950">
                <BundledTransactions />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppTest() {
  return (
    <PhantomProvider
      config={{
        providers: ["injected"],
        appId: "local-dev-app",
        addressTypes: [AddressType.solana],
      }}
      theme={darkTheme}
      appName="Saturn Trader"
      appIcon="./public/saturn_d.jpg"
    >
      <Toaster
        position="bottom-center"
        visibleToasts={3}
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "border shadow-lg text-zinc-100",
            success: "bg-green-950/30 border-green-500/50",
            error: "bg-red-950/30 border-red-500/50",
            default: "bg-zinc-900 border-zinc-800",
            title: "text-sm font-medium",
            description: "text-xs text-zinc-400",
            icon: "w-5 h-5",
          },
        }}
      />
      <AppContent />
    </PhantomProvider>
  );
}
