import { appConfig } from "@/config/appConfig";

let fetchPromise: Promise<string[]> | null = null;

export async function getLinkedWallets(): Promise<string[]> {
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const response = await fetch(`https://sutrn.com/wallet/linked`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        // Unauthorized is expected if there is no session token, return empty array silently
        return [];
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch linked wallets: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Fetch linked wallets error:", error);
      return [];
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}
