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

  const abortControllerRef = useRef<AbortController | null>(null);

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

      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsFetchingBundles(true);

      try {
        const data = await fetchBundles(controller.signal);

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
      } catch (err: any) {
        if (err.name === "AbortError" || controller.signal.aborted) return;
        console.error("Failed to load bundles:", err);
        setTemplates([]);
        setActiveTemplateId(null);
        lastSavedStringRef.current = "[]";
      } finally {
        if (!controller.signal.aborted) setIsFetchingBundles(false);
      }
    };

    loadBundles();

    const handleLogin = () => {
      localStorage.setItem("isLoggedIn", "true");
      setIsAuthenticated(true);
    };

    const handleLogout = () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      localStorage.removeItem("isLoggedIn");
      setIsAuthenticated(false);
      setTemplates([]);
      setActiveTemplateId(null);
      lastSavedStringRef.current = "[]";
      setIsFetchingBundles(false);
      setIsSavingBundles(false);
    };

    window.addEventListener("saturn_wallet_verified", handleLogin);
    window.addEventListener("saturn_wallet_logout", handleLogout);

    return () => {
      window.removeEventListener("saturn_wallet_verified", handleLogin);
      window.removeEventListener("saturn_wallet_logout", handleLogout);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [isAuthenticated, setTemplates, setActiveTemplateId, setIsAuthenticated]);

  const handleSaveBundles = useCallback(
    async (templatesToSave: Template[] = latestTemplatesRef.current) => {
      if (!isAuthenticated) return;
      const currentController = abortControllerRef.current;
      if (currentController?.signal.aborted) return;

      const cleanData = getCleanTemplates(templatesToSave);
      const currentSaveString = JSON.stringify(cleanData);

      setIsSavingBundles(true);

      try {
        await saveBundle(cleanData as any, currentController?.signal);
        if (currentController?.signal.aborted) return;
        lastSavedStringRef.current = currentSaveString;
      } catch (err: any) {
        if (err.name === "AbortError" || currentController?.signal.aborted)
          return;
        console.error("Save bundles failed:", err);
      } finally {
        if (!currentController?.signal.aborted) setIsSavingBundles(false);
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
