import { BasicCard } from "./saturnComponents/card";
import { TradingViewWidget } from "./saturnComponents/tradingView";
import { WalletSidebar } from "./saturnComponents/walletSidebar";
import { BottomPanel } from "./saturnComponents/bottomPanel";

import { PhantomProvider, darkTheme } from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";

// Define a child component to use the Phantom context correctly
function AppContent() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="shrink-0">
        <BasicCard
          title="Saturn Trader"
          className="flex rounded-none border-t-0 border-x-0 border-y-0"
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <WalletSidebar />

        <div className="flex flex-1 flex-col overflow-hidden w-full">
          <div className="flex-1 min-h-0 w-full h-full pr-3">
            <TradingViewWidget />
          </div>
          <BottomPanel />
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
