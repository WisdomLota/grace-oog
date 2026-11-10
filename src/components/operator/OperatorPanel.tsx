"use client";

/**
 * The media team's control panel. It owns the single source of truth
 * (OperatorState) and broadcasts what the output screen should show.
 */
import { formatReference } from "@/lib/bible/reference";
import { queuePosition } from "@/lib/operator/state";
import type { DisplayState } from "@/lib/sync/channel";
import { HistoryList } from "./HistoryList";
import { useChapter, useOperatorState, useOutputSync, useVersions } from "./hooks";
import { useState } from "react";
import { detectReferences } from "@/lib/speech/detect";
import { ListeningPanel, type DetectedItem } from "./ListeningPanel";
import { ManualSearch } from "./ManualSearch";
import { NowShowing } from "./NowShowing";
import { Button, StatusPill } from "./ui";
import { VersionSwitcher } from "./VersionSwitcher";

export function OperatorPanel() {
  const [state, dispatch] = useOperatorState();
  const { versions, error: versionsError } = useVersions();
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const { passage, current, live, version } = state;

  const versionInfo = versions.find((v) => v.id === version);
  const versionLabel = versionInfo?.label ?? version;
  const chapter = useChapter(version, passage?.book, passage?.chapter);

  // Text of the selected verse (null = still loading).
  let text: string | null = null;
  let error: string | null = null;
  if (chapter.status === "ready") {
    text = chapter.verses[current - 1] || `(This verse is not included in the ${versionInfo?.name ?? version}.)`;
  } else if (chapter.status === "error") {
    error = chapter.error;
  }

  // What the output screen should show. null = keep showing what's there (loading / error).
  let display: DisplayState | null;
  if (!live || !passage) display = { state: "blank" };
  else if (text === null) display = null;
  else display = { state: "verse", reference: formatReference({ book: passage.book, chapter: passage.chapter, verseStart: current }), verseText: text, version: versionLabel };

  const outputConnected = useOutputSync(display);

  const openOutput = () => window.open("/output", "grace-output", "popup,width=1280,height=720");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-op-border bg-op-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="mr-auto text-xl font-bold">Grace</h1>
          <StatusPill ok={null} label="Mic off" title="Speech recognition arrives in a later build step" />
          <StatusPill ok={null} label="Listening: Off" />
          <StatusPill
            ok={outputConnected}
            label={outputConnected ? "Output connected" : "Output not open"}
            title="Open /output in this same browser (another window or tab), or use it as an OBS browser source"
          />
          <Button onClick={openOutput} className="py-1.5 text-sm">
            Open output window
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <NowShowing
            passage={passage}
            current={current}
            live={live}
            versionLabel={versionLabel}
            text={text}
            error={error}
            position={queuePosition(state)}
            onPrev={() => dispatch({ type: "prev" })}
            onNext={() => dispatch({ type: "next" })}
            onGoto={(verse) => dispatch({ type: "goto", verse })}
            onClear={() => dispatch({ type: "clear" })}
            onReshow={() => dispatch({ type: "reshow" })}
          />
          <ManualSearch onShow={(ref) => dispatch({ type: "show", ref })} />
          <VersionSwitcher versions={versions} selected={version} error={versionsError} onSelect={(id) => dispatch({ type: "setVersion", version: id })} />
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <ListeningPanel
            mode="off"
            detected={detected}
            onTry={(sentence) => {
              const found = detectReferences(sentence);
              const now = Date.now();
              const items = found.map((detection, k) => ({ id: `${now}-${k}`, at: now, detection }));
              setDetected((prev) => [...items.reverse(), ...prev].slice(0, 30));
              return found.length;
            }}
            onShow={(item, ref) => {
              dispatch({ type: "show", ref });
              setDetected((prev) => prev.filter((d) => d.id !== item.id));
            }}
            onDismiss={(id) => setDetected((prev) => prev.filter((d) => d.id !== id))}
            onClearDetected={() => setDetected([])}
          />
          <HistoryList history={state.history} onShow={(ref) => dispatch({ type: "show", ref })} onClear={() => dispatch({ type: "clearHistory" })} />
        </aside>
      </main>
    </div>
  );
}
