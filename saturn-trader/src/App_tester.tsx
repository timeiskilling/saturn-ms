import { useState } from "react";
import { BasicCard } from "./saturnComponents/card";
import { TradingViewWidget } from "./saturnComponents/tradingView";
import { WalletSidebar } from "./saturnComponents/walletSidebar";
import { BottomPanel } from "./saturnComponents/bottomPanel";
import { BundledTransactions } from "./saturnComponents/bundledTransactions";

import { PhantomProvider, darkTheme } from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";

function AppContent() {
  const [activeTab, setActiveTab] = useState<"trading" | "bundles">("trading");

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="shrink-0 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 pr-4">
        <BasicCard
          title="Saturn Trader"
          className="flex rounded-none border-none bg-transparent w-auto shadow-none"
        ></BasicCard>
        <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
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

      <div className="flex flex-1 overflow-hidden">
        {activeTab === "trading" && <WalletSidebar />}

        <div className="flex flex-1 flex-col overflow-hidden w-full bg-zinc-950">
          {activeTab === "trading" ? (
            <>
              <div className="flex-1 min-h-0 w-full h-full pr-3">
                <TradingViewWidget />
              </div>
              <BottomPanel />
            </>
          ) : (
            <BundledTransactions />
          )}
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
      <AppContent />
    </PhantomProvider>
  );
}
