import React, { useEffect, useRef, memo } from "react";

export function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent duplicate script injection (React StrictMode runs effects twice)
    if (!container.current || container.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      calendar: false,
      details: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      hotlist: false,
      interval: "60",
      locale: "en",
      save_image: true,
      style: "1",
      symbol: "COINBASE:SOLUSD",
      theme: "dark",
      timezone: "Etc/UTC",
      backgroundColor: "#0F0F0F",
      gridColor: "rgba(242, 242, 242, 0.06)",
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      studies: [],
      autosize: true,
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        const scriptElement = container.current.querySelector("script");
        if (scriptElement) {
          scriptElement.remove();
        }
      }
    };
  }, []);

  return (
    <div
      className="tradingview-widget-container relative h-full w-full"
      ref={container}
    >
      <div className="tradingview-widget-container__widget absolute inset-0" />
    </div>
  );
}

export default memo(TradingViewWidget);
