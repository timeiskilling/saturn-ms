import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchTransactionHistory,
  recordTransaction,
  type TransactionHistoryRecord,
  type HistoryTransactionRequest,
} from "../api/history";

interface UseHistoryTransactionProps {
  isAuthenticated: boolean;
}

export function useHistoryTransaction({
  isAuthenticated,
}: UseHistoryTransactionProps) {
  const [history, setHistory] = useState<TransactionHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchTransactionHistory(controller.signal);
      setHistory(data);
    } catch (err: any) {
      if (err.name === "AbortError" || controller.signal.aborted) {
        return;
      }
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const handleLogout = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setHistory([]);
      setError(null);
      setLoading(false);
    };

    window.addEventListener("saturn_wallet_logout", handleLogout);
    return () =>
      window.removeEventListener("saturn_wallet_logout", handleLogout);
  }, []);

  const addTransaction = async (payload: HistoryTransactionRequest) => {
    const currentController = abortControllerRef.current;

    if (!isAuthenticated || currentController?.signal.aborted) return null;

    try {
      const newRecord = await recordTransaction(
        payload,
        currentController?.signal,
      );

      if (newRecord && !currentController?.signal.aborted) {
        setHistory((prev) => {
          const updated = [newRecord, ...prev];
          if (updated.length > 7) updated.pop();
          return updated;
        });
      }
      return newRecord;
    } catch (err: any) {
      if (err.name === "AbortError" || currentController?.signal.aborted)
        return null;
      console.error("Failed to add transaction", err);
      return null;
    }
  };

  return {
    history,
    loading,
    error,
    refreshHistory: loadHistory,
    addTransaction,
  };
}
