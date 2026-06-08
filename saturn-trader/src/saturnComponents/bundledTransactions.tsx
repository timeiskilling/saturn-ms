import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { AddressType } from "@phantom/browser-sdk";
import { usePhantom, useDiscoveredWallets } from "@phantom/react-sdk";
import { TemplateSidebar } from "./bundledTransactions/TemplateSidebar";
import { TransactionItem } from "./bundledTransactions/TransactionItem";
import { EditorHeader } from "./bundledTransactions/EditorHeader";
import { EmptyTemplateState } from "./bundledTransactions/EmptyTemplateState";
import { EmptyTransactionsState } from "./bundledTransactions/EmptyTransactionsState";
import { LoadingBundlesState } from "./bundledTransactions/LoadingBundlesState";
import { useSignTransaction } from "../components/api/singTransaction";
import { useConnectedWallets } from "../hooks/useConnectedWallets";
import { useAllWalletsBalances } from "../hooks/useAllWalletsBalances";
import { useTemplateManager } from "@/hooks/useTemplateManager";
import { useTemplateStorage } from "@/hooks/useTemplateStorage";
import { useBundleExecution } from "@/hooks/useBundleExecution";
import { useBundleSubscription } from "@/hooks/useBundleSubscription";
import { useSmoothScrollbar } from "@/hooks/useSmoothScrollbar";
import { useHistoryTransaction } from "@/hooks/useHistoryTransaction";

export function BundledTransactions() {
  const { handleSignOnly } = useSignTransaction();
  const { addresses } = usePhantom();
  const { wallets: discoveredWallets } = useDiscoveredWallets();
  const { savedWallets } = useConnectedWallets();
  const { balances } = useAllWalletsBalances();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("isLoggedIn"),
  );

  const globalActiveAddress = addresses.find(
    (addr) => addr.addressType === AddressType.solana,
  )?.address;

  const templateManager = useTemplateManager();
  const {
    templates,
    setTemplates,
    activeTemplate,
    activeTemplateId,
    setActiveTemplateId,
    selectedTemplateIds,
    setSelectedTemplateIds,
  } = templateManager;

  const {
    isFetchingBundles,
    isSavingBundles,
    handleSaveBundles,
    hasUnsavedChanges,
  } = useTemplateStorage({
    isAuthenticated,
    setIsAuthenticated,
    templates,
    setTemplates,
    setActiveTemplateId,
  });

  const isSaveDisabled =
    !isAuthenticated || templates.length === 0 || !hasUnsavedChanges;

  const { addTransaction } = useHistoryTransaction({
    isAuthenticated: isAuthenticated && !!globalActiveAddress,
  });

  const {
    templateStatuses,
    setTemplateStatuses,
    handleExecuteSelected,
    handleExecuteTemplate,
  } = useBundleExecution(
    addresses,
    handleSignOnly,
    () => setSelectedTemplateIds(new Set()),
    (templateId) => {
      // Find the template that succeeded
      const template = templates.find((t) => t.id === templateId);
      if (template && globalActiveAddress) {
        // Record each transaction in the bundle
        template.transactions.forEach((tx) => {
          if (tx.calculatedOutput && tx.amount) {
            addTransaction({
              signer: tx.userPk || globalActiveAddress,
              tx_signature: `bundle_${Date.now()}_${tx.id}`, // Placeholder or extract real sig if available
              receiver:
                tx.optionalDestination || tx.userPk || globalActiveAddress,
              input_mint: tx.inputMint,
              output_mint: tx.outputMint,
              amount: tx.amount.toString(),
            }).catch((err) => console.error("Failed to record history", err));
          }
        });
      }
    },
  );

  const handleBundleUpdate = useCallback(
    (update: any) => {
      setTemplateStatuses((prev) => {
        const bundleId = update.bundleId;
        const currentStatus = prev[bundleId];
        if (currentStatus?.stage === 3) {
          return prev;
        }
        return {
          ...prev,
          [bundleId]: {
            isLoading:
              update.newStatus !== 3 && // BUNDLE_STAGE_FINALIZED
              update.newStatus !== 4, // BUNDLE_STAGE_FAILED
            stage: update.newStatus,
            error: update.error || currentStatus?.error,
          },
        };
      });
    },
    [setTemplateStatuses],
  );

  useBundleSubscription({
    userPk: globalActiveAddress,
    isAuthenticated,
    onUpdate: handleBundleUpdate,
  });

  const scrollContainerRef = useSmoothScrollbar([
    activeTemplateId,
    isFetchingBundles,
  ]);

  const bundleWalletAddress =
    activeTemplate?.transactions[0]?.userPk || globalActiveAddress;
  const activeBundleWallet = savedWallets.find((w) =>
    w.accounts.some((a) => a.address === bundleWalletAddress),
  );

  if (isFetchingBundles) {
    return <LoadingBundlesState />;
  }

  return (
    <div className="flex flex-col sm:flex-row h-full w-full bg-zinc-950 text-zinc-200 overflow-hidden">
      <div className="w-full sm:w-64 md:w-72 lg:w-80 h-[40%] sm:h-full shrink-0 border-b sm:border-b-0 sm:border-r border-zinc-800 bg-zinc-950 overflow-hidden">
        <TemplateSidebar
          templates={templates}
          activeTemplateId={activeTemplateId}
          setActiveTemplateId={setActiveTemplateId}
          handleAddTemplate={templateManager.handleAddTemplate}
          handleDeleteTemplate={templateManager.handleDeleteTemplate}
          handleExecuteTemplate={handleExecuteTemplate}
          templateStatuses={templateStatuses}
          balances={balances}
          globalActiveAddress={globalActiveAddress}
          selectedTemplateIds={selectedTemplateIds}
          onToggleSelection={templateManager.handleToggleTemplateSelection}
          onDeleteSelected={templateManager.handleDeleteSelected}
          onExecuteSelected={() =>
            handleExecuteSelected(templates, selectedTemplateIds)
          }
        />
      </div>

      <div className="flex-1 flex flex-col h-[60%] sm:h-full overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950">
        {!activeTemplate ? (
          <EmptyTemplateState
            handleAddTemplate={templateManager.handleAddTemplate}
          />
        ) : (
          <>
            <EditorHeader
              activeTemplate={activeTemplate}
              updateActiveTemplate={(updatedTemplate) =>
                setTemplates(
                  templates.map((t) =>
                    t.id === updatedTemplate.id ? updatedTemplate : t,
                  ),
                )
              }
              handleSaveBundles={() => handleSaveBundles(templates)}
              isSavingBundles={isSavingBundles}
              isSaveDisabled={isSaveDisabled}
              bundleWalletAddress={bundleWalletAddress}
              activeBundleWallet={activeBundleWallet}
              discoveredWallets={discoveredWallets}
            />

            <div
              ref={scrollContainerRef}
              className="flex-1 h-full w-full overflow-hidden p-4 md:p-8 relative"
            >
              <div className="max-w-4xl mx-auto space-y-4 pb-20">
                {activeTemplate.transactions.length === 0 ? (
                  <EmptyTransactionsState
                    handleAddTransaction={templateManager.handleAddTransaction}
                  />
                ) : (
                  activeTemplate.transactions.map((tx, index) => (
                    <TransactionItem
                      key={tx.id}
                      tx={tx}
                      transactions={activeTemplate.transactions}
                      index={index}
                      isLast={index === activeTemplate.transactions.length - 1}
                      handleUpdateTx={templateManager.handleUpdateTx}
                      handleUpdateOptions={templateManager.handleUpdateOptions}
                      handleRemoveTx={templateManager.handleRemoveTx}
                      handleSwapTxTokens={templateManager.handleSwapTxTokens}
                    />
                  ))
                )}

                {activeTemplate.transactions.length > 0 &&
                  4 > activeTemplate.transactions.length && (
                    <div className="ml-12 mt-4">
                      <button
                        onClick={templateManager.handleAddTransaction}
                        className="flex items-center gap-2 px-4 py-3 w-full bg-zinc-900/50 hover:bg-zinc-900 border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">
                          Add Transaction Step (
                          {activeTemplate.transactions.length}/4)
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
