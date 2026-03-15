import { useState } from "react";
import { Plus, Trash2, Save, Layers, CircleDashed, Rocket } from "lucide-react";
import { TemplateSidebar } from "./bundledTransactions/TemplateSidebar";
import { TransactionItem } from "./bundledTransactions/TransactionItem";
import {
  type Template,
  type TransactionInstruction,
  type QuoteOptions,
  POPULAR_TOKENS,
  INITIAL_TEMPLATES,
} from "./bundledTransactions/types";

export function BundledTransactions() {
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(
    INITIAL_TEMPLATES[0]?.id || null,
  );

  const activeTemplate =
    templates.find((t) => t.id === activeTemplateId) || templates[0] || null;

  const handleAddTemplate = () => {
    const newTemplate: Template = {
      id: `t_${Date.now()}`,
      name: `New Bundle ${templates.length + 1}`,
      transactions: [],
    };
    setTemplates([...templates, newTemplate]);
    setActiveTemplateId(newTemplate.id);
  };

  const handleAddTransaction = () => {
    if (!activeTemplate || activeTemplate.transactions.length >= 4) return;

    const newTx: TransactionInstruction = {
      id: `tx_${Date.now()}`,
      inputMint: POPULAR_TOKENS[0]!.mint,
      outputMint: POPULAR_TOKENS[1]!.mint,
      amount: "0",
      slippageBps: 50,
      options: {
        dexes: [],
        excludeDexes: [],
        dynamicSlippage: false,
      },
    };

    updateActiveTemplate({
      ...activeTemplate,
      transactions: [...activeTemplate.transactions, newTx],
    });
  };

  const updateActiveTemplate = (updatedTemplate: Template) => {
    setTemplates(
      templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)),
    );
  };

  const handleUpdateTx = (
    txId: string,
    field: keyof TransactionInstruction,
    value: any,
  ) => {
    if (!activeTemplate) return;
    const updatedTxs = activeTemplate.transactions.map((tx) => {
      if (tx.id === txId) {
        return { ...tx, [field]: value };
      }
      return tx;
    });
    updateActiveTemplate({ ...activeTemplate, transactions: updatedTxs });
  };

  const handleUpdateOptions = (
    txId: string,
    field: keyof QuoteOptions,
    value: any,
  ) => {
    if (!activeTemplate) return;
    const updatedTxs = activeTemplate.transactions.map((tx) => {
      if (tx.id === txId) {
        return {
          ...tx,
          options: {
            ...(tx.options || { dexes: [], excludeDexes: [] }),
            [field]: value,
          },
        };
      }
      return tx;
    });
    updateActiveTemplate({ ...activeTemplate, transactions: updatedTxs });
  };

  const handleRemoveTx = (txId: string) => {
    if (!activeTemplate) return;
    updateActiveTemplate({
      ...activeTemplate,
      transactions: activeTemplate.transactions.filter((tx) => tx.id !== txId),
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    const newTemplates = templates.filter((t) => t.id !== templateId);
    setTemplates(newTemplates);
    if (activeTemplateId === templateId) {
      setActiveTemplateId(newTemplates[0]?.id ?? null);
    }
  };

  return (
    <div className="select-none flex h-full w-full bg-zinc-950 text-zinc-200">
      {/* Left Sidebar - Templates List */}
      <TemplateSidebar
        templates={templates}
        activeTemplateId={activeTemplateId}
        setActiveTemplateId={setActiveTemplateId}
        handleAddTemplate={handleAddTemplate}
        handleDeleteTemplate={handleDeleteTemplate}
      />

      {/* Main Content - Template Editor */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950">
        {!activeTemplate ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Layers className="w-16 h-16 text-zinc-800 mb-4" />
            <h2 className="text-xl font-bold text-zinc-300">No Templates</h2>
            <p className="text-zinc-500 mt-2 mb-6 text-center max-w-md">
              You don't have any bundle templates yet. Create a new template to
              start building transaction sequences.
            </p>
            <button
              onClick={handleAddTemplate}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all"
            >
              <Plus className="w-5 h-5" />
              Create First Template
            </button>
          </div>
        ) : (
          <>
            {/* Editor Header */}
            <div className="px-8 py-5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-950/50 backdrop-blur-sm shrink-0">
              <div className="flex flex-col min-w-60">
                <input
                  value={activeTemplate.name}
                  onChange={(e) =>
                    updateActiveTemplate({
                      ...activeTemplate,
                      name: e.target.value,
                    })
                  }
                  className="text-2xl font-bold bg-transparent border-none outline-none text-white focus:ring-0 p-0 hover:bg-zinc-900/50 rounded transition-colors"
                  placeholder="Template Name..."
                />
                <p className="text-sm text-zinc-500 mt-1">
                  Configure up to 4 sequential transactions to execute
                  atomically.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* TODO */}
              </div>
            </div>

            {/* Transactions Stack */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto space-y-4">
                {activeTemplate.transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <CircleDashed className="w-12 h-12 text-zinc-700 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-300">
                      No Transactions Yet
                    </h3>
                    <p className="text-zinc-500 mt-2 text-center max-w-sm mb-6">
                      Start building your bundle strategy. You can add up to 4
                      atomic transactions.
                    </p>
                    <button
                      onClick={handleAddTransaction}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg font-semibold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Transaction
                    </button>
                  </div>
                ) : (
                  activeTemplate.transactions.map((tx, index) => (
                    <TransactionItem
                      key={tx.id}
                      tx={tx}
                      index={index}
                      isLast={index === activeTemplate.transactions.length - 1}
                      handleUpdateTx={handleUpdateTx}
                      handleUpdateOptions={handleUpdateOptions}
                      handleRemoveTx={handleRemoveTx}
                    />
                  ))
                )}

                {/* Add Transaction Button */}
                {activeTemplate.transactions.length > 0 &&
                  4 > activeTemplate.transactions.length && (
                    <div className="ml-12 mt-4">
                      <button
                        onClick={handleAddTransaction}
                        className="flex items-center gap-2 px-4 py-3 w-full bg-zinc-900/50 hover:bg-zinc-900 border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">
                          Add Transaction Step (
                          {activeTemplate.transactions.length}
                          /4)
                        </span>
                      </button>
                    </div>
                  )}

                {activeTemplate.transactions.length >= 4 && (
                  <div className="ml-12 mt-4 text-center">
                    <p className="text-xs text-zinc-500">
                      Maximum of 4 transactions per bundle reached.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
