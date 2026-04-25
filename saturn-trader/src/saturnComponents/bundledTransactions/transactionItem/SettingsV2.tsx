import React, { useEffect, useState, useRef } from "react";
import { X, Info, Plus, ChevronDown, Check } from "lucide-react";
import type { QuoteOptions } from "../types";
import { createPortal } from "react-dom";
import { HIGH_FEE_THRESHOLD_PERCENT } from "../../../lib/constants";
import { cn } from "@/lib/utils";

const SOLANA_DEXES = [
  "Jupiter",
  "Raydium",
  "Orca",
  "Meteora",
  "Lifinity",
  "Fluxbeam",
  "Phoenix",
  "OpenBook",
  "Whirlpools",
];

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <div
    onClick={onChange}
    className={cn(
      "w-10 h-5 rounded-full relative cursor-pointer transition-all duration-200",
      checked ? "bg-zinc-100" : "bg-zinc-800",
    )}
  >
    <div
      className={cn(
        "w-4 h-4 bg-black rounded-full absolute top-0.5 transition-transform duration-200",
        checked ? "translate-x-5.5" : "translate-x-0.5",
        !checked && "bg-zinc-400",
      )}
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
    className={cn(
      "px-3 py-1.5 text-xs font-semibold rounded-md transition-all border",
      active
        ? "bg-zinc-100 text-black border-transparent shadow-sm"
        : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300",
    )}
  >
    {label}
  </button>
);

const DexPicker = ({
  label,
  selectedDexes,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  selectedDexes: string[];
  onChange: (dexes: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddDex = (dex: string) => {
    if (disabled) return;
    const trimmed = dex.trim();
    if (trimmed && !selectedDexes.includes(trimmed)) {
      onChange([...selectedDexes, trimmed]);
    }
    setInputValue("");
    setIsOpen(false);
  };

  const handleRemoveDex = (dex: string) => {
    if (disabled) return;
    onChange(selectedDexes.filter((d) => d !== dex));
  };

  const filteredSuggestions = SOLANA_DEXES.filter(
    (dex) =>
      dex.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedDexes.includes(dex),
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-2 transition-opacity duration-200",
        disabled && "opacity-40",
      )}
      ref={containerRef}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-400">{label}</span>
        {disabled && (
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">
            Mutually Exclusive
          </span>
        )}
      </div>
      <div className="relative">
        <div
          className={cn(
            "flex flex-wrap gap-2 p-2 min-h-[44px] bg-zinc-900/50 border border-zinc-800 rounded-xl focus-within:border-zinc-700 transition-colors",
            !disabled ? "cursor-text" : "cursor-not-allowed",
          )}
          onClick={() => !disabled && setIsOpen(true)}
        >
          {selectedDexes.map((dex) => (
            <span
              key={dex}
              className="flex items-center gap-1 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700"
            >
              {dex}
              <button
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveDex(dex);
                }}
                className="hover:text-white transition-colors disabled:cursor-not-allowed"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {!disabled && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue) {
                  handleAddDex(inputValue);
                } else if (
                  e.key === "Backspace" &&
                  !inputValue &&
                  selectedDexes.length > 0
                ) {
                  const lastDex = selectedDexes[selectedDexes.length - 1];
                  if (lastDex !== undefined) handleRemoveDex(lastDex);
                }
              }}
              placeholder={selectedDexes.length === 0 ? placeholder : ""}
              className="flex-1 min-w-20 bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-600"
            />
          )}
        </div>
        {isOpen &&
          !disabled &&
          (filteredSuggestions.length > 0 || inputValue) && (
            <div className="absolute z-10 w-full mt-2 py-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {inputValue &&
                !SOLANA_DEXES.some(
                  (d) => d.toLowerCase() === inputValue.toLowerCase(),
                ) && (
                  <button
                    onClick={() => handleAddDex(inputValue)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors text-left"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add "{inputValue}"
                  </button>
                )}
              {filteredSuggestions.map((dex) => (
                <button
                  key={dex}
                  onClick={() => handleAddDex(dex)}
                  className="w-full px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors text-left"
                >
                  {dex}
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

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
  const [localMaxAccounts, setLocalMaxAccounts] = useState(
    options?.maxAccounts?.toString() ?? "64",
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

  const handleReset = () => {
    onUpdateOptions("dynamicSlippage", true);
    onUpdateOptions("dexes", []);
    onUpdateOptions("excludeDexes", []);
    onUpdateOptions("restrictIntermediateTokens", false);
    onUpdateOptions("onlyDirectRoutes", false);
    onUpdateOptions("asLegacyTransaction", false);
    onUpdateOptions("maxAccounts", 64);
    onSlippageChange(0);
    setLocalSlippage("");
    setLocalMaxAccounts("64");
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

  useEffect(() => {
    if (options?.maxAccounts !== undefined) {
      const currentVal = parseInt(localMaxAccounts);
      if (currentVal !== options.maxAccounts) {
        setLocalMaxAccounts(options.maxAccounts.toString());
      }
    }
  }, [options?.maxAccounts]);

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

  const isIncludeDisabled = (options?.excludeDexes?.length ?? 0) > 0;
  const isExcludeDisabled = (options?.dexes?.length ?? 0) > 0;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out",
        isOpen && !isClosing
          ? "bg-black/80 backdrop-blur-md"
          : "bg-transparent backdrop-blur-none",
      )}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-md max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 ease-out",
          isOpen && !isClosing
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-8",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-900">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Advanced Settings
            </h3>
            <button
              onClick={handleReset}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-wider text-left transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-6 overflow-y-auto scrollbar-hide flex flex-col gap-8">
          {/* Fee tolerance (Slippage) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Slippage Tolerance
                </span>
                <Info className="w-3.5 h-3.5 text-zinc-600" />
              </div>

              {!options?.dynamicSlippage &&
                slippageValue > HIGH_FEE_THRESHOLD_PERCENT && (
                  <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-bold uppercase">
                    High Fees Warning
                  </span>
                )}
            </div>

            <div className="flex items-stretch gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-900">
              <div className="flex-1 flex items-center px-4">
                <input
                  type="text"
                  value={options?.dynamicSlippage ? "" : localSlippage}
                  onChange={handleCustomSlippage}
                  className="w-full bg-transparent text-lg font-bold outline-none text-white placeholder:text-zinc-700"
                  placeholder="Auto"
                />
                {!options?.dynamicSlippage && localSlippage && (
                  <span className="text-zinc-500 font-bold ml-1">%</span>
                )}
              </div>

              <div className="flex bg-zinc-900 rounded-xl p-1 gap-1">
                <SegmentedControlButton
                  label="Auto"
                  active={!!options?.dynamicSlippage}
                  onClick={() => onUpdateOptions("dynamicSlippage", true)}
                />
                {[0.5, 1.0, 5.0].map((preset) => (
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

          {/* DEX Selection */}
          <div className="flex flex-col gap-6">
            <DexPicker
              label="Include DEXes"
              selectedDexes={options?.dexes || []}
              onChange={(dexes) => onUpdateOptions("dexes", dexes)}
              placeholder={
                isIncludeDisabled
                  ? "Clear Excluded DEXes first"
                  : "All DEXes included by default"
              }
              disabled={isIncludeDisabled}
            />

            <DexPicker
              label="Exclude DEXes"
              selectedDexes={options?.excludeDexes || []}
              onChange={(dexes) => onUpdateOptions("excludeDexes", dexes)}
              placeholder={
                isExcludeDisabled
                  ? "Clear Included DEXes first"
                  : "Search DEXes to exclude..."
              }
              disabled={isExcludeDisabled}
            />
          </div>

          {/* Toggles & Numbers */}
          <div className="flex flex-col gap-1 pt-6 border-t border-zinc-900">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-zinc-300">
                Restrict Intermediate Tokens
              </span>
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

            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-zinc-300">
                Only Direct Routes
              </span>
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

            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-zinc-300">
                As Legacy Transaction
              </span>
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

            <div className="flex items-center justify-between py-3 mt-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-300">
                  Max Accounts
                </span>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight">
                  Solana transaction limit
                </span>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  inputMode="numeric"
                  value={localMaxAccounts}
                  onChange={(e) => {
                    const rawVal = e.target.value.replace(/[^0-9]/g, "");
                    setLocalMaxAccounts(rawVal);
                    if (rawVal !== "") {
                      let val = parseInt(rawVal);
                      onUpdateOptions("maxAccounts", val);
                    }
                  }}
                  onBlur={() => {
                    if (localMaxAccounts === "") {
                      setLocalMaxAccounts("64");
                      onUpdateOptions("maxAccounts", 64);
                    } else {
                      let val = parseInt(localMaxAccounts);
                      if (val < 0) val = 64;
                      setLocalMaxAccounts(val.toString());
                      onUpdateOptions("maxAccounts", val);
                    }
                  }}
                  className="w-24 bg-zinc-900/50 text-white text-right font-bold outline-none rounded-xl py-2 px-3 border border-zinc-800 focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
