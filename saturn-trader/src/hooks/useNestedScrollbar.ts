import { useEffect, useRef } from "react";
import Scrollbar from "smooth-scrollbar";
import OverscrollPlugin from "smooth-scrollbar/plugins/overscroll";

Scrollbar.use(OverscrollPlugin);

export function useNestedScrollbar(isOpen: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;
    const el = scrollRef.current;

    const scrollbar = Scrollbar.init(el, {
      damping: 0.1,
      alwaysShowTracks: true,
      continuousScrolling: false,
      plugins: {
        overscroll: {
          enable: true,
          effect: "bounce",
          damping: 0.15,
          maxOverscroll: 50,
        },
      },
    });

    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };

    el.addEventListener("wheel", stopPropagation, { passive: false });
    el.addEventListener("touchmove", stopPropagation, { passive: false });

    return () => {
      el.removeEventListener("wheel", stopPropagation);
      el.removeEventListener("touchmove", stopPropagation);
      if (scrollbar) scrollbar.destroy();
    };
  }, [isOpen]);

  return scrollRef;
}
