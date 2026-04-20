import React from "react";
import { createPortal } from "react-dom";
import { X, Monitor, Info } from "lucide-react";
import { DevicesList } from "./DevicesList";

interface DevicesModalProps {
  showModal: boolean;
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
}

export function DevicesModal({
  showModal,
  isOpen,
  isClosing,
  onClose,
}: DevicesModalProps) {
  if (!showModal) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex justify-end p-4 transition-all duration-300 ease-out ${
        isOpen && !isClosing
          ? "bg-black/60 backdrop-blur-sm"
          : "bg-transparent backdrop-blur-none"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-100 h-[calc(100vh-2rem)] flex flex-col bg-[#1A1A1A] border border-zinc-800 rounded-3xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-transform duration-300 ease-out ${
          isOpen && !isClosing ? "translate-x-0" : "translate-x-[110%]"
        }`}
      >
        <div className="p-6 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-bold text-zinc-100">
              Connected Devices
            </h3>
          </div>
          <button
            onClick={onClose}
            className="hover:text-zinc-300 transition-colors text-zinc-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 flex flex-col gap-4 flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-sm text-zinc-500 font-medium">
            Manage all active sessions for your account. Disconnecting a device
            will revoke its access immediately.
          </p>

          <DevicesList />
        </div>

        <div className="p-5 border-t border-zinc-800/50 flex items-center justify-between bg-[#141414] mt-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-zinc-200">
              Security Notice
            </span>
            <Info className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-[10px] text-zinc-500 max-w-45">
            Unrecognized activity? Disconnect the device and update your
            security settings.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
