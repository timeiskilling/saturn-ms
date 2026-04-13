import { useMemo } from "react";
import { usePhantom, useAccounts } from "@phantom/react-sdk";
import { useConnectedWallets } from "../../../hooks/useConnectedWallets";
import { type AccountInfo } from "./types";

export function useAllAccounts() {
  const { isConnected, user } = usePhantom();
  const accounts = useAccounts();
  const {
    savedWallets,
    removeSavedWallet,
    setWalletVerified,
    clearSavedWallets,
  } = useConnectedWallets();

  const allAccounts = useMemo(() => {
    const accs: AccountInfo[] = [];
    savedWallets.forEach((w) => {
      w.accounts.forEach((a) => {
        accs.push({
          address: a.address,
          addressType: a.addressType,
          walletId: w.walletId,
          icon: w.icon,
          name: w.name,
          isVerified: w.isVerified,
        });
      });
    });

    // Add current accounts if not already in savedWallets (to prevent flicker)
    if (accounts && isConnected) {
      accounts.forEach((a) => {
        const existing = accs.find((sa) => sa.address === a.address);
        if (!existing) {
          accs.push({
            address: a.address,
            addressType: a.addressType,
            walletId: user?.walletId || "",
            icon: user?.wallet?.icon,
            name: user?.wallet?.name || "Wallet",
            isVerified: false,
          });
        }
      });
    }
    return accs;
  }, [savedWallets, accounts, user, isConnected]);

  const primaryAccount =
    allAccounts.find((a) => a.addressType === "Solana") || allAccounts[0];

  return {
    allAccounts,
    primaryAccount,
    savedWallets,
    removeSavedWallet,
    setWalletVerified,
    clearSavedWallets,
    isConnected,
    user,
    accounts,
  };
}
