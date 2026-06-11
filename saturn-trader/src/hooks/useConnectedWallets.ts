import { useEffect, useState, useRef } from "react";
import { usePhantom, useAccounts } from "@phantom/react-sdk";

let lastFetchTime = 0;
let fetchPromise: Promise<any> | null = null;

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

  useEffect(() => {
    const fetchLinkedWallets = async () => {
      if (!isConnected) return;

      const now = Date.now();
      if (now - lastFetchTime < 2000) return;
      lastFetchTime = now;

      try {
        if (!fetchPromise) {
          fetchPromise = fetch("https://sutrn.com/wallet/linked", {
            credentials: "include",
          })
            .then((res) => {
              fetchPromise = null;
              return res.ok ? res.json() : null;
            })
            .catch((e) => {
              fetchPromise = null;
              throw e;
            });
        }

        const linked:
          | {
              address: string;
              wallet_id: string;
              name: string;
              address_type: string;
            }[]
          | null = await fetchPromise;

        if (linked) {
          setSavedWallets((prev) => {
            const next = [...prev];
            let changed = false;

            linked.forEach((lw) => {
              const existingIndex = next.findIndex(
                (w) => w.walletId === lw.wallet_id,
              );

              if (existingIndex >= 0) {
                const existingWallet: SavedWallet = { ...next[existingIndex]! };
                const currentAccounts = existingWallet.accounts || [];
                const accountExists = currentAccounts.some(
                  (a) => a.address === lw.address,
                );

                if (!accountExists) {
                  existingWallet.accounts = [
                    ...currentAccounts,
                    { address: lw.address, addressType: lw.address_type },
                  ];
                  changed = true;
                }

                if (!existingWallet.isVerified) {
                  existingWallet.isVerified = true;
                  changed = true;
                }
                next[existingIndex] = existingWallet;
              } else {
                const newLinkedWallet: SavedWallet = {
                  walletId: lw.wallet_id,
                  name: lw.name,
                  accounts: [
                    { address: lw.address, addressType: lw.address_type },
                  ],
                  isVerified: true,
                };
                next.push(newLinkedWallet);
                changed = true;
              }
            });

            if (changed) {
              // Only trigger update if the actual data changed to prevent infinite loops
              const isDifferent = JSON.stringify(prev) !== JSON.stringify(next);
              if (isDifferent) {
                setTimeout(() => updateStorage(next), 0);
                return next;
              }
            }
            return prev;
          });
        }
      } catch (e) {
        console.error("Failed to fetch linked wallets", e);
      }
    };

    fetchLinkedWallets();
  }, [isConnected]);

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
        let next;
        let isChanged = false;

        const incomingTypes = accounts.map((a) => a.addressType as string);

        if (existingIndex >= 0) {
          const existing = prev[existingIndex]!;
          const updatedWallet: SavedWallet = {
            walletId: user.walletId!,
            name: user.wallet?.name || existing.name || "Wallet",
            icon: user.wallet?.icon || existing.icon,
            accounts: [
              ...(existing.accounts || []).filter(
                (ea) => !incomingTypes.includes(ea.addressType),
              ),
              ...accounts.map((a) => ({
                address: a.address,
                addressType: a.addressType as string,
              })),
            ],
            isVerified: existing.isVerified,
          };

          if (JSON.stringify(existing) !== JSON.stringify(updatedWallet)) {
            next = [...prev];
            next[existingIndex] = updatedWallet;
            isChanged = true;
          } else {
            next = prev;
          }
        } else {
          const newWallet: SavedWallet = {
            walletId: user.walletId!,
            name: user.wallet?.name || "Wallet",
            icon: user.wallet?.icon,
            // Також приводимо до string тут
            accounts: accounts.map((a) => ({
              address: a.address,
              addressType: a.addressType as string,
            })),
          };
          next = [...prev, newWallet];
          isChanged = true;
        }

        if (isChanged) {
          setTimeout(() => updateStorage(next), 0);
        }
        return next;
      });
    } else if (!isConnected && prevWalletIdRef.current) {
      prevWalletIdRef.current = null;
    }
  }, [user, accounts, isConnected]);

  const clearSavedWallets = () => {
    localStorage.removeItem("phantom-wallet");
    localStorage.removeItem("phantom-wallet-connected");
    localStorage.removeItem("saturn_saved_wallets");
    setSavedWallets([]);
    setTimeout(() => updateStorage([]), 0);
  };

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

  return {
    savedWallets,
    removeSavedWallet,
    setWalletVerified,
    clearSavedWallets,
  };
}
