/**
 * Operator panel state, as a plain reducer so it is easy to test.
 *
 * A passage like 1 Corinthians 5:11–15 becomes a queue of single verses
 * (11, 12, 13, 14, 15). `current` is the verse in that queue being shown.
 * The output screen only ever shows that one verse.
 */
import { DEFAULT_VERSION } from "../bible/sources";
import { sameReference, versesInReference } from "../bible/reference";
import type { Reference } from "../bible/types";

export type HistoryEntry = { ref: Reference; version: string; at: number };

export type OperatorState = {
  version: string;
  /** The passage currently loaded into the stepper (may be a single verse). */
  passage: Reference | null;
  /** Verse number within `passage` that is selected / on screen. */
  current: number;
  /** true = the verse is on the output screen; false = the screen is blank. */
  live: boolean;
  /** Previously displayed passages, newest first. */
  history: HistoryEntry[];
};

export type OperatorAction =
  | { type: "show"; ref: Reference; at?: number }
  | { type: "next" }
  | { type: "prev" }
  | { type: "goto"; verse: number }
  | { type: "clear" }
  | { type: "reshow" }
  | { type: "setVersion"; version: string }
  | { type: "clearHistory" };

export const MAX_HISTORY = 50;

export const initialState: OperatorState = {
  version: DEFAULT_VERSION,
  passage: null,
  current: 0,
  live: false,
  history: [],
};

export function operatorReducer(state: OperatorState, action: OperatorAction): OperatorState {
  switch (action.type) {
    case "show": {
      const entry: HistoryEntry = { ref: action.ref, version: state.version, at: action.at ?? Date.now() };
      const history = [entry, ...state.history.filter((h) => !sameReference(h.ref, action.ref))].slice(0, MAX_HISTORY);
      return { ...state, passage: action.ref, current: action.ref.verseStart, live: true, history };
    }
    case "next":
    case "prev": {
      if (!state.passage) return state;
      const verses = versesInReference(state.passage);
      const i = verses.indexOf(state.current) + (action.type === "next" ? 1 : -1);
      if (i < 0 || i >= verses.length) return state; // already at the start/end
      return { ...state, current: verses[i], live: true };
    }
    case "goto": {
      if (!state.passage || !versesInReference(state.passage).includes(action.verse)) return state;
      return { ...state, current: action.verse, live: true };
    }
    case "clear":
      return state.live ? { ...state, live: false } : state;
    case "reshow":
      return state.passage ? { ...state, live: true } : state;
    case "setVersion":
      return state.version === action.version ? state : { ...state, version: action.version };
    case "clearHistory":
      return { ...state, history: [] };
  }
}

/** Where we are in the passage, for "Verse 2 of 5" and enabling the buttons. */
export function queuePosition(state: OperatorState) {
  if (!state.passage) return { index: -1, total: 0, hasPrev: false, hasNext: false };
  const verses = versesInReference(state.passage);
  const index = verses.indexOf(state.current);
  return { index, total: verses.length, hasPrev: index > 0, hasNext: index < verses.length - 1 };
}

/** Light sanity check for state restored from localStorage after a refresh. */
export function isOperatorState(x: unknown): x is OperatorState {
  const s = x as OperatorState;
  return !!s && typeof s.version === "string" && typeof s.current === "number" && typeof s.live === "boolean" && Array.isArray(s.history);
}
