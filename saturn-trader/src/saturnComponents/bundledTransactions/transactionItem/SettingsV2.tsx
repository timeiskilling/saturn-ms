import React, { useEffect, useState, useRef } from "react";
import { X, Info } from "lucide-react";
import type { QuoteOptions } from "../types";
import { createPortal } from "react-dom";
import { HIGH_FEE_THRESHOLD_PERCENT } from "../../../lib/constants";

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <div
    onClick={onChange}
    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${checked ? "bg-[#DADADA]" : "bg-[#0F0F0F]"}`}
  >
    <div
      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? "translate-x-6.5" : "translate-x-0.5"}`}
    />
  </div>
);

const SegmentedControlButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
      active
        ? "bg-white text-black border-transparent"
        : "bg-[#141414] border-zinc-700/50 text-zinc-400 hover:text-white"
    }`}
  >
    {label}
  </button>
);

interface AdvancedSettingsProps {
  options: QuoteOptions | undefined;
  onUpdateOptions: (field: keyof QuoteOptions, value: any) => void;
  onClose: () => void;
  slippageBps: number;
  onSlippageChange: (bps: number) => void;
}

export function AdvancedSettings({
  options,
  onUpdateOptions,
  onClose,
  slippageBps,
  onSlippageChange,
}: AdvancedSettingsProps) {
  const slippageValue = slippageBps / 100;
  const [localSlippage, setLocalSlippage] = useState(
    slippageBps ? slippageValue.toString() : "",
  );
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  useEffect(() => {
    if (options?.dynamicSlippage) {
      if (localSlippage !== "") setLocalSlippage("");
    } else {
      const numericLocal = parseFloat(localSlippage);
      const isEquivalent =
        !isNaN(numericLocal) && Math.round(numericLocal * 100) === slippageBps;
      if (!isEquivalent && slippageBps > 0) {
        setLocalSlippage((slippageBps / 100).toString());
      }
    }
  }, [slippageBps, options?.dynamicSlippage, localSlippage]);

  const handleSlippagePreset = (percent: number) => {
    onUpdateOptions("dynamicSlippage", false);
    setLocalSlippage(percent.toString());
    onSlippageChange(percent * 100);
  };

  const handleCustomSlippage = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value.replace(/,/g, ".");
    let val = rawVal.replace(/[^0-9.]/g, "");

    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }

    const [integer, fraction] = val.split(".");
    if (fraction && fraction.length > 2) {
      val = `${integer}.${fraction.slice(0, 2)}`;
    }
    setLocalSlippage(val);

    if (val === "" || val === ".") {
      onUpdateOptions("dynamicSlippage", true);
    } else {
      onUpdateOptions("dynamicSlippage", false);
      let parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        if (parsed > 100) {
          parsed = 100;
          setLocalSlippage("100");
        }
        onSlippageChange(Math.round(parsed * 100));
      }
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isOpen && !isClosing
          ? "bg-black/60 backdrop-blur-sm"
          : "bg-transparent backdrop-blur-none"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-120 max-h-[90vh] flex flex-col bg-[#121212] border border-zinc-800/80 rounded-3xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 ease-out ${
          isOpen && !isClosing
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-8"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
          <h3 className="text-xl font-bold text-zinc-100">Advanced Settings</h3>

          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-7 pt-4 overflow-y-auto scrollbar-hide flex flex-col gap-6">
          {/* Fee tolerance (Slippage) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-medium text-zinc-300">
                  Fee tolerance (Slippage)
                </span>

                <Info className="w-4 h-4 text-zinc-500" />
              </div>

              {slippageValue > HIGH_FEE_THRESHOLD_PERCENT && (
                <span className="text-xs text-orange-500 font-medium">
                  You may pay high fees
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 bg-[#141414] rounded-lg p-3 border border-zinc-700/50">
                <input
                  type="text"
                  value={options?.dynamicSlippage ? "" : localSlippage}
                  onChange={handleCustomSlippage}
                  className={`w-full bg-transparent text-sm font-medium outline-none ${
                    options?.dynamicSlippage ? "text-zinc-500" : "text-white"
                  }`}
                  placeholder="Auto"
                />
              </div>

              <div className="flex bg-[#141414] rounded-lg p-1 border border-zinc-700/50 shrink-0 gap-1.5">
                <SegmentedControlButton
                  label="Auto"
                  active={!!options?.dynamicSlippage}
                  onClick={() => onUpdateOptions("dynamicSlippage", true)}
                />

                {[0.5, 1, 5].map((preset) => (
                  <SegmentedControlButton
                    key={preset}
                    label={`${preset}%`}
                    active={
                      !options?.dynamicSlippage && slippageValue === preset
                    }
                    onClick={() => handleSlippagePreset(preset)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Dexes Inclusion / Exclusion */}

          <div className="flex flex-col gap-5">
            <div>
              <span className="text-base font-medium text-zinc-300 mb-3 block">
                Include Dexes (comma separated)
              </span>

              <input
                type="text"
                value={options?.dexes?.join(",") || ""}
                onChange={(e) =>
                  onUpdateOptions(
                    "dexes",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                className="w-full bg-[#141414] text-white text-sm font-medium outline-none rounded-lg p-3 border border-zinc-700/50 focus:border-zinc-500 transition-colors"
                placeholder="e.g. Jupiter, Raydium"
              />
            </div>

            <div>
              <span className="text-base font-medium text-zinc-300 mb-3 block">
                Exclude Dexes (comma separated)
              </span>

              <input
                type="text"
                value={options?.excludeDexes?.join(",") || ""}
                onChange={(e) =>
                  onUpdateOptions(
                    "excludeDexes",

                    e.target.value

                      .split(",")

                      .map((s) => s.trim())

                      .filter(Boolean),
                  )
                }
                className="w-full bg-[#141414] text-white text-sm font-medium outline-none rounded-lg p-3 border border-zinc-700/50 focus:border-zinc-500 transition-colors"
                placeholder="e.g. Orca, Meteora"
              />
            </div>
          </div>

          {/* Toggles */}

          <div className="pt-5 border-t border-zinc-800/50 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-medium text-zinc-300">
                  Restrict Intermediate Tokens
                </span>
              </div>

              <ToggleSwitch
                checked={!!options?.restrictIntermediateTokens}
                onChange={() =>
                  onUpdateOptions(
                    "restrictIntermediateTokens",

                    !options?.restrictIntermediateTokens,
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-medium text-zinc-300">
                  Only Direct Routes
                </span>
              </div>

              <ToggleSwitch
                checked={!!options?.onlyDirectRoutes}
                onChange={() =>
                  onUpdateOptions(
                    "onlyDirectRoutes",
                    !options?.onlyDirectRoutes,
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-medium text-zinc-300">
                  As Legacy Transaction
                </span>
              </div>

              <ToggleSwitch
                checked={!!options?.asLegacyTransaction}
                onChange={() =>
                  onUpdateOptions(
                    "asLegacyTransaction",

                    !options?.asLegacyTransaction,
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-medium text-zinc-300">
                Max Accounts
              </span>

              <input
                type="number"
                value={options?.maxAccounts ?? 64}
                onChange={(e) =>
                  onUpdateOptions("maxAccounts", parseInt(e.target.value) || 64)
                }
                className="w-24 bg-[#141414] text-white text-base text-center font-medium outline-none rounded-lg p-2.5 border border-zinc-700/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
