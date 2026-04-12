import React, { useState } from "react";
import {
  PhantomProvider,
  useModal,
  darkTheme,
  usePhantom,
  useSolana,
} from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";
import { verifyWallet } from "../../api/verifyWallet";

export function PhantomTestApp() {
  return (
    <PhantomProvider
      config={{
        providers: ["google", "apple", "injected", "deeplink"], // Enabled auth methods
        appId: "your-app-id", // Get your app ID from phantom.com/portal
        addressTypes: [AddressType.solana, AddressType.ethereum],
        authOptions: {
          redirectUrl: "https://yourapp.com/auth/callback", // Must be whitelisted in Phantom Portal
        },
      }}
      theme={darkTheme}
      appIcon="https://your-app.com/icon.png"
      appName="Your App Name"
    >
      <WalletComponent />
    </PhantomProvider>
  );
}

function WalletComponent() {
  const { open } = useModal();
  const { isConnected, user } = usePhantom();
  const { solana } = useSolana();
  const [verificationStatus, setVerificationStatus] = useState<string>("");

  const handleVerify = async () => {
    if (!solana || !solana.publicKey) {
      setVerificationStatus("Solana wallet not connected.");
      return;
    }

    setVerificationStatus("Verifying...");
    try {
      const success = await verifyWallet(solana, solana.publicKey);
      if (success) {
        setVerificationStatus("Wallet successfully verified!");
      } else {
        setVerificationStatus("Verification failed.");
      }
    } catch (error) {
      console.error(error);
      setVerificationStatus("Error during verification.");
    }
  };

  if (isConnected) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-white">
          Connected to: {solana.publicKey || user?.walletId}
        </p>
        <button
          onClick={handleVerify}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Message & Verify
        </button>
        {verificationStatus && (
          <p className="mt-2 text-sm text-gray-300">{verificationStatus}</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={open}
      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
    >
      Connect Wallet
    </button>
  );
}
