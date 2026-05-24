import { useState, useEffect, useRef } from "react";
import { type Template } from "@/saturnComponents/bundledTransactions/types";
import { fetchBundles, saveBundle } from "../api/saveBundle";

interface UseTemplateStorageProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  setActiveTemplateId: (id: string | null) => void;
}

export function useTemplateStorage({
  isAuthenticated,
  setIsAuthenticated,
  templates,
  setTemplates,
  setActiveTemplateId,
}: UseTemplateStorageProps) {
  const [isFetchingBundles, setIsFetchingBundles] = useState(true);
  const [isSavingBundles, setIsSavingBundles] = useState(false);
  const lastSavedTemplatesRef = useRef<Template[]>([]);

  useEffect(() => {
    const loadBundles = async () => {
      if (!isAuthenticated) {
        setTemplates([]);
        setIsFetchingBundles(false);
        return;
      }

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

    const handleLogin = () => {
      localStorage.setItem("isLoggedIn", "true");
      setIsAuthenticated(true);
    };

    const handleLogout = () => {
      localStorage.removeItem("isLoggedIn");
      setIsAuthenticated(false);
      setTemplates([]);
      setActiveTemplateId(null);
    };

    window.addEventListener("saturn_wallet_verified", handleLogin);
    window.addEventListener("saturn_wallet_logout", handleLogout);

    return () => {
      window.removeEventListener("saturn_wallet_verified", handleLogin);
      window.removeEventListener("saturn_wallet_logout", handleLogout);
    };
  }, [isAuthenticated, setTemplates, setActiveTemplateId, setIsAuthenticated]);

  const handleSaveBundles = async (templatesToSave: Template[] = templates) => {
    setIsSavingBundles(true);
    await saveBundle(templatesToSave as any);
    lastSavedTemplatesRef.current = templatesToSave;
    setIsSavingBundles(false);
  };

  const hasUnsavedChanges =
    JSON.stringify(templates) !== JSON.stringify(lastSavedTemplatesRef.current);

  useEffect(() => {
    if (isFetchingBundles || !isAuthenticated) return;

    const hasChanged =
      JSON.stringify(templates) !==
      JSON.stringify(lastSavedTemplatesRef.current);
    if (!hasChanged) return;

    const timerId = setTimeout(() => {
      handleSaveBundles(templates);
    }, 10000);

    return () => clearTimeout(timerId);
  }, [templates, isFetchingBundles, isAuthenticated]);

  return {
    isFetchingBundles,
    isSavingBundles,
    handleSaveBundles,
    hasUnsavedChanges,
  };
}
