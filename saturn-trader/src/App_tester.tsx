import { useState } from "react";
import { BasicCard } from "./saturnComponents/card";
import { TradingViewWidget } from "./saturnComponents/tradingView";
import { WalletSidebar } from "./saturnComponents/walletSidebar";
import { BottomPanel } from "./saturnComponents/bottomPanel";
import { BundledTransactions } from "./saturnComponents/bundledTransactions";
import { RoadmapView } from "./saturnComponents/RoadmapView";
import { ForceUnlink } from "./saturnComponents/ForceUnlink";
import { Toaster, toast } from "sonner";

import { PhantomProvider, darkTheme, usePhantom } from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";
import { CustomWalletProfile } from "./components/wallet/CustomWalletProfile";
import Support from "./saturnComponents/Support";
import { useWalletSync } from "./components/wallet/profile/useWalletSync";

function WalletSyncListener() {
  useWalletSync();
  return null;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<
    "trading" | "bundles" | "roadmap" | "forceUnlink" | "support"
  >("trading");

  const tabTransforms: Record<typeof activeTab, string> = {
    trading: "translate-x-0",
    bundles: "-translate-x-full",
    roadmap: "translate-x-[-200%]",
    forceUnlink: "translate-x-[-300%]",
    support: "translate-x-[-400%]",
  };

  return (
    <div className="select-none flex flex-col h-screen w-full overflow-hidden bg-zinc-950">
      <div className="w-full bg-amber-950/30 border-b border-amber-900/50 px-2 lg:px-4 py-1.5 lg:py-2 flex items-center justify-center shrink-0 z-50">
        <div className="flex items-center">
          <span className="relative flex h-2 w-2 lg:h-2.5 lg:w-2.5 shrink-0"></span>
          <p className="text-[10px] lg:text-xs text-amber-200/80 font-medium text-center tracking-wide">
            Built and maintained independently. Current blockchain interactions
            are simulated while mainnet infrastructure is being finalized.
            <span className="font-bold text-amber-200">
              {" "}
              Certain application data is stored securely to support platform
              functionality. Sensitive information is never shared externally.
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col w-full flex-1 min-h-0 pb-16 lg:pb-0">
        <div className="shrink-0 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 pr-2 lg:pr-4 overflow-x-auto scrollbar-hide">
          <BasicCard
            title="Saturn"
            className="flex rounded-none border-none bg-transparent w-auto shadow-none shrink-0"
            classNames={{
              header: "p-2.5 lg:p-4",
              title: "text-sm lg:text-xl font-bold whitespace-nowrap",
            }}
          />

          <div className="flex items-center justify-end gap-1.5 lg:gap-4 ml-auto py-2 shrink-0 pl-1.5">
            <div className="flex items-center gap-1.5 lg:gap-3">
              <div className="w-auto shrink-0 scale-[0.85] lg:scale-100 origin-right">
                <CustomWalletProfile />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              {["trading", "bundles", "roadmap", "forceUnlink", "support"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                      activeTab === tab
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                    }`}
                  >
                    {tab === "forceUnlink" ? "Force Unlink" : tab}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative w-full">
          <div
            className={`flex w-full h-full transition-transform duration-300 ease-in-out ${tabTransforms[activeTab]}`}
          >
            {/* Terminal Page */}
            <div className="flex flex-col lg:flex-row w-full h-full shrink-0 overflow-hidden">
              <div className="w-full lg:w-96 h-[35%] lg:h-full shrink-0 z-10 overflow-y-auto border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950">
                <WalletSidebar />
              </div>
              <div className="flex-1 flex flex-col overflow-hidden w-full h-[65%] lg:h-full bg-zinc-950">
                <div className="flex-1 min-h-0 w-full h-full p-1.5 lg:p-3">
                  <TradingViewWidget />
                </div>
              </div>
            </div>

            {/* Bundles Page */}
            <div className="flex w-full h-full shrink-0">
              <div className="flex flex-1 flex-col overflow-hidden w-full bg-zinc-950">
                <BundledTransactions />
              </div>
            </div>

            {/* Roadmap Page */}
            <div className="flex w-full h-full shrink-0">
              <div className="flex flex-1 flex-col overflow-hidden w-full bg-zinc-950">
                <RoadmapView />
              </div>
            </div>

            {/* Force Unlink Page */}
            <div className="flex w-full h-full shrink-0">
              <div className="flex flex-1 flex-col overflow-hidden w-full bg-zinc-950">
                <ForceUnlink />
              </div>
            </div>

            {/* Support Page */}
            <div className="flex w-full h-full shrink-0">
              <div className="flex flex-1 flex-col overflow-hidden w-full bg-zinc-950">
                <Support />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[calc(64px+env(safe-area-inset-bottom))] bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800 z-50 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setActiveTab("trading")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
            activeTab === "trading"
              ? "text-blue-500 scale-110"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            ></path>
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Terminal
          </span>
        </button>

        <button
          onClick={() => setActiveTab("bundles")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
            activeTab === "bundles"
              ? "text-blue-500 scale-110"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            ></path>
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Bundles
          </span>
        </button>

        <button
          onClick={() => setActiveTab("roadmap")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
            activeTab === "roadmap"
              ? "text-blue-500 scale-110"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            ></path>
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Roadmap
          </span>
        </button>

        <button
          onClick={() => setActiveTab("forceUnlink")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
            activeTab === "forceUnlink"
              ? "text-blue-500 scale-110"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Unlink
          </span>
        </button>

        <button
          onClick={() => setActiveTab("support")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
            activeTab === "support"
              ? "text-blue-500 scale-110"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Support
          </span>
        </button>
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
      appName="Saturn"
      appIcon="./public/saturn_d.jpg"
    >
      <WalletSyncListener />
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
