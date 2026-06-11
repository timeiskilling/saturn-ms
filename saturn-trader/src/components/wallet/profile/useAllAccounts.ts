import { useMemo } from "react";
import { usePhantom, useAccounts } from "@phantom/react-sdk";
import { useConnectedWallets } from "../../../hooks/useConnectedWallets"; // Твій шлях
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

    if (accounts && isConnected && accounts.length > 0) {
      const activeAccount = accounts[0];

      if (activeAccount && activeAccount.address) {
        const activeAddress = activeAccount.address;
        const existing = accs.find((sa) => sa.address === activeAddress);

        if (!existing) {
          const newAcc: AccountInfo = {
            address: activeAddress,
            addressType: activeAccount.addressType as string,
            walletId: user?.walletId || "",
            icon: user?.wallet?.icon,
            name: user?.wallet?.name || "Wallet",
            isVerified: false,
          };

          const sameNetworkIndex = accs.findIndex(
            (sa) =>
              sa.walletId === user?.walletId &&
              sa.addressType === (activeAccount.addressType as string),
          );

          if (sameNetworkIndex >= 0) {
            accs[sameNetworkIndex] = newAcc;
          } else {
            accs.push(newAcc);
          }
        }
      }
    }

    return accs;
  }, [savedWallets, accounts, user, isConnected]);

  const primaryAccount = useMemo(() => {
    const activeAddress = accounts?.[0]?.address;
    if (activeAddress) {
      const found = allAccounts.find((a) => a.address === activeAddress);
      if (found) return found;
    }
    return (
      allAccounts.find((a) => a.addressType === "Solana") || allAccounts[0]
    );
  }, [allAccounts, accounts]);

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
