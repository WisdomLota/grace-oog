"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { BookId } from "@/lib/bible/books";
import { getSource, initSources } from "@/lib/bible/sources";
import type { VersionInfo } from "@/lib/bible/types";
import { initialState, isOperatorState, operatorReducer, type OperatorAction, type OperatorState } from "@/lib/operator/state";
import { HEARTBEAT_TIMEOUT_MS, openChannel, type DisplayState } from "@/lib/sync/channel";

// ---------------------------------------------------------------------------
// Bible versions
// ---------------------------------------------------------------------------

/** The list of available versions (loaded once from the registry). */
export function useVersions() {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    initSources().then(
      (v) => alive && setVersions(v),
      (e: Error) => alive && setError(e.message),
    );
    return () => {
      alive = false;
    };
  }, []);
  return { versions, error };
}

type ChapterState = { key: string; status: "ready"; verses: string[] } | { key: string; status: "error"; error: string };

/** Verse texts for one chapter of one version. Re-loads when any input changes. */
export function useChapter(version: string, book: BookId | undefined, chapter: number | undefined) {
  const key = book && chapter ? `${version}|${book}|${chapter}` : "";
  const [loaded, setLoaded] = useState<ChapterState | null>(null);

  useEffect(() => {
    if (!key || !book || !chapter) return;
    let alive = true;
    initSources()
      .then(() => {
        const source = getSource(version);
        if (!source) throw new Error(`The ${version} version is not available.`);
        return source.getChapter(book, chapter);
      })
      .then((verses) => {
        if (!alive) return;
        if (verses) setLoaded({ key, status: "ready", verses });
        else setLoaded({ key, status: "error", error: `This chapter is not available in ${version}.` });
      })
      .catch((e: Error) => alive && setLoaded({ key, status: "error", error: e.message }));
    return () => {
      alive = false;
    };
  }, [key, version, book, chapter]);

  if (!key) return { status: "idle" as const };
  if (!loaded || loaded.key !== key) return { status: "loading" as const };
  return loaded;
}

// ---------------------------------------------------------------------------
// Operator state, saved so a refresh mid-service doesn't lose anything
// ---------------------------------------------------------------------------

const STORAGE_KEY = "grace.operator.v1";

function loadSaved(): OperatorState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (isOperatorState(saved)) return { ...initialState, ...saved };
  } catch {
    /* storage blocked or corrupt — start fresh */
  }
  return initialState;
}

/** Operator state + dispatch. Must run in the browser only (reads localStorage on first render). */
export function useOperatorState(): [OperatorState, (a: OperatorAction) => void] {
  const [state, dispatch] = useReducer(operatorReducer, undefined, loadSaved);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);
  return [state, dispatch];
}

// ---------------------------------------------------------------------------
// Sync with /output
// ---------------------------------------------------------------------------

/**
 * Broadcasts `display` to every open output screen whenever it changes, and
 * answers "request-state" from a freshly opened output. Pass `null` while a
 * verse is still loading to keep the screen as it is.
 * Returns whether at least one output screen is connected.
 */
export function useOutputSync(display: DisplayState | null) {
  const lastSent = useRef<DisplayState>({ state: "blank" });
  const channel = useRef<ReturnType<typeof openChannel> | null>(null);
  const lastBeat = useRef(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ch = openChannel((msg) => {
      if (msg.type === "request-state") ch.post({ type: "display", display: lastSent.current });
      if (msg.type === "heartbeat") {
        lastBeat.current = Date.now();
        setConnected(true);
      }
    });
    channel.current = ch;
    const check = window.setInterval(() => setConnected(Date.now() - lastBeat.current < HEARTBEAT_TIMEOUT_MS), 1000);
    return () => {
      window.clearInterval(check);
      ch.close();
      channel.current = null;
    };
  }, []);

  const serialised = display ? JSON.stringify(display) : null;
  useEffect(() => {
    if (!serialised) return;
    lastSent.current = JSON.parse(serialised);
    channel.current?.post({ type: "display", display: lastSent.current });
  }, [serialised]);

  return connected;
}
