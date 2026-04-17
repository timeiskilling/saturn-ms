import React, { useState } from "react";
import { useSolana } from "@phantom/react-sdk";
import { promoteWallet } from "../../../api/promoteWallet";

interface PromoteButtonProps {
  targetAddress: string;
  oldPrimaryWalletId: string;
  oldPrimaryName: string;
  oldPrimaryAddressType: string;
  onSuccess?: () => void;
}

export function PromoteButton({
  targetAddress,
  oldPrimaryWalletId,
  oldPrimaryName,
  oldPrimaryAddressType,
  onSuccess,
}: PromoteButtonProps) {
  const { solana } = useSolana();
  const [isPromoting, setIsPromoting] = useState(false);

  const handlePromote = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!solana) {
      console.error("Solana provider not ready.");
      return;
    }

    setIsPromoting(true);
    try {
      const success = await promoteWallet(
        solana,
        targetAddress,
        oldPrimaryWalletId,
        oldPrimaryName,
        oldPrimaryAddressType,
      );
      if (success) {
        onSuccess?.();
      } else {
        console.error("Failed to promote wallet.");
      }
    } catch (error) {
      console.error("Error during wallet promotion:", error);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <button
      onClick={handlePromote}
      disabled={isPromoting || !solana}
      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-200 transition-colors disabled:opacity-50"
    >
      {isPromoting ? "Promoting..." : "Promote"}
    </button>
  );
}
