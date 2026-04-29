import React, { useState, useEffect, useRef } from "react";
import { Layers, Plus, ArrowRight, Play, Trash2 } from "lucide-react";
import { type Template, POPULAR_TOKENS } from "./types";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { useTokenList } from "@/hooks/useTokenList";
import { useNestedScrollbar } from "@/hooks/useNestedScrollbar";
import { streaming } from "@/protoTypes/streaming_status";
import { TemplateSidebarItem } from "./TemplateSidebarItem";

export type TemplateStatus = {
  stage?: streaming.BundleStage | null;
  isLoading: boolean;
  error?: string;
};

interface TemplateSidebarProps {
  templates: Template[];
  activeTemplateId: string | null;
  setActiveTemplateId: (id: string) => void;
  handleAddTemplate: () => void;
  handleDeleteTemplate?: (id: string) => void;
  handleExecuteTemplate?: (template: Template) => void;
  templateStatuses?: Record<string, TemplateStatus>;
}

export function TemplateSidebar({
  templates,
  activeTemplateId,
  setActiveTemplateId,
  handleAddTemplate,
  handleDeleteTemplate,
  handleExecuteTemplate,
  templateStatuses,
}: TemplateSidebarProps) {
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(
    null,
  );
  const lastTemplateNameRef = useRef<string>("");

  if (templateToDelete) {
    lastTemplateNameRef.current = templateToDelete.name;
  }

  const { tokens: allTokens } = useTokenList();
  const getTokenSymbol = (mint: string) =>
    allTokens.find((t) => t.mint === mint)?.symbol || "Custom";

  const scrollRef = useNestedScrollbar(true);
  
  
  
  return (
    <div className="relative w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
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
        message={`Are you sure you want to delete "${templateToDelete?.name || lastTemplateNameRef.current}"?`}
      />

      <div ref={scrollRef} className="flex-1 overflow-hidden h-full">
        <div className="p-3 space-y-2">
          {templates.map((template) => (
            <TemplateSidebarItem
              key={template.id}
              template={template}
              status={templateStatuses?.[template.id]}
              isActive={activeTemplateId === template.id}
              onSelect={() => setActiveTemplateId(template.id)}
              onDelete={() => setTemplateToDelete(template)}
              onExecute={() => {
                handleExecuteTemplate?.(template) ??
                  console.log(`Executing ${template.id}`);
              }}
              getTokenSymbol={getTokenSymbol}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
