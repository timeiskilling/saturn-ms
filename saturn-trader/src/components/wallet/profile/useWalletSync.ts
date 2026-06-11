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
      prevActiveAddress.current !== currentActiveAddress
    ) {
      console.log(
        `[Wallet Sync] State mutated. Old: ${prevActiveAddress.current}, New: ${currentActiveAddress || "Disconnected"}`,
      );

      disconnect();
      clearSavedWallets();
      window.dispatchEvent(new Event("saturn_wallet_logout"));
    }

    prevActiveAddress.current = currentActiveAddress || null;
  }, [accounts, disconnect, clearSavedWallets]);
}
