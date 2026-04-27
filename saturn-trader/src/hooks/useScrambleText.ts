import { useState, useEffect, useRef } from "react";

const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}:<>?|[];,./";

export function useScrambleText(targetWord: string, play: boolean = true) {
  const [displayedText, setDisplayedText] = useState(targetWord);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!play) {
      setDisplayedText(targetWord);
      return;
    }

    let iteration = 0;
    let lastUpdate = performance.now();

    const animate = (time: number) => {
      // Throttle the visual updates to ~30ms for a satisfying "flicker"
      // instead of a blurry mess on high refresh rate monitors.
      if (time - lastUpdate > 30) {
        setDisplayedText(
          targetWord
            .split("")
            .map((letter, index) => {
              // 1. Reveal letters from left to right based on 'iteration'
              // 2. Always show spaces
              if (index < iteration || letter === " ") {
                return letter;
              }
              // 3. Scramble the remaining characters
              return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
            })
            .join(""),
        );

        lastUpdate = time;
        // Adjust this value to change how fast the text reveals (higher = faster)
        iteration += 1 / 2;
      }

      if (iteration < targetWord.length) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayedText(targetWord);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [targetWord, play]);

  return displayedText;
}
