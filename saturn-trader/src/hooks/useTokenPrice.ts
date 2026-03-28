import { useState, useEffect } from "react";

export interface TokenPriceData {
  symbol: string;
  price: number;
  priceChange: number;
  percentChange: number;
}

type Listener = (data: TokenPriceData) => void;

let sharedWs: WebSocket | null = null;
const listeners = new Set<Listener>();
const priceCache: Record<string, TokenPriceData> = {};

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
          c = data.c !== undefined ? data.c : data.message;
          p = data.p || "0";
          P = data.P || "0";
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

          // Broadcast the data payload to all hooked React components
          listeners.forEach((listener) => listener(priceDataObj));
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
      const targetSymbol = `${symbol.toUpperCase()}USDT`;
      const currentSymbol = `${data.symbol.toUpperCase()}USDT`;

      if (
        currentSymbol === targetSymbol ||
        data.symbol.toUpperCase() === symbol.toUpperCase()
      ) {
        setPriceData(data);
      }
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);

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
