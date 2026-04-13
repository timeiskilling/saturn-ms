import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface SwitchWalletModalProps {
  isOpen: boolean;
  pendingWalletPk: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function SwitchWalletModal({
  isOpen,
  pendingWalletPk,
  onClose,
  onConfirm,
}: SwitchWalletModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-zinc-100">Switch Bundle Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            To ensure fast and reliable execution, all steps in a single bundle
            must use the same wallet. Do you want to switch the entire bundle to{" "}
            <span className="font-mono text-zinc-300">
              {pendingWalletPk?.slice(0, 4)}...
              {pendingWalletPk?.slice(-4)}
            </span>
            ?
          </p>

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-amber-950 transition-colors border border-amber-500/20"
            >
              Switch Wallet
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
