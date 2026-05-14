import { verifyUnlink } from "../api/verifyUnlink";
import { useSolana } from "@phantom/react-sdk";
import { useState, useLayoutEffect } from "react";
import { toast } from "sonner";

export function ForceUnlink() {
  const { solana } = useSolana();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [publicKeyInput, setPublicKeyInput] = useState<string>("");
  const [walletType, setWalletType] = useState<"Solana" | "Ethereum">("Solana");
  const [isShortScreen, setIsShortScreen] = useState(false);

  useLayoutEffect(() => {
    const checkSize = () => {
      setIsShortScreen(window.innerHeight < 600);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const isValidPublicKey = (publicKey: string, type: "Ethereum" | "Solana") => {
    if (type === "Ethereum") {
      return publicKey.length === 42 && publicKey.startsWith("0x");
    }
    if (type === "Solana") {
      return publicKey.length >= 32 && publicKey.length <= 44;
    }
    return false;
  };

  const handleConfirmUnlink = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const trimmedKey = publicKeyInput.trim();

      if (!isValidPublicKey(trimmedKey, walletType)) {
        throw new Error(`Invalid ${walletType} public key format`);
      }

      if (walletType === "Solana") {
        if (!solana) {
          throw new Error(
            "Solana wallet provider not found. Please connect your wallet.",
          );
        }
        const response = await verifyUnlink(solana, trimmedKey);
        if (response) {
          setSuccess(true);
          toast.success("Successfully unlinked wallet.");
          setPublicKeyInput("");
        } else {
          throw new Error("Failed to unlink wallet.");
        }
      } else {
        throw new Error("Ethereum unlinking is not supported yet.");
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err);
      setError(errMessage);
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 overflow-hidden items-center">
      <div
        className={`text-center shrink-0 px-4 transition-all duration-300 ${isShortScreen ? "pt-2 pb-1" : "pt-4 sm:pt-6 pb-2"}`}
      >
        <p
          className={`text-[10px] text-zinc-500 tracking-[0.2em] uppercase font-mono mb-1 ${isShortScreen ? "mt-1" : "mt-2"}`}
        >
          Security & Access
        </p>
        <h1
          className={`${isShortScreen ? "text-xl" : "text-2xl sm:text-3xl"} font-medium text-zinc-200 tracking-tight font-mono`}
        >
          Force Unlink Wallet
        </h1>
        {!isShortScreen && (
          <p className="text-zinc-600 text-xs sm:text-sm mt-3 font-mono max-w-lg mx-auto">
            if you have lost access to your primary account but still have other
            active wallets linked to it, you can force unlink a wallet here.
            Enter the public key of the wallet you wish to remove and sign a
            message with your currently active wallet to verify ownership
          </p>
        )}
      </div>

      <div
        className={`w-full flex-1 flex justify-center items-start min-h-0 ${isShortScreen ? "pt-4" : "pt-12"}`}
      >
        <div className="w-full max-w-md px-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-zinc-400 text-sm font-mono uppercase tracking-wider">
              Wallet Type
            </label>
            <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
              <button
                onClick={() => setWalletType("Solana")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  walletType === "Solana"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
              >
                Solana
              </button>
              <button
                onClick={() => setWalletType("Ethereum")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  walletType === "Ethereum"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
              >
                Ethereum
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-zinc-400 text-sm font-mono uppercase tracking-wider">
              Public Key
            </label>
            <input
              type="text"
              value={publicKeyInput}
              onChange={(e) => setPublicKeyInput(e.target.value)}
              placeholder={`Enter ${walletType} public key`}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors font-mono text-sm"
            />
          </div>

          <button
            onClick={handleConfirmUnlink}
            disabled={loading || !publicKeyInput.trim()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              loading || !publicKeyInput.trim()
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30"
            }`}
          >
            {loading ? "Processing..." : "Force Unlink"}
          </button>

          {error && (
            <div className="p-3 bg-red-950/30 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-950/30 border border-green-500/50 rounded-lg text-green-500 text-sm text-center">
              Successfully unlinked wallet!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForceUnlink;
