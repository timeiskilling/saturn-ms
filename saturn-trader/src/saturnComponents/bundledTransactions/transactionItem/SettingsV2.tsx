import React, { useEffect, useState, useRef } from "react";
import { X, Info } from "lucide-react";
import type { QuoteOptions } from "../types";
import { createPortal } from "react-dom";
import { HIGH_FEE_THRESHOLD_PERCENT } from "../../../lib/constants";

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
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!options?.dynamicSlippage) {
      const numericLocal = parseFloat(localSlippage);
      const isEquivalent =
        !isNaN(numericLocal) && Math.round(numericLocal * 100) === slippageBps;
      if (!isEquivalent && slippageBps > 0) {
        setLocalSlippage((slippageBps / 100).toString());
      } else if (
        !isEquivalent &&
        slippageBps === 0 &&
        localSlippage !== "" &&
        localSlippage !== "."
      ) {
        setLocalSlippage("");
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
    onUpdateOptions("dynamicSlippage", false);
    let parsed = parseFloat(val);
    if (val === "" || val === ".") {
      onSlippageChange(0);
    } else if (!isNaN(parsed)) {
      if (parsed > 100) {
        parsed = 100;
        setLocalSlippage("100");
      }
      onSlippageChange(Math.round(parsed * 100));
    }
  };

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

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-120 max-h-[90vh] flex flex-col bg-[#1E1E1E] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-7 pb-6">
          <h3 className="text-xl font-bold text-white">Advanced Settings</h3>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-500 hover:text-white transition-colors"
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
                  value={options?.dynamicSlippage ? "Auto" : localSlippage}
                  onChange={handleCustomSlippage}
                  disabled={!!options?.dynamicSlippage}
                  className={`w-full bg-transparent text-sm font-medium outline-none ${
                    options?.dynamicSlippage ? "text-zinc-500" : "text-white"
                  }`}
                  placeholder="Custom %"
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

          {/* Swap Mode */}

          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="text-base font-medium text-zinc-300">
                Swap Mode
              </span>

              <Info className="w-4 h-4 text-zinc-500" />
            </div>

            <div className="flex w-full bg-[#141414] rounded-lg p-1 border border-zinc-700/50 gap-1.5">
              {[
                { label: "Exact In", value: 0 },

                { label: "Exact Out", value: 1 },
              ].map((mode) => (
                <button
                  key={mode.label}
                  onClick={() => onUpdateOptions("swapMode", mode.value)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors border ${
                    (options?.swapMode ?? 0) === mode.value
                      ? "bg-white text-black border-transparent"
                      : "bg-[#141414] border-zinc-700/50 text-zinc-400 hover:text-white"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
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
