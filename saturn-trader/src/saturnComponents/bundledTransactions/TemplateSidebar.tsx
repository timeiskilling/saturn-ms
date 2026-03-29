import React, { useState } from "react";
import { Layers, Plus, ArrowRight, Play, Trash2 } from "lucide-react";
import { type Template, POPULAR_TOKENS } from "./types";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { useTokenList } from "@/hooks/useTokenList";

interface TemplateSidebarProps {
  templates: Template[];
  activeTemplateId: string | null;
  setActiveTemplateId: (id: string) => void;
  handleAddTemplate: () => void;
  handleDeleteTemplate?: (id: string) => void;
  handleExecuteTemplate?: (template: Template) => void;
}

export function TemplateSidebar({
  templates,
  activeTemplateId,
  setActiveTemplateId,
  handleAddTemplate,
  handleDeleteTemplate,
  handleExecuteTemplate,
}: TemplateSidebarProps) {
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(
    null,
  );
  const { tokens: allTokens } = useTokenList();

  const getTokenSymbol = (mint: string) => {
    return allTokens.find((t) => t.mint === mint)?.symbol || "Custom";
  };

  return (
    <div className="relative w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
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

      <DeleteConfirmationModal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={() => {
          if (templateToDelete && handleDeleteTemplate) {
            handleDeleteTemplate(templateToDelete.id);
          }
        }}
        title="Delete Template"
        message={`Are you sure you want to delete "${templateToDelete?.name}"?`}
      />

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
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-zinc-100 truncate pr-2">
                {template.name}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTemplateToDelete(template);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (handleExecuteTemplate) {
                      handleExecuteTemplate(template);
                    } else {
                      console.log(`Executing template ${template.id}`);
                    }
                  }}
                  className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors shrink-0"
                  title="Execute Bundle"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

            {/* Visual mini-indicator of the bundle flow */}
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
        ))}
      </div>
    </div>
  );
}
