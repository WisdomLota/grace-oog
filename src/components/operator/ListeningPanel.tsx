"use client";

/**
 * Listening controls: mode toggle, live transcript and the Detected queue.
 * Speech recognition is wired up in build step 6 and auto-display in step 7.
 * Until then, "Try a sentence" runs typed text through the same detector the
 * microphone will use (and stays useful for testing afterwards).
 */
import { useState } from "react";
import { formatReference } from "@/lib/bible/reference";
import type { Reference } from "@/lib/bible/types";
import type { Detection } from "@/lib/speech/detect";
import { Button, Card } from "./ui";

export type ListenMode = "off" | "always" | "wake";
export type DetectedItem = { id: string; at: number; detection: Detection };

const MODES: { id: ListenMode; label: string; hint: string }[] = [
  { id: "off", label: "Off", hint: "Not listening" },
  { id: "always", label: "Always listening", hint: "Detects every reference spoken" },
  { id: "wake", label: "Wake phrase", hint: 'Only after "Hello Grace"' },
];

type Props = {
  mode: ListenMode;
  detected: DetectedItem[];
  /** Runs text through the detector; returns how many references were found. */
  onTry: (text: string) => number;
  onShow: (item: DetectedItem, ref: Reference) => void;
  onDismiss: (id: string) => void;
  onClearDetected: () => void;
};

export function ListeningPanel({ mode, detected, onTry, onShow, onDismiss, onClearDetected }: Props) {
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);

  return (
    <>
      <Card title="Listening" right={<span className="text-xs text-op-muted">Speech coming soon</span>}>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Listening mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              disabled={m.id !== "off"}
              title={m.hint}
              className={`rounded-op px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${mode === m.id ? "bg-op-accent text-op-accent-text" : "border border-op-border"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="mt-3 min-h-12 rounded-op border border-dashed border-op-border bg-op-bg px-3 py-2 text-sm text-op-muted" aria-label="Live transcript">
          The live transcript of what the app hears will appear here.
        </div>
      </Card>

      <Card
        title="Detected"
        right={
          detected.length > 0 && (
            <Button variant="ghost" onClick={onClearDetected} className="px-2 py-1 text-sm">
              Clear
            </Button>
          )
        }
      >
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            const n = onTry(text);
            setNote(n ? null : "No Bible reference found in that sentence.");
            if (n) setText("");
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Try a sentence, e.g. "turn to first Corinthians thirteen verse four"'
            aria-label="Try a spoken sentence"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-op border border-op-border bg-white px-3 py-2 text-sm outline-none focus:border-op-accent"
          />
          <Button type="submit" className="px-3 py-2 text-sm">
            Detect
          </Button>
        </form>
        {note && <p className="mt-2 text-sm text-op-warn">{note}</p>}

        {detected.length === 0 ? (
          <p className="mt-3 text-sm text-op-muted">References detected from speech will queue here, newest on top.</p>
        ) : (
          <ul className="mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto">
            {detected.map((item) => {
              const d = item.detection;
              const high = d.confidence === "high";
              return (
                <li key={item.id} className={`rounded-op border p-3 ${high ? "border-op-border" : "border-op-warn/60 bg-amber-50"}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatReference(d.ref)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${high ? "bg-op-live text-white" : "bg-op-warn text-white"}`}
                      title={high ? "Confident: will auto-display once listening is on" : "Not sure: needs you to confirm"}
                    >
                      {high ? "Confident" : "Check"}
                    </span>
                    <span className="ml-auto flex gap-1">
                      <Button variant="primary" onClick={() => onShow(item, d.ref)} className="px-3 py-1 text-sm">
                        Show
                      </Button>
                      <Button variant="ghost" onClick={() => onDismiss(item.id)} className="px-2 py-1 text-sm" aria-label="Dismiss">
                        ✕
                      </Button>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-op-muted">Heard: “{d.text}”</p>
                  {d.reasons.length > 0 && <p className="mt-0.5 text-xs text-op-warn">{d.reasons.join(" · ")}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
