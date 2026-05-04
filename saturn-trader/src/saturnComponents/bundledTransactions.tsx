import { useEffect, useRef, useState, useCallback } from "react";
import Scrollbar from "smooth-scrollbar";
import { Plus } from "lucide-react";
import { TemplateSidebar } from "./bundledTransactions/TemplateSidebar";
import { TransactionItem } from "./bundledTransactions/TransactionItem";
import { EditorHeader } from "./bundledTransactions/EditorHeader";
import { EmptyTemplateState } from "./bundledTransactions/EmptyTemplateState";
import { EmptyTransactionsState } from "./bundledTransactions/EmptyTransactionsState";
import { LoadingBundlesState } from "./bundledTransactions/LoadingBundlesState";
import {
  type Template,
  type TransactionInstruction,
  type QuoteOptions,
  POPULAR_TOKENS,
  // INITIAL_TEMPLATES,
} from "./bundledTransactions/types";
import { useSignTransaction } from "../components/api/singTransaction";
import { executeBundle, sendBundleStream } from "../api/bundle";
import { usePhantom, useDiscoveredWallets } from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";
import { streaming } from "@/protoTypes/streaming_status";

export type TemplateStatus = {
  stage?: streaming.BundleStage | null;
  isLoading: boolean;
  error?: string;
};
import { useConnectedWallets } from "../hooks/useConnectedWallets";
import { saveBundle, fetchBundles } from "../api/saveBundle";
import { useAllWalletsBalances } from "../hooks/useAllWalletsBalances";

export function BundledTransactions() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const lastSavedTemplatesRef = useRef<Template[]>([]);
  const [isFetchingBundles, setIsFetchingBundles] = useState(true);
  const [isSavingBundles, setIsSavingBundles] = useState(false);
  const [templateStatuses, setTemplateStatuses] = useState<
    Record<string, TemplateStatus>
  >({});
  const { handleSignOnly } = useSignTransaction();
  const { addresses } = usePhantom();
  const { wallets: discoveredWallets } = useDiscoveredWallets();
  const { savedWallets } = useConnectedWallets();
  const { balances } = useAllWalletsBalances();
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(
    new Set(),
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only use smooth-scrollbar for the main transactions stack on desktop
    // On mobile/iPad we prefer native scrolling for better reliability
    if (window.innerWidth < 1024) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.overflowY = "auto";
      }
      return;
    }

    const container = scrollContainerRef.current;

    if (container) {
      const scrollbar = Scrollbar.init(container, {
        damping: 0.1,
        renderByPixels: true,
        alwaysShowTracks: true,
        continuousScrolling: true,
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
  }, [activeTemplateId, isFetchingBundles]);

  useEffect(() => {
    const loadBundles = async () => {
      setIsFetchingBundles(true);
      const data = await fetchBundles();
      if (data && data.length > 0) {
        const loadedTemplates = data as unknown as Template[];
        setTemplates(loadedTemplates);
        lastSavedTemplatesRef.current = loadedTemplates;

        setActiveTemplateId(loadedTemplates[0]?.id ?? null);
      } else {
        setTemplates([]);
        lastSavedTemplatesRef.current = [];
        setActiveTemplateId(null);
      }
      setIsFetchingBundles(false);
    };
    loadBundles();

    const handleAuthEvent = () => {
      loadBundles();
    };

    window.addEventListener("saturn_wallet_verified", handleAuthEvent);
    window.addEventListener("saturn_wallet_logout", handleAuthEvent);

    return () => {
      window.removeEventListener("saturn_wallet_verified", handleAuthEvent);
      window.removeEventListener("saturn_wallet_logout", handleAuthEvent);
    };
  }, []);

  const handleSaveBundles = async (templatesToSave: Template[] = templates) => {
    setIsSavingBundles(true);
    await saveBundle(templatesToSave as any);
    lastSavedTemplatesRef.current = templatesToSave;
    setIsSavingBundles(false);
  };

  useEffect(() => {
    if (isFetchingBundles) return;

    const hasChanged =
      JSON.stringify(templates) !==
      JSON.stringify(lastSavedTemplatesRef.current);
    if (!hasChanged) return;

    const timerId = setTimeout(() => {
      handleSaveBundles(templates);
    }, 10000);

    return () => clearTimeout(timerId);
  }, [templates, isFetchingBundles]);

  const activeTemplate =
    templates.find((t) => t.id === activeTemplateId) || templates[0] || null;

  const globalActiveAddress = addresses.find(
    (addr) => addr.addressType === AddressType.solana,
  )?.address;

  // The bundle's wallet is either the one saved in the first transaction, or the global one
  const bundleWalletAddress =
    activeTemplate?.transactions[0]?.userPk || globalActiveAddress;

  // Find the matching metadata (name, icon) from saved wallets
  const activeBundleWallet = savedWallets.find((w) =>
    w.accounts.some((a) => a.address === bundleWalletAddress),
  );

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

      const isWalletField = field === "userPk";

      // If we're updating a wallet address, we apply it to ALL transactions in the bundle
      // to ensure consistency (making it the 'primary' wallet for this bundle)
      if (isWalletField && value !== undefined) {
        setTemplates((prev) =>
          prev.map((t) => {
            if (t.id === activeTemplateId) {
              return {
                ...t,
                transactions: t.transactions.map((tx) => ({
                  ...tx,
                  userPk: value,
                })),
              };
            }
            return t;
          }),
        );
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

  const handleToggleTemplateSelection = (templateId: string) => {
    setSelectedTemplateIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedTemplateIds.size === 0) return;
    const newTemplates = templates.filter(
      (t) => !selectedTemplateIds.has(t.id),
    );
    setTemplates(newTemplates);
    setSelectedTemplateIds(new Set());
    if (activeTemplateId && selectedTemplateIds.has(activeTemplateId)) {
      setActiveTemplateId(newTemplates[0]?.id ?? null);
    }
  };

  const handleExecuteSelected = async () => {
    const templatesToExecute = templates.filter((t) =>
      selectedTemplateIds.has(t.id),
    );
    if (templatesToExecute.length === 0) return;

    const validTemplates = templatesToExecute.filter(
      (t) => t.transactions.length > 0 && !templateStatuses[t.id]?.isLoading,
    );

    if (validTemplates.length === 0) {
      alert("No valid templates to execute.");
      return;
    }

    setTemplateStatuses((prev) => {
      const updates = { ...prev };
      validTemplates.forEach((t) => {
        updates[t.id] = { isLoading: true, stage: null, error: undefined };
      });
      return updates;
    });

    try {
      const userPk = addresses.find(
        (addr) => addr.addressType === AddressType.solana,
      )?.address;
      if (!userPk) {
        throw new Error("No Solana wallet connected");
      }

      const allTransactions = validTemplates.flatMap((template) =>
        template.transactions.map((tx) => ({
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
      );

      const request = { transactions: allTransactions };
      const bundleResponse = await executeBundle(request);

      if (bundleResponse) {
        const signedTransactions = await handleSignOnly(bundleResponse);
        console.log("Successfully signed combined bundle:", signedTransactions);

        setTemplateStatuses((prev) => {
          const updates = { ...prev };
          validTemplates.forEach((t) => {
            updates[t.id] = {
              isLoading: true,
              stage: streaming.BundleStage.BUNDLE_STAGE_SUBMITTED,
            };
          });
          return updates;
        });

        await sendBundleStream(
          {
            transactions: signedTransactions,
            userPk: userPk,
          },
          (update) => {
            setTemplateStatuses((prev) => {
              const updates = { ...prev };
              validTemplates.forEach((t) => {
                updates[t.id] = {
                  isLoading:
                    update.newStatus !==
                      streaming.BundleStage.BUNDLE_STAGE_FINALIZED &&
                    update.newStatus !==
                      streaming.BundleStage.BUNDLE_STAGE_FAILED,
                  stage: update.newStatus,
                };
              });
              return updates;
            });
          },
          (error) => {
            console.error("Stream error:", error);
            setTemplateStatuses((prev) => {
              const updates = { ...prev };
              validTemplates.forEach((t) => {
                updates[t.id] = {
                  isLoading: false,
                  stage: streaming.BundleStage.BUNDLE_STAGE_FAILED,
                  error: error.message,
                };
              });
              return updates;
            });
          },
          () => {
            console.log("Stream complete for selected");
            setTemplateStatuses((prev) => {
              const updates = { ...prev };
              validTemplates.forEach((t) => {
                const current = updates[t.id];
                if (current?.isLoading) {
                  updates[t.id] = {
                    ...current,
                    isLoading: false,
                  };
                }
              });
              return updates;
            });
            setSelectedTemplateIds(new Set());
          },
        );
      }
    } catch (error: any) {
      setTemplateStatuses((prev) => {
        const updates = { ...prev };
        validTemplates.forEach((t) => {
          updates[t.id] = {
            isLoading: false,
            error: error?.message || "Execution failed",
          };
        });
        return updates;
      });

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

  const handleExecuteTemplate = async (template: Template) => {
    if (template.transactions.length === 0) {
      alert("0 transactions in bundle");
      return;
    }

    if (templateStatuses[template.id]?.isLoading) {
      console.log(`Execution already in progress for template: ${template.id}`);
      return;
    }

    setTemplateStatuses((prev) => ({
      ...prev,
      [template.id]: {
        isLoading: true,
        stage: null,
        error: undefined,
      },
    }));

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

        setTemplateStatuses((prev) => ({
          ...prev,
          [template.id]: {
            isLoading: true,
            stage: streaming.BundleStage.BUNDLE_STAGE_SUBMITTED,
          },
        }));

        await sendBundleStream(
          {
            transactions: signedTransactions,
            userPk: userPk,
          },
          (update) => {
            console.log("Bundle update:", update);
            setTemplateStatuses((prev) => ({
              ...prev,
              [template.id]: {
                isLoading:
                  update.newStatus !==
                    streaming.BundleStage.BUNDLE_STAGE_FINALIZED &&
                  update.newStatus !==
                    streaming.BundleStage.BUNDLE_STAGE_FAILED,
                stage: update.newStatus,
              },
            }));
          },
          (error) => {
            console.error("Stream error:", error);
            setTemplateStatuses((prev) => ({
              ...prev,
              [template.id]: {
                isLoading: false,
                stage: streaming.BundleStage.BUNDLE_STAGE_FAILED,
                error: error.message,
              },
            }));
          },
          () => {
            console.log("Stream complete for", template.id);
            setTemplateStatuses((prev) => {
              const current = prev[template.id];
              if (current?.isLoading) {
                return {
                  ...prev,
                  [template.id]: {
                    ...current,
                    isLoading: false,
                  },
                };
              }
              return prev;
            });
          },
        );
      }
    } catch (error: any) {
      setTemplateStatuses((prev) => ({
        ...prev,
        [template.id]: {
          isLoading: false,
          error: error?.message || "Execution failed",
        },
      }));

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

  if (isFetchingBundles) {
    return <LoadingBundlesState />;
  }

  return (
    <div className="flex flex-col sm:flex-row h-full w-full bg-zinc-950 text-zinc-200 overflow-hidden">
      {/* Sidebar - Templates List */}
      <div className="w-full sm:w-64 md:w-72 lg:w-80 h-[40%] sm:h-full shrink-0 border-b sm:border-b-0 sm:border-r border-zinc-800 bg-zinc-950 overflow-hidden">
        <TemplateSidebar
          templates={templates}
          activeTemplateId={activeTemplateId}
          setActiveTemplateId={setActiveTemplateId}
          handleAddTemplate={handleAddTemplate}
          handleDeleteTemplate={handleDeleteTemplate}
          handleExecuteTemplate={handleExecuteTemplate}
          templateStatuses={templateStatuses}
          balances={balances}
          globalActiveAddress={globalActiveAddress}
          selectedTemplateIds={selectedTemplateIds}
          onToggleSelection={handleToggleTemplateSelection}
          onDeleteSelected={handleDeleteSelected}
          onExecuteSelected={handleExecuteSelected}
        />
      </div>

      {/* Main Content - Template Editor */}
      <div className="flex-1 flex flex-col h-[60%] sm:h-full overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950">
        {!activeTemplate ? (
          <EmptyTemplateState handleAddTemplate={handleAddTemplate} />
        ) : (
          <>
            <EditorHeader
              activeTemplate={activeTemplate}
              updateActiveTemplate={updateActiveTemplate}
              handleSaveBundles={() => handleSaveBundles(templates)}
              isSavingBundles={isSavingBundles}
              bundleWalletAddress={bundleWalletAddress}
              activeBundleWallet={activeBundleWallet}
              discoveredWallets={discoveredWallets}
            />

            {/* Transactions Stack */}
            <div
              ref={scrollContainerRef}
              className="flex-1 h-full w-full overflow-hidden p-4 md:p-8 relative"
            >
              <div className="max-w-4xl mx-auto space-y-4 pb-20">
                {activeTemplate.transactions.length === 0 ? (
                  <EmptyTransactionsState
                    handleAddTransaction={handleAddTransaction}
                  />
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
    </div>
  );
}
