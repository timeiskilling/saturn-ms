const checkImage = (src: string): Promise<boolean> =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });

const CACHE_KEY = "token_icons_cache";

export const getCachedIcon = (mint: string): string | null => {
  if (typeof window === "undefined") return null;
  const data = sessionStorage.getItem(CACHE_KEY);
  if (!data) return null;

  try {
    const parsed = JSON.parse(data) as [string, string][];
    const cache = new Map<string, string>(parsed);
    return cache.get(mint) ?? null;
  } catch (e) {
    return null;
  }
};

const saveToCache = (mint: string, url: string) => {
  const data = sessionStorage.getItem(CACHE_KEY);
  const cache = data
    ? new Map<string, string>(JSON.parse(data) as [string, string][])
    : new Map<string, string>();

  cache.set(mint, url);
  sessionStorage.setItem(
    CACHE_KEY,
    JSON.stringify(Array.from(cache.entries())),
  );
};

export const getBestIcon = async (
  mint: string,
  sources: string[],
): Promise<string | null> => {
  const cached = getCachedIcon(mint);
  if (cached) return cached;

  for (const src of sources) {
    if (!src) continue;
    try {
      const ok = await checkImage(src);
      if (ok) {
        saveToCache(mint, src);
        return src;
      }
    } catch {
      continue;
    }
  }

  saveToCache(mint, "");
  return null;
};
