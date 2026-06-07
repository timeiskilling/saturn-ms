import React, { useEffect, useState, useRef } from "react";
import { X, Info } from "lucide-react";
import type { QuoteOptions } from "../types";
import { HIGH_FEE_THRESHOLD_PERCENT } from "../../../lib/constants";

interface AdvancedSettingsProps {
  options: QuoteOptions | undefined;
  onUpdateOptions: (field: keyof QuoteOptions, value: any) => void;
  onClose: () => void;
  slippageBps: number;
  onSlippageChange: (bps: number) => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function AdvancedSettings({
  options,
  onUpdateOptions,
  onClose,
  slippageBps,
  onSlippageChange,
  triggerRef,
}: AdvancedSettingsProps) {
  const slippageValue = slippageBps / 100;
  const [localSlippage, setLocalSlippage] = useState(
    slippageBps ? slippageValue.toString() : "",
  );

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
    let val = e.target.value.replace(/[^0-9.]/g, "");

    const [integer, fraction] = val.split(".");
    if (fraction && fraction.length > 2) {
      val = `${integer}.${fraction.slice(0, 2)}`;
    }

    let parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 100) {
      parsed = 100;
      val = "100";
    }

    setLocalSlippage(val);

    // Call onUpdateOptions only when there's an actual string to work with
    // to avoid wiping out values while user types "2."
    onUpdateOptions("dynamicSlippage", false);

    // Convert back from float to bps accurately (x100)
    // We allow decimal representations directly
    if (val === "" || val === ".") {
      onSlippageChange(0);
    } else if (!isNaN(parsed)) {
      onSlippageChange(Math.round(parsed * 100));
    }
  };

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (triggerRef?.current && triggerRef.current.contains(target)) {
        return;
      }

      if (
        modalRef.current &&
        !event.composedPath().includes(modalRef.current)
      ) {
        onClose();
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const ToggleSwitch = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <div
      onClick={onChange}
      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${checked ? "bg-[#29A874]" : "bg-zinc-700"}`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </div>
  );

  return (
    <div
      ref={modalRef}
      className="absolute top-12 left-1/2 -translate-x-1/2 w-90 max-h-[80vh] flex flex-col bg-[#1E1E1E] border border-zinc-800 rounded-2xl shadow-2xl z-50"
    >
      <div className="flex items-center justify-between p-5 pb-4 border-b border-zinc-800/50 shrink-0">
        <h3 className="text-lg font-bold text-white">Advanced Settings</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 overflow-y-auto scrollbar-hide">
        {/* Fee tolerance (Slippage) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-zinc-300">
                Fee tolerance (Slippage)
              </span>
              <Info className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            {slippageValue > HIGH_FEE_THRESHOLD_PERCENT && (
              <span className="text-xs text-orange-500 font-medium">
                You may pay high fees
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 bg-[#141414] rounded-lg p-2 border border-zinc-800">
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

              <div className="flex bg-[#141414] rounded-lg p-0.5 border border-zinc-800 shrink-0">
                <button
                  onClick={() => onUpdateOptions("dynamicSlippage", true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${
                    options?.dynamicSlippage
                      ? "bg-[#1A2622] text-[#29A874] border-[#29A874]"
                      : "border-transparent text-zinc-400 hover:text-zinc-300"
                  }`}
                >
                  Auto
                </button>
                {[0.5, 1, 5].map((preset) => {
                  const isActive =
                    !options?.dynamicSlippage && slippageValue === preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => handleSlippagePreset(preset)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${
                        isActive
                          ? "bg-[#1A2622] text-[#29A874] border-[#29A874]"
                          : "border-transparent text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      {preset}%
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Mode */}
        <div className="mb-6 pt-5 border-t border-zinc-800/50">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-sm font-medium text-zinc-300">Swap Mode</span>
            <Info className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="flex w-full bg-[#141414] rounded-lg p-0.5 border border-zinc-800">
            {[
              { label: "Exact In", value: 0 },
              { label: "Exact Out", value: 1 },
            ].map((mode) => (
              <button
                key={mode.label}
                onClick={() => onUpdateOptions("swapMode", mode.value)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors border ${
                  (options?.swapMode ?? 0) === mode.value
                    ? "bg-[#1A2622] text-[#29A874] border-[#29A874]"
                    : "border-transparent text-zinc-400 hover:text-zinc-300"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dexes Inclusion / Exclusion */}
        <div className="mb-6 pt-5 border-t border-zinc-800/50 flex flex-col gap-4">
          <div>
            <span className="text-sm font-medium text-zinc-300 mb-2 block">
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
              className="w-full bg-[#141414] text-white text-xs font-medium outline-none rounded-lg p-2.5 border border-zinc-800 focus:border-zinc-600 transition-colors"
              placeholder="e.g. Jupiter, Raydium"
            />
          </div>
          <div>
            <span className="text-sm font-medium text-zinc-300 mb-2 block">
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
              className="w-full bg-[#141414] text-white text-xs font-medium outline-none rounded-lg p-2.5 border border-zinc-800 focus:border-zinc-600 transition-colors"
              placeholder="e.g. Orca, Meteora"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-5 border-t border-zinc-800/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-zinc-300">
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
              <span className="text-sm font-medium text-zinc-300">
                Only Direct Routes
              </span>
            </div>
            <ToggleSwitch
              checked={!!options?.onlyDirectRoutes}
              onChange={() =>
                onUpdateOptions("onlyDirectRoutes", !options?.onlyDirectRoutes)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-zinc-300">
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
            <span className="text-sm font-medium text-zinc-300">
              Max Accounts
            </span>
            <input
              type="number"
              value={options?.maxAccounts ?? 64}
              onChange={(e) =>
                onUpdateOptions("maxAccounts", parseInt(e.target.value) || 64)
              }
              className="w-20 bg-[#141414] text-white text-xs text-center font-medium outline-none rounded-lg p-1.5 border border-zinc-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
