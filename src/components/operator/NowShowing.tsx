"use client";

/**
 * "On screen now": a mini copy of the output screen plus the verse stepper
 * (Previous / Next — these exist only here) and the Clear screen button.
 */
import { formatReference, versesInReference } from "@/lib/bible/reference";
import type { Reference } from "@/lib/bible/types";
import { Button, Card } from "./ui";

type Props = {
  passage: Reference | null;
  current: number;
  live: boolean;
  versionLabel: string;
  /** Text of the selected verse, or null while loading. */
  text: string | null;
  error: string | null;
  position: { index: number; total: number; hasPrev: boolean; hasNext: boolean };
  onPrev: () => void;
  onNext: () => void;
  onGoto: (verse: number) => void;
  onClear: () => void;
  onReshow: () => void;
};

export function NowShowing({ passage, current, live, versionLabel, text, error, position, onPrev, onNext, onGoto, onClear, onReshow }: Props) {
  const verseRef = passage ? formatReference({ book: passage.book, chapter: passage.chapter, verseStart: current }) : null;

  const badge = live ? (
    <span className="rounded-full bg-op-live px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">On screen</span>
  ) : (
    <span className="rounded-full bg-op-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Screen blank</span>
  );

  return (
    <Card title="On screen now" right={badge}>
      {/* Mini output preview */}
      <div
        className={`flex min-h-48 flex-col justify-center gap-3 rounded-op border border-op-border p-6 text-center transition-opacity ${live ? "" : "opacity-45"}`}
        style={{ background: "var(--out-bg)", color: "var(--out-text)", fontFamily: "var(--out-font)" }}
      >
        {!passage ? (
          <p className="text-op-muted">Nothing selected yet. Type a reference below, e.g. John 3:16.</p>
        ) : error ? (
          <p className="text-op-danger">{error}</p>
        ) : text === null ? (
          <p className="text-op-muted">Loading…</p>
        ) : (
          <>
            <p className="text-xl leading-snug">{text}</p>
            <p style={{ color: "var(--out-muted)" }}>
              {verseRef} · {versionLabel}
            </p>
          </>
        )}
      </div>

      {/* Stepper */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={onPrev} disabled={!position.hasPrev} className="min-w-36 py-3 text-lg">
          ◀ Previous verse
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!position.hasNext} className="min-w-36 py-3 text-lg">
          Next verse ▶
        </Button>
        <div className="flex-1 text-center text-sm text-op-muted">
          {passage && position.total > 1 && (
            <>
              Verse {position.index + 1} of {position.total} · {formatReference(passage)}
            </>
          )}
        </div>
        {live ? (
          <Button variant="danger" onClick={onClear} className="py-3 text-lg">
            Clear screen
          </Button>
        ) : (
          <Button variant="primary" onClick={onReshow} disabled={!passage} className="py-3 text-lg">
            Show on screen
          </Button>
        )}
      </div>

      {/* Verse chips for a passage: click to jump */}
      {passage && position.total > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Verses in this passage">
          {versesInReference(passage).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onGoto(v)}
              className={`h-8 min-w-8 rounded-md px-2 text-sm ${v === current ? "bg-op-accent text-op-accent-text" : "border border-op-border hover:bg-op-bg"}`}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
