import { useState } from "react";
import { streaming } from "@/protoTypes/streaming_status";
import { executeBundle, sendBundleStream } from "../api/bundle";
import { AddressType } from "@phantom/react-sdk";
import type { Template } from "@/saturnComponents/bundledTransactions/types";
import type { TemplateStatus } from "@/saturnComponents/bundledTransactions/TemplateSidebar";

export function useBundleExecution(
  addresses: any[],
  handleSignOnly: any,
  clearSelection: () => void,
) {
  const [templateStatuses, setTemplateStatuses] = useState<
    Record<string, TemplateStatus>
  >({});

  const processBundles = async (templatesToProcess: Template[]) => {
    setTemplateStatuses((prev) => {
      const updates = { ...prev };
      templatesToProcess.forEach((t) => {
        updates[t.id] = { isLoading: true, stage: null, error: undefined };
      });
      return updates;
    });

    try {
      const userPk = addresses.find(
        (addr) => addr.addressType === AddressType.solana,
      )?.address;

      if (!userPk) throw new Error("No Solana wallet connected");
      const allTransactions = templatesToProcess.flatMap((template) =>
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
        console.log("Successfully signed bundle:", signedTransactions);

        setTemplateStatuses((prev) => {
          const updates = { ...prev };
          templatesToProcess.forEach((t) => {
            updates[t.id] = {
              isLoading: true,
              stage: streaming.BundleStage.BUNDLE_STAGE_SUBMITTED,
            };
          });
          return updates;
        });

        await sendBundleStream(
          { transactions: signedTransactions, userPk },
          (update) => {
            setTemplateStatuses((prev) => {
              const updates = { ...prev };
              templatesToProcess.forEach((t) => {
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
              templatesToProcess.forEach((t) => {
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
            console.log("Stream complete");
            setTemplateStatuses((prev) => {
              const updates = { ...prev };
              templatesToProcess.forEach((t) => {
                const current = updates[t.id];
                if (current?.isLoading) {
                  updates[t.id] = { ...current, isLoading: false };
                }
              });
              return updates;
            });
            clearSelection();
          },
        );
      }
    } catch (error: any) {
      setTemplateStatuses((prev) => {
        const updates = { ...prev };
        templatesToProcess.forEach((t) => {
          updates[t.id] = {
            isLoading: false,
            error: error?.message || "Execution failed",
          };
        });
        return updates;
      });

      if (
        !error?.message?.includes("User rejected") &&
        !error?.message?.includes("User canceled")
      ) {
        console.error("Execution failed:", error);
      }
    }
  };

  const handleExecuteSelected = async (
    templates: Template[],
    selectedIds: Set<string>,
  ) => {
    const validTemplates = templates.filter(
      (t) =>
        selectedIds.has(t.id) &&
        t.transactions.length > 0 &&
        !templateStatuses[t.id]?.isLoading,
    );
    if (validTemplates.length > 0) await processBundles(validTemplates);
  };

  const handleExecuteTemplate = async (template: Template) => {
    if (
      template.transactions.length > 0 &&
      !templateStatuses[template.id]?.isLoading
    ) {
      await processBundles([template]);
    }
  };

  return {
    templateStatuses,
    setTemplateStatuses,
    handleExecuteSelected,
    handleExecuteTemplate,
  };
}
