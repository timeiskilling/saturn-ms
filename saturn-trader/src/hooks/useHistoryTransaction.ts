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

  const isLoggedOut = useRef(false);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }

    setLoading(true);
    setError(null);
    isLoggedOut.current = false;

    try {
      const data = await fetchTransactionHistory();
      if (isLoggedOut.current) return;
      setHistory(data);
    } catch (err) {
      if (isLoggedOut.current) return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (!isLoggedOut.current) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const handleLogout = () => {
      isLoggedOut.current = true;
      setHistory([]);
      setError(null);
      setLoading(false);
    };

    window.addEventListener("saturn_wallet_logout", handleLogout);
    return () =>
      window.removeEventListener("saturn_wallet_logout", handleLogout);
  }, []);

  const addTransaction = async (payload: HistoryTransactionRequest) => {
    if (!isAuthenticated || isLoggedOut.current) return null;

    const newRecord = await recordTransaction(payload);
    if (newRecord && !isLoggedOut.current) {
      setHistory((prev) => {
        const updated = [newRecord, ...prev];
        if (updated.length > 7) updated.pop();
        return updated;
      });
    }
    return newRecord;
  };

  return {
    history,
    loading,
    error,
    refreshHistory: loadHistory,
    addTransaction,
  };
}
