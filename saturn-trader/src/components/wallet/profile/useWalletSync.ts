import { useEffect, useRef } from "react";
import { useAccounts, useDisconnect } from "@phantom/react-sdk";
import { useConnectedWallets } from "@/hooks/useConnectedWallets";
export function useWalletSync() {
  const accounts = useAccounts();
  const { disconnect } = useDisconnect();
  const { clearSavedWallets } = useConnectedWallets();

  const prevActiveAddress = useRef<string | null>(null);

  useEffect(() => {
    const currentActiveAddress = accounts?.[0]?.address;

    if (
      prevActiveAddress.current &&
      currentActiveAddress &&
      prevActiveAddress.current !== currentActiveAddress
    ) {
      console.log(
        `[Wallet Sync] Account changed from ${prevActiveAddress.current} to ${currentActiveAddress}`,
      );

      disconnect();
      clearSavedWallets();
      window.dispatchEvent(new Event("saturn_wallet_logout"));
    }

    if (currentActiveAddress) {
      prevActiveAddress.current = currentActiveAddress;
    } else {
      prevActiveAddress.current = null;
    }
  }, [accounts, disconnect, clearSavedWallets]);
}
