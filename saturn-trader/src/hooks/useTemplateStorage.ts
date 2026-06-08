import { useState, useEffect, useRef, useCallback } from "react";
import { type Template } from "@/saturnComponents/bundledTransactions/types";
import { fetchBundles, saveBundle } from "../api/saveBundle";

interface UseTemplateStorageProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  setActiveTemplateId: (id: string | null) => void;
}

const getCleanTemplates = (templates: Template[]): Template[] => {
  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    transactions: t.transactions.map((tx) => ({
      id: tx.id,
      inputMint: tx.inputMint,
      outputMint: tx.outputMint,
      amount: tx.amount,
      slippageBps: tx.slippageBps,
      options: tx.options,
      userPk: tx.userPk,
      optionalDestination: tx.optionalDestination,
    })),
  }));
};

export function useTemplateStorage({
  isAuthenticated,
  setIsAuthenticated,
  templates,
  setTemplates,
  setActiveTemplateId,
}: UseTemplateStorageProps) {
  const [isFetchingBundles, setIsFetchingBundles] = useState(true);
  const [isSavingBundles, setIsSavingBundles] = useState(false);
  const lastSavedStringRef = useRef<string>("[]");
  const latestTemplatesRef = useRef<Template[]>([]);

  const cleanTemplatesStringified = JSON.stringify(
    getCleanTemplates(templates),
  );

  useEffect(() => {
    latestTemplatesRef.current = templates;
  }, [templates]);

  useEffect(() => {
    const loadBundles = async () => {
      if (!isAuthenticated) {
        setTemplates([]);
        setActiveTemplateId(null);
        lastSavedStringRef.current = "[]";
        setIsFetchingBundles(false);
        return;
      }

      setIsFetchingBundles(true);

      try {
        const data = await fetchBundles();

        if (data && data.length > 0) {
          const loadedTemplates = data as unknown as Template[];
          setTemplates(loadedTemplates);
          setActiveTemplateId(loadedTemplates[0]?.id ?? null);

          lastSavedStringRef.current = JSON.stringify(
            getCleanTemplates(loadedTemplates),
          );
        } else {
          setTemplates([]);
          setActiveTemplateId(null);
          lastSavedStringRef.current = "[]";
        }
      } catch (err) {
        console.error("Failed to load bundles:", err);
        setTemplates([]);
        setActiveTemplateId(null);
        lastSavedStringRef.current = "[]";
      } finally {
        setIsFetchingBundles(false);
      }
    };

    loadBundles();

    const handleLogin = () => {
      localStorage.setItem("isLoggedIn", "true");
      setIsAuthenticated(true);
    };

    const handleLogout = () => {
      localStorage.removeItem("isLoggedIn");
      setIsAuthenticated(false);
      setTemplates([]);
      setActiveTemplateId(null);
      lastSavedStringRef.current = "[]";
    };

    window.addEventListener("saturn_wallet_verified", handleLogin);
    window.addEventListener("saturn_wallet_logout", handleLogout);

    return () => {
      window.removeEventListener("saturn_wallet_verified", handleLogin);
      window.removeEventListener("saturn_wallet_logout", handleLogout);
    };
  }, [isAuthenticated, setTemplates, setActiveTemplateId, setIsAuthenticated]);

  const handleSaveBundles = useCallback(
    async (templatesToSave: Template[] = latestTemplatesRef.current) => {
      if (!isAuthenticated) return;
      const cleanData = getCleanTemplates(templatesToSave);
      const currentSaveString = JSON.stringify(cleanData);

      setIsSavingBundles(true);

      try {
        await saveBundle(cleanData as any);
        lastSavedStringRef.current = currentSaveString;
      } catch (err) {
        console.error("Save bundles failed:", err);
      } finally {
        setIsSavingBundles(false);
      }
    },
    [isAuthenticated],
  );
  const hasUnsavedChanges =
    isAuthenticated && cleanTemplatesStringified !== lastSavedStringRef.current;

  useEffect(() => {
    if (!isAuthenticated || isFetchingBundles || !hasUnsavedChanges) return;

    const timerId = setTimeout(() => {
      handleSaveBundles();
    }, 2500);

    return () => clearTimeout(timerId);
  }, [
    cleanTemplatesStringified,
    isAuthenticated,
    isFetchingBundles,
    hasUnsavedChanges,
    handleSaveBundles,
  ]);

  return {
    isFetchingBundles,
    isSavingBundles,
    handleSaveBundles,
    hasUnsavedChanges,
  };
}
