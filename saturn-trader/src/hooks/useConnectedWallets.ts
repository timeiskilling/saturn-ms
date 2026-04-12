import { useEffect, useState, useRef } from "react";
import { usePhantom, useAccounts } from "@phantom/react-sdk";

export interface SavedWallet {
  walletId: string;
  name: string;
  icon?: string;
  accounts: { address: string; addressType: string }[];
  isVerified?: boolean;
}

export function useConnectedWallets() {
  const { user, isConnected } = usePhantom();
  const accounts = useAccounts();
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
  const prevWalletIdRef = useRef<string | null>(null);

  const syncFromStorage = () => {
    const saved = localStorage.getItem("saturn_saved_wallets");
    if (saved) {
      try {
        setSavedWallets((prev) => {
          const parsed = JSON.parse(saved);
          return JSON.stringify(prev) !== JSON.stringify(parsed)
            ? parsed
            : prev;
        });
      } catch (e) {
        console.error("Failed to parse saved wallets", e);
      }
    } else {
      setSavedWallets((prev) => (prev.length ? [] : prev));
    }
  };

  // Load from local storage on mount and listen to custom events
  useEffect(() => {
    syncFromStorage();

    const handleStorageChange = () => {
      syncFromStorage();
    };

    window.addEventListener("saturn_wallets_updated", handleStorageChange);
    return () =>
      window.removeEventListener("saturn_wallets_updated", handleStorageChange);
  }, []);

  const updateStorage = (next: SavedWallet[]) => {
    localStorage.setItem("saturn_saved_wallets", JSON.stringify(next));
    window.dispatchEvent(new Event("saturn_wallets_updated"));
  };

  // Update current wallet in local storage when connection changes
  useEffect(() => {
    if (isConnected && user?.walletId && accounts && accounts.length > 0) {
      prevWalletIdRef.current = user.walletId;
      setSavedWallets((prev) => {
        const existingIndex = prev.findIndex(
          (w) => w.walletId === user.walletId,
        );
        const newWallet: SavedWallet = {
          walletId: user.walletId!,
          name: user.wallet?.name || "Wallet",
          icon: user.wallet?.icon,
          accounts: accounts.map((a) => ({
            address: a.address,
            addressType: a.addressType,
          })),
        };

        let next;
        let isChanged = false;
        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          if (JSON.stringify(existing) !== JSON.stringify(newWallet)) {
            next = [...prev];
            next[existingIndex] = newWallet;
            isChanged = true;
          } else {
            next = prev;
          }
        } else {
          next = [...prev, newWallet];
          isChanged = true;
        }

        if (isChanged) {
          setTimeout(() => updateStorage(next), 0);
        }
        return next;
      });
    } else if (!isConnected && prevWalletIdRef.current) {
      const disconnectedId = prevWalletIdRef.current;
      prevWalletIdRef.current = null;
      setSavedWallets((prev) => {
        if (!prev.some((w) => w.walletId === disconnectedId)) {
          return prev;
        }
        const next = prev.filter((w) => w.walletId !== disconnectedId);
        setTimeout(() => updateStorage(next), 0);
        return next;
      });
    }
  }, [user, accounts, isConnected]);

  const removeSavedWallet = (walletId: string) => {
    setSavedWallets((prev) => {
      const next = prev.filter((w) => w.walletId !== walletId);
      setTimeout(() => updateStorage(next), 0);
      return next;
    });
  };

  const setWalletVerified = (walletId: string, isVerified: boolean) => {
    setSavedWallets((prev) => {
      const next = prev.map((w) =>
        w.walletId === walletId ? { ...w, isVerified } : w,
      );
      setTimeout(() => updateStorage(next), 0);
      return next;
    });
  };

  return { savedWallets, removeSavedWallet, setWalletVerified };
}
