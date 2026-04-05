import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  message = "Are you sure you want to delete this template? This action cannot be undone.",
}: DeleteConfirmationModalProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to allow the DOM to render before starting animation
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      // Wait for animation to finish before removing from DOM
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  if (!shouldRender || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transition-all duration-300 ease-out ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >

      <div
        className={`relative w-full max-w-sm bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-[0_0_40px_-15px_rgba(239,68,68,0.2)] overflow-hidden transition-all duration-300 ease-out ${
          isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >

        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-red-600/40 via-red-500 to-red-600/40" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 ring-4 ring-red-500/5">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>

            {/* Text content */}
            <div className="flex-1 pt-1">
              <h3 className="text-base font-semibold text-zinc-100 tracking-tight mb-1.5">
                {title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-50 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg transition-all duration-200 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_-3px_rgba(239,68,68,0.6)]"
            >
              Delete
              {/* Keyboard hint */}
              <kbd className="hidden sm:flex items-center gap-1 font-sans text-[10px] bg-black/20 group-hover:bg-black/30 px-1.5 py-0.5 rounded text-red-50 font-medium tracking-wider border border-white/10 transition-colors">
                ENTER <span className="text-[12px] leading-none">↵</span>
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
