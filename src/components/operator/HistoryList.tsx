"use client";

import { formatReference } from "@/lib/bible/reference";
import type { HistoryEntry } from "@/lib/operator/state";
import type { Reference } from "@/lib/bible/types";
import { Button, Card } from "./ui";

const time = (at: number) => new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** Previously displayed passages, newest first. Click one to show it again. */
export function HistoryList({ history, onShow, onClear }: { history: HistoryEntry[]; onShow: (ref: Reference) => void; onClear: () => void }) {
  return (
    <Card
      title="History"
      right={
        history.length > 0 && (
          <Button variant="ghost" onClick={onClear} className="px-2 py-1 text-sm">
            Clear list
          </Button>
        )
      }
    >
      {history.length === 0 ? (
        <p className="text-sm text-op-muted">Verses you display will be listed here.</p>
      ) : (
        <ul className="max-h-80 divide-y divide-op-border overflow-y-auto">
          {history.map((h) => (
            <li key={`${formatReference(h.ref)}-${h.at}`}>
              <button type="button" onClick={() => onShow(h.ref)} className="flex w-full items-center justify-between gap-3 px-2 py-2 text-left hover:bg-op-bg">
                <span className="font-medium">{formatReference(h.ref)}</span>
                <span className="shrink-0 text-xs text-op-muted">
                  {h.version} · {time(h.at)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
