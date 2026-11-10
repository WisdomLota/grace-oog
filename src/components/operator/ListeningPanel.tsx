"use client";

/**
 * Listening controls: mode toggle, live transcript and detected queue.
 * SHELL ONLY for now — speech recognition is wired up in build step 6,
 * detection in step 5 and auto-display in step 7.
 */
import { Card } from "./ui";

export type ListenMode = "off" | "always" | "wake";

const MODES: { id: ListenMode; label: string; hint: string }[] = [
  { id: "off", label: "Off", hint: "Not listening" },
  { id: "always", label: "Always listening", hint: "Detects every reference spoken" },
  { id: "wake", label: "Wake phrase", hint: 'Only after "Hello Grace"' },
];

export function ListeningPanel({ mode }: { mode: ListenMode }) {
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

      <Card title="Detected">
        <p className="text-sm text-op-muted">References detected from speech will queue here, newest on top.</p>
      </Card>
    </>
  );
}
