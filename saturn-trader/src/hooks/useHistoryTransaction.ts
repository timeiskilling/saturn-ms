import { useState, useEffect, useCallback } from "react";
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

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactionHistory();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addTransaction = async (payload: HistoryTransactionRequest) => {
    if (!isAuthenticated) return null;

    const newRecord = await recordTransaction(payload);
    if (newRecord) {
      setHistory((prev) => {
        // Optimistically add to front, removing oldest if > 7 based on backend limits
        const updated = [newRecord, ...prev];
        if (updated.length > 7) {
          updated.pop();
        }
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
