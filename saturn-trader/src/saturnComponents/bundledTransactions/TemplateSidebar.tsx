import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  Plus,
  Play,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
  X,
} from "lucide-react";
import { type Template } from "./types";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { useTokenList } from "@/hooks/useTokenList";
import { streaming } from "@/protoTypes/streaming_status";
import { TemplateSidebarItem } from "./TemplateSidebarItem";
import { validateTemplateExecution } from "./validation";

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
  balances?: Record<string, any>;
  globalActiveAddress?: string;
  selectedTemplateIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onDeleteSelected?: () => void;
  onExecuteSelected?: () => void;
}

type SelectionState = "none" | "some" | "all";

export function TemplateSidebar({
  templates,
  activeTemplateId,
  setActiveTemplateId,
  handleAddTemplate,
  handleDeleteTemplate,
  handleExecuteTemplate,
  templateStatuses,
  balances,
  globalActiveAddress,
  selectedTemplateIds = new Set(),
  onToggleSelection,
  onDeleteSelected,
  onExecuteSelected,
}: TemplateSidebarProps) {
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(
    null,
  );
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] =
    useState(false);
  const lastTemplateNameRef = useRef<string>("");

  if (templateToDelete) {
    lastTemplateNameRef.current = templateToDelete.name;
  }

  const { tokens: allTokens } = useTokenList();
  const getTokenSymbol = (mint: string) =>
    allTokens.find((t) => t.mint === mint)?.symbol || "Custom";

  // Derived selection state
  const selectionState: SelectionState =
    selectedTemplateIds.size === 0
      ? "none"
      : selectedTemplateIds.size === templates.length
        ? "all"
        : "some";

  const handleSelectAll = () => {
    if (selectionState === "all") {
      // Deselect all — call onToggleSelection for each selected one
      selectedTemplateIds.forEach((id) => onToggleSelection?.(id));
    } else {
      // Select all that aren't already selected
      templates.forEach((t) => {
        if (!selectedTemplateIds.has(t.id)) onToggleSelection?.(t.id);
      });
    }
  };

  const handleDeselectAll = () => {
    selectedTemplateIds.forEach((id) => onToggleSelection?.(id));
  };

  const SelectAllIcon =
    selectionState === "all"
      ? CheckSquare
      : selectionState === "some"
        ? MinusSquare
        : Square;

  const isRunAllDisabled = Array.from(selectedTemplateIds).some((id) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return true;

    const isExecuting = templateStatuses?.[template.id]?.isLoading;

    const { isExecuteDisabled } = validateTemplateExecution(
      template,
      balances,
      globalActiveAddress,
      isExecuting,
    );

    return isExecuteDisabled;
  });

  return (
    <div className="relative w-full flex flex-col h-full bg-zinc-950">
      {/* ── Header ── */}
      <div className="p-3 md:p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 md:gap-2">
          <Layers className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          <h2 className="font-bold text-zinc-100 text-[10px] min-[375px]:text-xs md:text-sm tracking-wide truncate">
            Bundle Templates
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Select-All / Indeterminate toggle */}
          <button
            onClick={handleSelectAll}
            title={selectionState === "all" ? "Deselect all" : "Select all"}
            className={`
              p-1.5 rounded-md transition-all duration-150
              ${
                selectionState !== "none"
                  ? "bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              }
            `}
          >
            <SelectAllIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>

          {/* New template */}
          <button
            onClick={handleAddTemplate}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
            title="Create New Template"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      {/* ── Delete-confirm modal ── */}
      <DeleteConfirmationModal
        isOpen={!!templateToDelete || isDeleteSelectedModalOpen}
        onClose={() => {
          setTemplateToDelete(null);
          setIsDeleteSelectedModalOpen(false);
        }}
        onConfirm={() => {
          if (templateToDelete && handleDeleteTemplate) {
            handleDeleteTemplate(templateToDelete.id);
          } else if (isDeleteSelectedModalOpen && onDeleteSelected) {
            onDeleteSelected();
          }
        }}
        title={
          isDeleteSelectedModalOpen
            ? "Delete Selected Templates"
            : "Delete Template"
        }
        message={
          isDeleteSelectedModalOpen ? (
            <>
              Are you sure you want to delete{" "}
              <span className="font-bold text-zinc-100">
                {selectedTemplateIds.size}
              </span>{" "}
              selected{" "}
              {selectedTemplateIds.size === 1 ? "template" : "templates"}?
            </>
          ) : (
            <>
              Are you sure you want to delete{" "}
              <span className="font-bold text-zinc-100">
                {templateToDelete?.name || lastTemplateNameRef.current}
              </span>
              ?
            </>
          )
        }
      />

      {/* ── Template list ── */}
      <div className="flex-1 overflow-y-auto h-full scrollbar-hide overscroll-contain">
        <div className="p-3 space-y-1.5 pb-28">
          {templates.map((template) => {
            const isSelected = selectedTemplateIds.has(template.id);
            return (
              <div
                key={template.id}
                className={`
                  flex items-center gap-2 rounded-lg transition-all duration-150
                  ${isSelected ? "ring-1 ring-blue-500/30 bg-blue-500/5" : ""}
                `}
              >
                {/* Checkbox */}
                <button
                  onClick={() => onToggleSelection?.(template.id)}
                  className={`
                    shrink-0 ml-1.5 w-4 h-4 rounded transition-all duration-150
                    flex items-center justify-center
                    ${
                      isSelected
                        ? "text-blue-400"
                        : "text-zinc-600 hover:text-zinc-400"
                    }
                  `}
                  title={isSelected ? "Deselect" : "Select"}
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <TemplateSidebarItem
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
                    balances={balances}
                    globalActiveAddress={globalActiveAddress}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Floating selection action bar ── */}
      {selectedTemplateIds.size > 0 && (
        <div
          className="
            absolute bottom-0 left-0 right-0
            flex items-center justify-between
            px-2.5 py-3 md:px-3
            bg-zinc-900 border-t border-zinc-800
            shadow-[0_-8px_32px_rgba(0,0,0,0.5)]
            z-50
            animate-in slide-in-from-bottom-2 duration-200
          "
        >
          {/* Count + deselect */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-[10px] md:text-xs font-semibold text-blue-400 tabular-nums">
              {selectedTemplateIds.size}
              <span className="text-zinc-500 font-normal ml-1 hidden min-[360px]:inline">
                selected
              </span>
            </span>
            <button
              onClick={handleDeselectAll}
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
              title="Deselect all"
            >
              <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setIsDeleteSelectedModalOpen(true)}
              className="
                flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1.5
                text-[10px] md:text-xs font-medium text-red-400
                bg-red-500/10 hover:bg-red-500/20
                rounded-md border border-red-500/20 hover:border-red-500/40
                transition-all duration-150
              "
              title="Delete selected"
            >
              <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="hidden min-[360px]:inline">Delete</span>
            </button>
            <button
              onClick={onExecuteSelected}
              disabled={isRunAllDisabled}
              className={`
                flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1.5
                text-[10px] md:text-xs font-medium rounded-md border
                transition-all duration-150
                ${
                  isRunAllDisabled
                    ? "text-zinc-500 bg-zinc-800/50 border-transparent cursor-not-allowed"
                    : "text-blue-300 bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/25 hover:border-blue-500/50"
                }
              `}
              title={
                isRunAllDisabled
                  ? "Some selected templates have issues"
                  : "Execute selected"
              }
            >
              <Play className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
              <span className="hidden min-[360px]:inline">Run all</span>
              <span className="min-[360px]:hidden">Run</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
