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

  // last persisted server state
  const lastSavedTemplatesRef = useRef<Template[]>([]);

  // always keep latest templates for autosave
  const latestTemplatesRef = useRef<Template[]>([]);
  useEffect(() => {
    latestTemplatesRef.current = templates;
  }, [templates]);

  useEffect(() => {
    const loadBundles = async () => {
      if (!isAuthenticated) {
        setTemplates([]);
        setActiveTemplateId(null);
        lastSavedTemplatesRef.current = [];
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

          lastSavedTemplatesRef.current = loadedTemplates;
        } else {
          setTemplates([]);
          setActiveTemplateId(null);
          lastSavedTemplatesRef.current = [];
        }
      } catch (err) {
        console.error("Failed to load bundles:", err);
        setTemplates([]);
        setActiveTemplateId(null);
        lastSavedTemplatesRef.current = [];
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
      lastSavedTemplatesRef.current = [];
    };

    window.addEventListener("saturn_wallet_verified", handleLogin);
    window.addEventListener("saturn_wallet_logout", handleLogout);

    return () => {
      window.removeEventListener("saturn_wallet_verified", handleLogin);
      window.removeEventListener("saturn_wallet_logout", handleLogout);
    };
  }, [isAuthenticated, setTemplates, setActiveTemplateId, setIsAuthenticated]);

  const handleSaveBundles = async (
    templatesToSave: Template[] = latestTemplatesRef.current,
  ) => {
    if (!isAuthenticated) return;

    setIsSavingBundles(true);

    try {
      await saveBundle(templatesToSave as any);
      lastSavedTemplatesRef.current = templatesToSave;
    } catch (err) {
      console.error("Save bundles failed:", err);
    } finally {
      setIsSavingBundles(false);
    }
  };

  const hasUnsavedChanges =
    isAuthenticated &&
    JSON.stringify(templates) !== JSON.stringify(lastSavedTemplatesRef.current);

  // autosave with debounce
  useEffect(() => {
    if (!isAuthenticated || isFetchingBundles) return;

    const timerId = setTimeout(() => {
      handleSaveBundles();
    }, 10000);

    return () => clearTimeout(timerId);
  }, [templates, isAuthenticated, isFetchingBundles]);

  return {
    isFetchingBundles,
    isSavingBundles,
    handleSaveBundles,
    hasUnsavedChanges,
  };
}
