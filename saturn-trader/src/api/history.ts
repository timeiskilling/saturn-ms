export type TransactionHistoryRecord = {
  id: string;
  signer: string;
  tx_signature: string;
  owner_wallet: string;
  receiver: string;
  input_mint: string;
  output_mint: string;
  amount: string;
  transaction_date: string; // DateTime<Utc> ISO 8601 ("2026-06-07T12:42:13Z")
};

export type HistoryTransactionRequest = Omit<
  TransactionHistoryRecord,
  "id" | "transaction_date" | "owner_wallet"
>;

import { appConfig } from "@/config/appConfig";

export async function fetchTransactionHistory(): Promise<
  TransactionHistoryRecord[]
> {
  try {
    const response = await fetch(`${appConfig.sessionBaseUrl}/wallet/history`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) {
      window.dispatchEvent(new Event("saturn_wallet_logout"));
      return [];
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch history error:", error);
    return [];
  }
}

export async function recordTransaction(
  payload: HistoryTransactionRequest,
): Promise<TransactionHistoryRecord | null> {
  try {
    const response = await fetch(`${appConfig.sessionBaseUrl}/wallet/record`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      window.dispatchEvent(new Event("saturn_wallet_logout"));
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to record transaction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Record transaction error:", error);
    return null;
  }
}
