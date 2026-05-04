import React from "react";
import { ArrowRight, Play, Trash2 } from "lucide-react";
import { type Template } from "./types";
import { type TemplateStatus } from "./TemplateSidebar";
import { useTemplateStatus } from "@/hooks/useTemplateStatus";
import { validateTemplateExecution } from "./validation";

const FILL_STYLES = `
  .wf {
    position: absolute;
    top: 0; left: 0; bottom: 0;
    pointer-events: none;
    background: rgba(59,130,246,0.09);
    transition: width 700ms cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes failPulse {
    0%, 100% { opacity: 0; }
    50%       { opacity: 1; }
  }
`;

// Animates from 0 → target on mount, then transitions on fillPct change
function WaterFill({
  fillPct,
  isComplete,
}: {
  fillPct: number;
  isComplete: boolean;
}) {
  return (
    <div
      className="wf"
      style={{
        width: `${fillPct}%`,
        opacity: isComplete ? 0 : 1,
        transition: "width 700ms cubic-bezier(0.4,0,0.2,1), opacity 500ms ease",
      }}
    />
  );
}

interface TemplateSidebarItemProps {
  template: Template;
  status?: TemplateStatus;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onExecute: () => void;
  getTokenSymbol: (mint: string) => string;
  balances?: Record<string, any>;
  globalActiveAddress?: string;
}

export function TemplateSidebarItem({
  template,
  status,
  isActive,
  onSelect,
  onDelete,
  onExecute,
  getTokenSymbol,
  balances,
  globalActiveAddress,
}: TemplateSidebarItemProps) {
  const {
    isSuccess,
    isSuccessRaw,
    isFailed,
    isExecuting,
    isSuccessExpired,
    stageText,
    fillPct,
  } = useTemplateStatus(template.name, status);

  const {
    isTemplateEmpty,
    hasZeroAmount,
    isInsufficientBalance,
    isExecuteDisabled,
  } = validateTemplateExecution(
    template,
    balances,
    globalActiveAddress,
    isExecuting,
  );

  let bgClass = isActive
    ? "bg-zinc-900 border-blue-500/50"
    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900";

  if (isSuccess) {
    bgClass = isActive
      ? "bg-green-950/30 border-green-500/50"
      : "bg-green-950/20 border-green-900/50 hover:border-green-800 hover:bg-green-950/30";
  } else if (isFailed) {
    bgClass = isActive
      ? "bg-red-950/30 border-red-500/50"
      : "bg-red-950/20 border-red-900/50 hover:border-red-800 hover:bg-red-950/30";
  } else if (isExecuting || (status && !isSuccessRaw && !isFailed)) {
    bgClass = "bg-blue-950/20 border-blue-500/50";
  }

  return (
    <>
      <style>{FILL_STYLES}</style>
      <div
        onClick={onSelect}
        className={`relative overflow-hidden p-3 rounded-lg border cursor-pointer transition-all ${bgClass}`}
      >
        {/* Water fill */}
        {!isFailed && !isSuccessExpired && status && (
          <WaterFill fillPct={fillPct} isComplete={isSuccess} />
        )}

        {/* Failed Pulse */}
        {isFailed && (
          <div
            key={`fail-${status?.error ?? status?.stage}`}
            className="absolute inset-0 pointer-events-none rounded-[inherit] bg-red-500/25 opacity-0 animate-[failPulse_380ms_ease-in-out_3]"
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1 gap-2">
            <h3 className="text-sm font-semibold text-zinc-100 min-w-0 flex items-center gap-1.5 flex-1">
              <span className="truncate">{template.name}</span>
              {stageText && (
                <span
                  className={`shrink-0 text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded font-medium ${
                    isSuccess
                      ? "bg-green-500/20 text-green-400"
                      : isFailed
                        ? "bg-red-500/20 text-red-400"
                        : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {stageText}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 md:p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                title="Delete Template"
              >
                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isExecuteDisabled) return;
                  onExecute();
                }}
                disabled={isExecuteDisabled}
                className={`p-1 md:p-1.5 rounded-md transition-colors shrink-0 flex items-center justify-center ${
                  isExecuteDisabled
                    ? "text-zinc-600 cursor-not-allowed opacity-50"
                    : "text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                }`}
                title={
                  isTemplateEmpty
                    ? "0 transactions in bundle"
                    : hasZeroAmount
                      ? "Some transactions have 0 amount"
                      : isInsufficientBalance
                        ? "Insufficient balance"
                        : "Execute Bundle"
                }
              >
                <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
            {template.transactions.length === 0 && (
              <span className="text-xs text-zinc-600">Empty template</span>
            )}
            {template.transactions.map((tx, idx) => (
              <React.Fragment key={tx.id}>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 whitespace-nowrap">
                  {getTokenSymbol(tx.inputMint)}
                </span>
                {template.transactions.length - 1 > idx && (
                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
