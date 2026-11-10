"use client";

import type { VersionInfo } from "@/lib/bible/types";
import { Card } from "./ui";

/** One button per available version. Adding a version to the registry adds a button here automatically. */
export function VersionSwitcher({ versions, selected, error, onSelect }: { versions: VersionInfo[]; selected: string; error: string | null; onSelect: (id: string) => void }) {
  return (
    <Card title="Version">
      {error && <p className="mb-2 text-sm text-op-danger">{error}</p>}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Bible version">
        {versions.map((v) => {
          const on = v.id === selected;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={on}
              title={`${v.name}${v.year ? ` (${v.year})` : ""}`}
              onClick={() => onSelect(v.id)}
              className={`rounded-op px-4 py-2 font-semibold transition ${on ? "bg-op-accent text-op-accent-text shadow" : "border border-op-border bg-op-surface hover:bg-op-bg"}`}
            >
              {v.label}
            </button>
          );
        })}
        {!versions.length && !error && <span className="text-sm text-op-muted">Loading versions…</span>}
      </div>
    </Card>
  );
}
