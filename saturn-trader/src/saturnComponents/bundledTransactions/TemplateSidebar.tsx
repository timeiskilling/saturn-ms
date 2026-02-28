import React from "react";
import { Layers, Plus, ArrowRight } from "lucide-react";
import { type Template, POPULAR_TOKENS } from "./types";

interface TemplateSidebarProps {
  templates: Template[];
  activeTemplateId: string | null;
  setActiveTemplateId: (id: string) => void;
  handleAddTemplate: () => void;
}

export function TemplateSidebar({
  templates,
  activeTemplateId,
  setActiveTemplateId,
  handleAddTemplate,
}: TemplateSidebarProps) {
  const getTokenSymbol = (mint: string) => {
    return POPULAR_TOKENS.find((t) => t.mint === mint)?.symbol || "Custom";
  };

  return (
    <div className="w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          <h2 className="font-bold text-zinc-100">Bundle Templates</h2>
        </div>
        <button
          onClick={handleAddTemplate}
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
          title="Create New Template"
        >
          <Plus className="w-4 h-4 text-zinc-300" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => setActiveTemplateId(template.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              activeTemplateId === template.id
                ? "bg-zinc-900 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-semibold text-zinc-100 truncate pr-2">
                {template.name}
              </h3>
            </div>

            {/* Visual mini-indicator of the bundle flow */}
            <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
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
        ))}
      </div>
    </div>
  );
}
