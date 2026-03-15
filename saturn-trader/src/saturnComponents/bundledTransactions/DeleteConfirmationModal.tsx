import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Template",
  message = "Are you sure you want to delete this template?",
}: DeleteConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
        onClose();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-[58px] w-72 z-50 px-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-zinc-900 border border-red-500/50 rounded-lg shadow-2xl overflow-hidden">
        <div className="p-3 bg-red-500/10 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-zinc-100 leading-none mb-1">
                {title}
              </h3>
              <p className="text-xs text-zinc-400 leading-tight">{message}</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              onClick={onClose}
              className="px-2 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded transition-colors shadow-sm"
            >
              Delete
              <kbd className="font-sans text-[10px] bg-red-700/50 px-1 py-0.5 rounded text-red-100 leading-none flex items-center gap-0.5">
                Enter ↵
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
