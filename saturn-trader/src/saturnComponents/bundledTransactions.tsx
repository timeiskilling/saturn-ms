import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Scrollbar from "smooth-scrollbar";
import { Plus, Trash2, Save, Layers, CircleDashed, Rocket, AlertTriangle, X } from "lucide-react";
import { TemplateSidebar } from "./bundledTransactions/TemplateSidebar";
import { TransactionItem } from "./bundledTransactions/TransactionItem";
import {
  type Template,
  type TransactionInstruction,
  type QuoteOptions,
  POPULAR_TOKENS,
  INITIAL_TEMPLATES,
} from "./bundledTransactions/types";
import { useSignTransaction } from "../components/api/singTransaction";
import { executeBundle } from "../api/bundle";
import { usePhantom } from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";
import OverscrollPlugin from "smooth-scrollbar/plugins/overscroll";

Scrollbar.use(OverscrollPlugin);

export function BundledTransactions() {
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const { handleSignOnly } = useSignTransaction();
  const { addresses } = usePhantom();
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(
    INITIAL_TEMPLATES[0]?.id || null,
  );

  const [switchWalletModal, setSwitchWalletModal] = useState<{
    isOpen: boolean;
    pendingWalletPk: string;
    pendingMint: string;
    targetTxId: string;
    targetField: keyof TransactionInstruction;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (container) {
      const scrollbar = Scrollbar.init(container, {
        damping: 0.1,
        renderByPixels: true,
        alwaysShowTracks: true,
        continuousScrolling: true,
        plugins: {
          overscroll: {
            enable: true,
            effect: "bounce",
            damping: 0.15,
            maxOverscroll: 150,
          },
        },
      });

      scrollbar.addListener((status) => {
        const offset = status.offset.y;
        const limit = status.limit.y;
        const progress = limit > 0 ? offset / limit : 0;

        container.style.setProperty("--scroll-progress", `${progress * 100}%`);
        container.style.setProperty(
          "--scroll-progress-num",
          progress.toString(),
        );
      });

      return () => {
        if (scrollbar) scrollbar.destroy();
      };
    }
  }, []);

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

    setTemplates((prev) =>
      prev.map((t) =>
        t.id === activeTemplate.id
          ? { ...t, transactions: [...t.transactions, newTx] }
          : t,
      ),
    );
  };

  const updateActiveTemplate = useCallback((updatedTemplate: Template) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)),
    );
  }, []);

  const handleUpdateTx = useCallback(
    (txId: string, field: keyof TransactionInstruction, value: any) => {
      if (!activeTemplateId) return;

      const activeTemplate = templates.find((t) => t.id === activeTemplateId);
      if (!activeTemplate) return;

      const firstWalletPk = activeTemplate.transactions[0]?.userPk;
      const isWalletField = field === "userPk";

      // If we're updating a wallet address and it conflicts with the established bundle wallet
      if (isWalletField && firstWalletPk && value !== firstWalletPk) {
        setSwitchWalletModal({
          isOpen: true,
          pendingWalletPk: value,
          pendingMint: "", // Handled separately if token triggers it
          targetTxId: txId,
          targetField: field,
        });
        return;
      }

      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id === activeTemplateId) {
            return {
              ...t,
              transactions: t.transactions.map((tx) => {
                if (tx.id === txId) {
                  return { ...tx, [field]: value };
                }
                return tx;
              }),
            };
          }
          return t;
        }),
      );
    },
    [activeTemplateId, templates],
  );

  const handleUpdateBundleWallet = () => {
    if (!activeTemplateId || !switchWalletModal) return;

    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === activeTemplateId) {
          return {
            ...t,
            transactions: t.transactions.map((tx) => ({
              ...tx,
              userPk: switchWalletModal.pendingWalletPk,
            })),
          };
        }
        return t;
      }),
    );

    setSwitchWalletModal(null);
  };

  const handleUpdateOptions = useCallback(
    (txId: string, field: keyof QuoteOptions, value: any) => {
      if (!activeTemplateId) return;
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id === activeTemplateId) {
            return {
              ...t,
              transactions: t.transactions.map((tx) => {
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
              }),
            };
          }
          return t;
        }),
      );
    },
    [activeTemplateId],
  );

  const handleRemoveTx = useCallback(
    (txId: string) => {
      if (!activeTemplateId) return;
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id === activeTemplateId) {
            return {
              ...t,
              transactions: t.transactions.filter((tx) => tx.id !== txId),
            };
          }
          return t;
        }),
      );
    },
    [activeTemplateId],
  );

  const handleSwapTxTokens = useCallback(
    (txId: string, newAmount?: string) => {
      if (!activeTemplateId) return;
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id === activeTemplateId) {
            return {
              ...t,
              transactions: t.transactions.map((tx) => {
                if (tx.id === txId) {
                  return {
                    ...tx,
                    inputMint: tx.outputMint,
                    outputMint: tx.inputMint,
                    amount: newAmount !== undefined ? newAmount : tx.amount,
                  };
                }
                return tx;
              }),
            };
          }
          return t;
        }),
      );
    },
    [activeTemplateId],
  );

  const handleDeleteTemplate = (templateId: string) => {
    const newTemplates = templates.filter((t) => t.id !== templateId);
    setTemplates(newTemplates);
    if (activeTemplateId === templateId) {
      setActiveTemplateId(newTemplates[0]?.id ?? null);
    }
  };

  const handleExecuteTemplate = async (template: Template) => {
    try {
      console.log(`Starting execution for template: ${template.name}`);

      const userPk = addresses.find(
        (addr) => addr.addressType === AddressType.solana,
      )?.address;
      if (!userPk) {
        throw new Error("No Solana wallet connected");
      }

      const request = {
        transactions: template.transactions.map((tx) => ({
          id: tx.id,
          inputMint: tx.inputMint,
          outputMint: tx.outputMint,
          amount: Number(tx.amount) || 0,
          slippageBps: tx.slippageBps,
          userPk: tx.userPk || userPk,
          options: tx.options || {
            dexes: [],
            excludeDexes: [],
            dynamicSlippage: false,
          },
        })),
      };

      const bundleResponse = await executeBundle(request);

      if (bundleResponse) {
        const signedTransactions = await handleSignOnly(bundleResponse);
        console.log("Successfully signed bundle:", signedTransactions);
      }
    } catch (error: any) {
      if (
        error?.message?.includes("User rejected") ||
        error?.message?.includes("User canceled")
      ) {
        alert("Transaction signing was rejected by the user.");
      } else {
        console.error("Execution failed:", error);
      }
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
        handleExecuteTemplate={handleExecuteTemplate}
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
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* TODO */}
              </div>
            </div>

            {/* Transactions Stack */}
            <div
              ref={scrollContainerRef}
              className="flex-1 h-full w-full overflow-hidden p-8 relative"
            >
              <div className="max-w-4xl mx-auto space-y-4 pb-20">
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
                      transactions={activeTemplate.transactions}
                      index={index}
                      isLast={index === activeTemplate.transactions.length - 1}
                      handleUpdateTx={handleUpdateTx}
                      handleUpdateOptions={handleUpdateOptions}
                      handleRemoveTx={handleRemoveTx}
                      handleSwapTxTokens={handleSwapTxTokens}
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

      {switchWalletModal && switchWalletModal.isOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-bold text-zinc-100">Switch Bundle Wallet</h3>
                  </div>
                  <button
                    onClick={() => setSwitchWalletModal(null)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                    To ensure fast and reliable execution, all steps in a single bundle must use the same wallet. Do you want to switch the entire bundle to <span className="font-mono text-zinc-300">{switchWalletModal.pendingWalletPk.slice(0, 4)}...{switchWalletModal.pendingWalletPk.slice(-4)}</span>?
                  </p>

                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => setSwitchWalletModal(null)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateBundleWallet}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-amber-950 transition-colors border border-amber-500/20"
                    >
                      Switch Wallet
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
