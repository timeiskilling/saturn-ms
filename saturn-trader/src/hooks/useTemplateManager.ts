// hooks/useTemplateMutations.ts
import {
  POPULAR_TOKENS,
  type QuoteOptions,
  type Template,
  type TransactionInstruction,
} from "@/saturnComponents/bundledTransactions/types";
import { useState, useCallback } from "react";

export function useTemplateManager(initialTemplates: Template[] = []) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(
    new Set(),
  );

  const activeTemplate =
    templates.find((t) => t.id === activeTemplateId) || templates[0] || null;

  const handleAddTemplate = useCallback(() => {
    const newTemplate: Template = {
      id: `t_${Date.now()}`,
      name: `New Bundle ${templates.length + 1}`,
      transactions: [],
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setActiveTemplateId(newTemplate.id);
  }, [templates.length]);

  const handleUpdateTx = useCallback(
    (txId: string, field: keyof TransactionInstruction, value: any) => {
      if (!activeTemplateId) return;
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id !== activeTemplateId) return t;

          // Логіка оновлення userPk для всіх або оновлення одного поля
          const isWalletField = field === "userPk";
          return {
            ...t,
            transactions: t.transactions.map((tx) =>
              isWalletField
                ? { ...tx, userPk: value }
                : tx.id === txId
                  ? { ...tx, [field]: value }
                  : tx,
            ),
          };
        }),
      );
    },
    [activeTemplateId],
  );

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

  return {
    templates,
    setTemplates,
    activeTemplate,
    activeTemplateId,
    setActiveTemplateId,
    selectedTemplateIds,
    setSelectedTemplateIds,
    handleAddTemplate,
    handleUpdateTx,
    handleRemoveTx,
    handleDeleteTemplate,
    handleToggleTemplateSelection,
    handleDeleteSelected,
    handleSwapTxTokens,
    handleAddTransaction,
    handleUpdateOptions,
  };
}
