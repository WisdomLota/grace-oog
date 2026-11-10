"use client";

/**
 * The projector / OBS screen. Shows ONLY the verse text, its reference and
 * the version label — no controls, no cursor. It renders whatever the
 * operator panel broadcasts.
 *
 * Tip: double-click anywhere to toggle fullscreen (nothing is shown on screen for it).
 */
import { useEffect, useRef, useState } from "react";
import { HEARTBEAT_MS, openChannel, type DisplayState } from "@/lib/sync/channel";
import { FitText } from "./FitText";

const BLANK: DisplayState = { state: "blank" };

/** Reads a CSS token like "450ms" or "9vmin" and converts to a number (ms or px). */
function readToken(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return fallback;
  if (raw.endsWith("vmin")) return (n / 100) * Math.min(window.innerWidth, window.innerHeight);
  if (raw.endsWith("s") && !raw.endsWith("ms")) return n * 1000;
  return n;
}

function sameDisplay(a: DisplayState, b: DisplayState) {
  if (a.state !== b.state) return false;
  if (a.state === "blank" || b.state === "blank") return true;
  return a.reference === b.reference && a.verseText === b.verseText && a.version === b.version;
}

export function OutputScreen() {
  /** What is actually painted (lags `target` by one fade-out). */
  const [shown, setShown] = useState<DisplayState>(BLANK);
  const [visible, setVisible] = useState(false);
  const [sizes, setSizes] = useState({ min: 16, max: 72 });
  const shownRef = useRef<DisplayState>(BLANK);
  const fadeTimer = useRef<number | undefined>(undefined);

  // Font-size limits come from the design tokens and depend on the window size.
  useEffect(() => {
    const update = () => setSizes({ min: readToken("--out-min-font", 16), max: readToken("--out-max-font", 72) });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const fadeMs = readToken("--out-fade-ms", 450);
    const outputId = Math.random().toString(36).slice(2);

    /** Fade out the old verse, swap content, fade the new one in. */
    const showTarget = (target: DisplayState) => {
      if (sameDisplay(target, shownRef.current)) return;
      window.clearTimeout(fadeTimer.current);
      const wasBlank = shownRef.current.state === "blank";
      setVisible(false);
      fadeTimer.current = window.setTimeout(
        () => {
          shownRef.current = target;
          setShown(target);
          setVisible(target.state === "verse");
        },
        wasBlank ? 0 : fadeMs,
      );
    };

    const ch = openChannel((msg) => {
      if (msg.type === "display") showTarget(msg.display);
    });
    // Ask the operator for the current state, so a refresh recovers instantly.
    ch.post({ type: "request-state" });
    ch.post({ type: "heartbeat", outputId });
    const beat = window.setInterval(() => ch.post({ type: "heartbeat", outputId }), HEARTBEAT_MS);

    return () => {
      window.clearInterval(beat);
      window.clearTimeout(fadeTimer.current);
      ch.close();
    };
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  return (
    <main
      onDoubleClick={toggleFullscreen}
      className="fixed inset-0 flex cursor-none select-none flex-col"
      style={{ background: "var(--out-bg)", color: "var(--out-text)", fontFamily: "var(--out-font)", padding: "var(--out-padding)" }}
    >
      <div
        className="flex min-h-0 flex-1 flex-col transition-opacity ease-in-out"
        style={{ opacity: visible ? 1 : 0, transitionDuration: "var(--out-fade-ms)", gap: "var(--out-gap)" }}
      >
        {shown.state === "verse" && (
          <>
            <FitText minPx={sizes.min} maxPx={sizes.max} className="flex-1">
              <p className="text-center" style={{ lineHeight: "var(--out-line-height)", textWrap: "balance" }}>
                {shown.verseText}
              </p>
            </FitText>
            <footer className="text-center" style={{ color: "var(--out-muted)" }}>
              <div style={{ fontSize: "var(--out-ref-size)" }}>{shown.reference}</div>
              <div style={{ fontSize: "var(--out-version-size)", letterSpacing: "0.12em" }}>{shown.version}</div>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
