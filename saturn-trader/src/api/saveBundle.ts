import { appConfig } from "@/config/appConfig";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type SaveBundlesPayload = {
  bundles: Json[];
};

export async function saveBundle(bundles: Json[]): Promise<boolean> {
  try {
    const payload: SaveBundlesPayload = { bundles };

    const response = await fetch(`${appConfig.sessionBaseUrl}/bundles`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save bundles: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Save bundles error:", error);
    return false;
  }
}

export async function fetchBundles(): Promise<Json[] | null> {
  try {
    const response = await fetch(`${appConfig.sessionBaseUrl}/bundles`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) {
      // Unauthorized is expected if there is no session token, return null silently
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch bundles: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Fetch bundles error:", error);
    return null;
  }
}
