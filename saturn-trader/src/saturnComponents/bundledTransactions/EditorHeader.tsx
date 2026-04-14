import { useState, useEffect, useRef } from "react";
import { Save, Wallet, Loader2, Check } from "lucide-react";
import { type Template } from "./types";
import { type SavedWallet } from "../../hooks/useConnectedWallets";

interface EditorHeaderProps {
  activeTemplate: Template;
  updateActiveTemplate: (template: Template) => void;
  handleSaveBundles: () => void;
  isSavingBundles: boolean;
  bundleWalletAddress?: string;
  activeBundleWallet?: SavedWallet;
  discoveredWallets: any[];
}

export function EditorHeader({
  activeTemplate,
  updateActiveTemplate,
  handleSaveBundles,
  isSavingBundles,
  bundleWalletAddress,
  activeBundleWallet,
  discoveredWallets,
}: EditorHeaderProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const prevSavingRef = useRef(isSavingBundles);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isSavingBundles) {
          handleSaveBundles();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveBundles, isSavingBundles]);

  useEffect(() => {
    if (prevSavingRef.current && !isSavingBundles) {
      setLastSaved(new Date());
      setJustSaved(true);

      const timer = setTimeout(() => setJustSaved(false), 2000);
      return () => clearTimeout(timer);
    }
    prevSavingRef.current = isSavingBundles;
  }, [isSavingBundles]);

  return (
    <div className="w-full px-8 py-5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-950/50 backdrop-blur-sm shrink-0">
      <div className="flex flex-col flex-1 min-w-40">
        <input
          value={activeTemplate.name}
          maxLength={43}
          onChange={(e) =>
            updateActiveTemplate({
              ...activeTemplate,
              name: e.target.value,
            })
          }
          className="text-2xl font-bold w-full bg-transparent border-none outline-none text-white focus:ring-0 p-0 hover:bg-zinc-900/50 rounded transition-colors truncate"
          placeholder="Template Name..."
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex items-center gap-3">
          <div className="w-24 text-right">
            <span
              className={`text-xs text-zinc-500 font-medium transition-opacity duration-300 ${
                lastSaved && !isSavingBundles ? "opacity-100" : "opacity-0"
              }`}
            >
              {lastSaved &&
                `Saved at ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </span>
          </div>

          <button
            onClick={handleSaveBundles}
            disabled={isSavingBundles}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[13px]
              font-medium transition-all duration-200 outline-none active:scale-[0.97]
              ${
                isSavingBundles
                  ? "border-white/10 text-white/35 bg-white/[0.04] cursor-default"
                  : justSaved
                    ? "border-white/90 text-black bg-white cursor-default"
                    : "border-white/25 text-white bg-white/[0.06] hover:border-white/45 hover:bg-white/[0.12]"
              }
            `}
          >
            {isSavingBundles ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : justSaved ? (
              <Check className="w-3.5 h-3.5 text-black" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}

            <span>
              {isSavingBundles ? "Saving" : justSaved ? "Saved" : "Save"}
            </span>

            {!isSavingBundles && !justSaved && (
              <span className="ml-0.5 text-[10px] font-mono px-1 py-0.5 rounded bg-white/[0.08] border border-white/15 text-white/40 leading-none">
                ⌘S
              </span>
            )}
          </button>
        </div>

        {bundleWalletAddress && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm"
            title="This wallet will be used to sign all steps in this bundle."
          >
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mr-1">
              Signer
            </span>
            {activeBundleWallet?.icon ||
            discoveredWallets.find(
              (w) =>
                w.name === activeBundleWallet?.name ||
                w.id === activeBundleWallet?.walletId,
            )?.icon ? (
              <img
                src={
                  activeBundleWallet?.icon ||
                  discoveredWallets.find(
                    (w) =>
                      w.name === activeBundleWallet?.name ||
                      w.id === activeBundleWallet?.walletId,
                  )?.icon
                }
                alt={activeBundleWallet?.name || "Wallet"}
                className="w-4 h-4 rounded-sm object-cover bg-white"
              />
            ) : (
              <Wallet className="w-4 h-4 text-zinc-400" />
            )}
            <span className="text-sm font-medium text-zinc-300">
              {activeBundleWallet?.name || "Wallet"}
              <span className="text-zinc-500 ml-1">
                ({bundleWalletAddress.slice(0, 4)}...
                {bundleWalletAddress.slice(-4)})
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
