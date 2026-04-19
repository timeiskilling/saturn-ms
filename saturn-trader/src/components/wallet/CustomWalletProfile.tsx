import React, { useState, useEffect, useRef } from "react";
import { useSolana, useDiscoveredWallets } from "@phantom/react-sdk";
import { CustomConnectButton, CustomConnectModal } from "./CustomConnectButton";
import { verifyWallet } from "../../api/verifyWallet";
import { fetchBundles } from "../../api/saveBundle";
import { useAllAccounts } from "./profile/useAllAccounts";
import { ProfileButton } from "./profile/ProfileButton";
import { WalletModal } from "./profile/WalletModal";
import { DevicesModal } from "./DevicesModal";
import { Monitor } from "lucide-react";

export function CustomWalletProfile() {
  const { solana } = useSolana();
  const { wallets } = useDiscoveredWallets();
  const [showModal, setShowModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [isDevicesClosing, setIsDevicesClosing] = useState(false);

  const [isWalletExpanded, setIsWalletExpanded] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    Record<string, string>
  >({});

  const {
    allAccounts,
    primaryAccount,
    savedWallets,
    removeSavedWallet,
    clearSavedWallets,
    setWalletVerified,
    isConnected,
    user,
    accounts,
  } = useAllAccounts();

  const handleVerify = async (accountAddress: string, walletId: string) => {
    if (!solana) {
      setVerificationStatus((prev) => ({
        ...prev,
        [accountAddress]: "Wallet not ready.",
      }));
      return;
    }

    const accountInfo = allAccounts.find((a) => a.address === accountAddress);
    const name = accountInfo?.name || "Wallet";
    const addressType = accountInfo?.addressType || "Solana";

    setVerificationStatus((prev) => ({
      ...prev,
      [accountAddress]: "Verifying...",
    }));
    try {
      const accInfo = allAccounts.find((a) => a.address === accountAddress);
      const walletName = accInfo?.name || "Linked Wallet";
      const addressType = accInfo?.addressType || "Solana";
      const success = await verifyWallet(
        solana,
        accountAddress,
        walletId,
        walletName,
        addressType,
      );
      if (success) {
        setVerificationStatus((prev) => ({
          ...prev,
          [accountAddress]: "Verified!",
        }));
        setWalletVerified(walletId, true);
      } else {
        setVerificationStatus((prev) => ({
          ...prev,
          [accountAddress]: "Verification failed.",
        }));
      }
    } catch (error) {
      console.error(error);
      setVerificationStatus((prev) => ({
        ...prev,
        [accountAddress]: "Error during verification.",
      }));
    }
  };

  const handleOpen = () => {
    setShowModal(true);
    requestAnimationFrame(() => setIsOpen(true));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleOpenDevices = () => {
    setShowDevicesModal(true);
    requestAnimationFrame(() => setIsDevicesOpen(true));
  };

  const handleCloseDevices = () => {
    setIsDevicesClosing(true);
    setTimeout(() => {
      setShowDevicesModal(false);
      setIsDevicesOpen(false);
      setIsDevicesClosing(false);
    }, 300);
  };

  const hasCheckedSession = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!isConnected) {
      hasCheckedSession.current = {};
      setVerificationStatus({});
    }
  }, [isConnected]);

  useEffect(() => {
    let mounted = true;
    const checkAndVerify = async () => {
      if (
        isConnected &&
        solana &&
        primaryAccount &&
        user?.walletId === primaryAccount.walletId &&
        !hasCheckedSession.current[primaryAccount.address]
      ) {
        hasCheckedSession.current[primaryAccount.address] = true;
        setVerificationStatus((prev) => ({
          ...prev,
          [primaryAccount.address]: "Checking session...",
        }));

        const bundles = await fetchBundles();
        if (!mounted) return;

        if (bundles === null) {
          setWalletVerified(primaryAccount.walletId, false);
          await handleVerify(primaryAccount.address, primaryAccount.walletId);
        } else {
          setVerificationStatus((prev) => ({
            ...prev,
            [primaryAccount.address]: "Verified!",
          }));
        }
      }
    };
    checkAndVerify();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConnected,
    solana,
    primaryAccount?.address,
    primaryAccount?.walletId,
    user?.walletId,
  ]);

  const getWalletIconById = (walletId: string) => {
    const foundWallet = wallets.find((w) => w.id === walletId);
    return foundWallet?.icon;
  };

  // If there are no saved wallets and we are not connected, we have nothing to show.
  if (
    (!isConnected || !accounts || accounts.length === 0) &&
    savedWallets.length === 0
  ) {
    return <CustomConnectButton />;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleOpenDevices}
        className="flex items-center gap-2 py-1.5 px-3 bg-zinc-900 border border-zinc-800 rounded-full shadow-sm hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
      >
        <span className="text-[15px] text-zinc-100 font-medium tracking-wide">
          Devices
        </span>
        <Monitor className="w-4 h-4 text-zinc-300" />
      </button>

      <ProfileButton allAccounts={allAccounts} onClick={handleOpen} />

      <CustomConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />

      <WalletModal
        showModal={showModal}
        isOpen={isOpen}
        isClosing={isClosing}
        allAccounts={allAccounts}
        isWalletExpanded={isWalletExpanded}
        setIsWalletExpanded={setIsWalletExpanded}
        user={user}
        verificationStatus={verificationStatus}
        getWalletIconById={getWalletIconById}
        onVerify={handleVerify}
        onClose={handleClose}
        onRemove={removeSavedWallet}
        onClearAll={clearSavedWallets}
        onConnectAnother={() => {
          handleClose();
          setShowConnectModal(true);
        }}
      />

      <DevicesModal
        showModal={showDevicesModal}
        isOpen={isDevicesOpen}
        isClosing={isDevicesClosing}
        onClose={handleCloseDevices}
      />
    </div>
  );
}
