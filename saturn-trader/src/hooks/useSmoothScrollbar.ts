// hooks/useSmoothScrollbar.ts
import { useEffect, useRef } from "react";
import Scrollbar from "smooth-scrollbar";

export function useSmoothScrollbar(dependencies: any[]) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      if (scrollContainerRef.current)
        scrollContainerRef.current.style.overflowY = "auto";
      return;
    }

    const container = scrollContainerRef.current;
    if (container) {
      const scrollbar = Scrollbar.init(container, {
        damping: 0.1,
        renderByPixels: true,
        alwaysShowTracks: true,
        continuousScrolling: true,
      });

      scrollbar.addListener((status) => {
        const progress =
          status.limit.y > 0 ? status.offset.y / status.limit.y : 0;
        container.style.setProperty("--scroll-progress", `${progress * 100}%`);
        container.style.setProperty(
          "--scroll-progress-num",
          progress.toString(),
        );
      });

      return () => scrollbar.destroy();
    }
  }, dependencies);

  return scrollContainerRef;
}
