const cache = new Map<string, string>();

const checkImage = (src: string): Promise<boolean> =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });

export const getBestIcon = async (
  token: { mint: string; icon?: string },
  sources: string[],
): Promise<string | null> => {
  if (cache.has(token.mint)) return cache.get(token.mint) || null;

  for (const src of sources) {
    if (!src) continue;
    const ok = await checkImage(src);
    if (ok) {
      cache.set(token.mint, src);
      return src;
    }
  }

  cache.set(token.mint, "");
  return null;
};
