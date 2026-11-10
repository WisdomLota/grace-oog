"use client";

/** Type a reference and press Enter to display it. The safety net for mishearing. */
import { useState } from "react";
import { formatReference, versesInReference } from "@/lib/bible/reference";
import type { Reference } from "@/lib/bible/types";
import { parseTypedReference } from "@/lib/bible/typedReference";
import { Button, Card } from "./ui";

export function ManualSearch({ onShow }: { onShow: (ref: Reference) => void }) {
  const [text, setText] = useState("");
  const parsed = text.trim() ? parseTypedReference(text) : null;

  const submit = () => {
    if (parsed?.ok) {
      onShow(parsed.ref);
      setText("");
    }
  };

  return (
    <Card title="Find a verse">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. 1 Cor 13:4-7, John 3:16, Psalm 23"
          aria-label="Bible reference"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-op border border-op-border bg-white px-4 py-3 text-lg outline-none focus:border-op-accent focus:ring-2 focus:ring-op-accent/30"
        />
        <Button type="submit" variant="primary" disabled={!parsed?.ok} className="px-6 text-lg">
          Show
        </Button>
      </form>
      <p className={`mt-2 min-h-5 text-sm ${parsed && !parsed.ok ? "text-op-warn" : "text-op-muted"}`}>
        {!parsed
          ? "Press Enter to put it on screen. A range becomes a queue you step through with Next."
          : parsed.ok
            ? `→ ${formatReference(parsed.ref)}${parsed.ref.verseEnd ? ` (${versesInReference(parsed.ref).length} verses)` : ""}`
            : parsed.error}
      </p>
    </Card>
  );
}
