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
  const latestTemplatesRef = useRef<Template[]>([]);

  const templatesStringified = JSON.stringify(templates);

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

  const handleSaveBundles = useCallback(
    async (templatesToSave: Template[] = latestTemplatesRef.current) => {
      if (!isAuthenticated) return;

      setIsSavingBundles(true);

      try {
        await saveBundle(templatesToSave as any);
        lastSavedTemplatesRef.current = JSON.parse(
          JSON.stringify(templatesToSave),
        );
      } catch (err) {
        console.error("Save bundles failed:", err);
      } finally {
        setIsSavingBundles(false);
      }
    },
    [isAuthenticated],
  );

  const hasUnsavedChanges =
    isAuthenticated &&
    templatesStringified !== JSON.stringify(lastSavedTemplatesRef.current);

  useEffect(() => {
    if (!isAuthenticated || isFetchingBundles) return;

    if (!hasUnsavedChanges) return;

    const timerId = setTimeout(() => {
      handleSaveBundles();
    }, 2500);

    return () => clearTimeout(timerId);
  }, [
    templatesStringified,
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
