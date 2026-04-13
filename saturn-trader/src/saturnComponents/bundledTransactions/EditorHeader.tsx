import { Save, Wallet } from "lucide-react";
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
  return (
    <div className="px-8 py-5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-950/50 backdrop-blur-sm shrink-0">
      <div className="flex flex-col min-w-160">
        <input
          value={activeTemplate.name}
          maxLength={43}
          onChange={(e) =>
            updateActiveTemplate({
              ...activeTemplate,
              name: e.target.value,
            })
          }
          className="text-2xl font-bold bg-transparent border-none outline-none text-white focus:ring-0 p-0 hover:bg-zinc-900/50 rounded transition-colors truncate"
          placeholder="Template Name..."
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSaveBundles}
          disabled={isSavingBundles}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg shadow-sm font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSavingBundles ? "Saving..." : "Save Bundles"}
        </button>
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
              <Wallet className="w-4 h-4 text-blue-400" />
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
