"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Renders children at the largest font size (between min and max) that fits
 * inside the available box, so long verses never overflow the screen.
 * Sizes are in px; re-measures when the content or window size changes.
 */
export function FitText({ minPx, maxPx, children, className }: { minPx: number; maxPx: number; children: ReactNode; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;

    const fit = () => {
      const fits = () => text.scrollHeight <= box.clientHeight && text.scrollWidth <= box.clientWidth;
      // Binary search for the biggest size that still fits (to 0.5px).
      let lo = minPx;
      let hi = maxPx;
      text.style.fontSize = `${hi}px`;
      if (fits()) return;
      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        text.style.fontSize = `${mid}px`;
        if (fits()) lo = mid;
        else hi = mid;
      }
      text.style.fontSize = `${lo}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [minPx, maxPx, children]);

  return (
    <div ref={boxRef} className={`relative flex min-h-0 items-center justify-center overflow-hidden ${className ?? ""}`}>
      <div ref={textRef} className="max-h-full w-full">
        {children}
      </div>
    </div>
  );
}
