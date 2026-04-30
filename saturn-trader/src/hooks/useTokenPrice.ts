import { useState, useEffect } from "react";

export interface TokenPriceData {
  symbol: string;
  price: number;
  priceChange: number;
  percentChange: number;
}

type Listener = (data: TokenPriceData) => void;

let sharedWs: WebSocket | null = null;
const listeners = new Map<string, Set<Listener>>();
const priceCache: Record<string, TokenPriceData> = {};
const lastUpdateTime: Record<string, number> = {};
const THROTTLE_MS = 250; // Max 4 updates per second per symbol

function getSharedWebSocket(): WebSocket {
  if (!sharedWs || sharedWs.readyState === WebSocket.CLOSED) {
    const wsUrl = `ws://${window.location.host}/ws`;
    sharedWs = new WebSocket(wsUrl);

    sharedWs.onmessage = (event) => {
      try {
        let data;
        try {
          const parsed = JSON.parse(event.data);
          data = parsed.data || parsed;
        } catch {
          // Fallback if the payload is a raw un-stringified text
          data = event.data;
        }

        let s: string | null = null;
        let c: string | number | null = null;
        let p: string | number = "0";
        let P: string | number = "0";

        if (typeof data === "string") {
          const jsonStart = data.indexOf("{");
          if (jsonStart !== -1) {
            try {
              data = JSON.parse(data.substring(jsonStart));
            } catch {}
          }
        }

        if (typeof data === "string") {
          const parts = data.split(/[:|,-]+/);
          if (parts.length >= 2) {
            s = (parts[parts.length - 2] || "")
              .replace(/binance/i, "")
              .toUpperCase();
            c = parts[parts.length - 1] || null;
          }
        } else if (data && typeof data === "object") {
          const rawS = data.s || data.channel;
          s = rawS
            ? String(rawS)
                .replace(/binance:/i, "")
                .toUpperCase()
            : null;

          let msg = data.c !== undefined ? data.c : data.message;

          if (typeof msg === "string" && msg.trim().startsWith("{")) {
            try {
              const inner = JSON.parse(msg);
              msg = inner.c !== undefined ? inner.c : msg;
              p = inner.p !== undefined ? inner.p : data.p || "0";
              P = inner.P !== undefined ? inner.P : data.P || "0";
              s = inner.s ? String(inner.s).toUpperCase() : s;
            } catch {
              p = data.p || "0";
              P = data.P || "0";
            }
          } else {
            p = data.p || "0";
            P = data.P || "0";
          }
          c = msg;
        }

        if (s && c !== undefined && c !== null) {
          const currentSymbol = s.toUpperCase();
          const baseSymbol = currentSymbol.replace(/USDT$/, "");

          const priceDataObj: TokenPriceData = {
            symbol: baseSymbol,
            price: parseFloat(String(c)),
            priceChange: parseFloat(String(p)),
            percentChange: parseFloat(String(P)),
          };

          priceCache[currentSymbol] = priceDataObj;
          priceCache[baseSymbol] = priceDataObj;

          const now = Date.now();
          const lastUpdate = lastUpdateTime[baseSymbol] || 0;

          if (now - lastUpdate >= THROTTLE_MS) {
            lastUpdateTime[baseSymbol] = now;

            // Broadcast the data payload to listeners of this specific symbol
            const targetSet = listeners.get(baseSymbol);
            if (targetSet) {
              targetSet.forEach((listener) => listener(priceDataObj));
            }

            const targetSetUSDT = listeners.get(`${baseSymbol}USDT`);
            if (targetSetUSDT) {
              targetSetUSDT.forEach((listener) => listener(priceDataObj));
            }
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket price data:", error);
      }
    };

    sharedWs.onerror = (error) => {
      console.error("Shared WebSocket error:", error);
    };

    sharedWs.onclose = () => {
      sharedWs = null;
    };
  }
  return sharedWs;
}

export function useTokenPrice(symbol: string | undefined) {
  const [priceData, setPriceData] = useState<TokenPriceData | null>(() => {
    if (!symbol) return null;
    return (
      priceCache[symbol.toUpperCase()] ||
      priceCache[`${symbol.toUpperCase()}USDT`] ||
      null
    );
  });

  useEffect(() => {
    if (!symbol) {
      setPriceData(null);
      return;
    }

    // Connect to the shared Bun WebSocket exactly once
    getSharedWebSocket();

    // Check cache immediately in case it loaded before this effect runs
    const cached =
      priceCache[symbol.toUpperCase()] ||
      priceCache[`${symbol.toUpperCase()}USDT`];
    if (cached) {
      setPriceData(cached);
    }

    const listener: Listener = (data) => {
      setPriceData((prev) => {
        if (
          prev &&
          prev.price === data.price &&
          prev.priceChange === data.priceChange &&
          prev.percentChange === data.percentChange
        ) {
          return prev;
        }
        return data;
      });
    };

    const targetKey = symbol.toUpperCase();
    if (!listeners.has(targetKey)) {
      listeners.set(targetKey, new Set());
    }
    listeners.get(targetKey)!.add(listener);

    return () => {
      const targetSet = listeners.get(targetKey);
      if (targetSet) {
        targetSet.delete(listener);
        if (targetSet.size === 0) {
          listeners.delete(targetKey);
        }
      }

      // Clean up the shared WebSocket connection if no components are listening
      if (listeners.size === 0 && sharedWs) {
        if (
          sharedWs.readyState === WebSocket.OPEN ||
          sharedWs.readyState === WebSocket.CONNECTING
        ) {
          sharedWs.close();
        }
        sharedWs = null;
      }
    };
  }, [symbol]);

  return priceData;
}
