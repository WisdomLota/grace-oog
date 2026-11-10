import { describe, expect, it } from "vitest";
import type { Reference } from "../bible/types";
import { initialState, MAX_HISTORY, operatorReducer as r, queuePosition } from "./state";

const range: Reference = { book: "1CO", chapter: 13, verseStart: 11, verseEnd: 15 };
const single: Reference = { book: "JHN", chapter: 3, verseStart: 16 };

describe("operatorReducer", () => {
  it("shows the first verse of a range and goes live", () => {
    const s = r(initialState, { type: "show", ref: range });
    expect(s.current).toBe(11);
    expect(s.live).toBe(true);
    expect(queuePosition(s)).toEqual({ index: 0, total: 5, hasPrev: false, hasNext: true });
  });

  it("steps through the queue and stops at the ends", () => {
    let s = r(initialState, { type: "show", ref: range });
    s = r(s, { type: "prev" });
    expect(s.current).toBe(11);
    for (let i = 0; i < 10; i++) s = r(s, { type: "next" });
    expect(s.current).toBe(15);
    s = r(s, { type: "prev" });
    expect(s.current).toBe(14);
  });

  it("clear blanks the screen without losing the passage; next re-shows", () => {
    let s = r(initialState, { type: "show", ref: range });
    s = r(s, { type: "clear" });
    expect(s.live).toBe(false);
    expect(s.passage).toEqual(range);
    s = r(s, { type: "next" });
    expect(s).toMatchObject({ live: true, current: 12 });
  });

  it("keeps the current verse when switching version", () => {
    let s = r(initialState, { type: "show", ref: range });
    s = r(s, { type: "next" });
    s = r(s, { type: "setVersion", version: "ASV" });
    expect(s).toMatchObject({ version: "ASV", current: 12, live: true });
  });

  it("records history newest first without duplicates", () => {
    let s = r(initialState, { type: "show", ref: range, at: 1 });
    s = r(s, { type: "show", ref: single, at: 2 });
    s = r(s, { type: "show", ref: range, at: 3 });
    expect(s.history.map((h) => h.at)).toEqual([3, 2]);
  });

  it("caps history length", () => {
    let s = initialState;
    for (let v = 1; v <= MAX_HISTORY + 10; v++) s = r(s, { type: "show", ref: { book: "PSA", chapter: 119, verseStart: v } });
    expect(s.history).toHaveLength(MAX_HISTORY);
  });

  it("goto ignores verses outside the passage", () => {
    const s = r(initialState, { type: "show", ref: range });
    expect(r(s, { type: "goto", verse: 20 })).toBe(s);
    expect(r(s, { type: "goto", verse: 13 }).current).toBe(13);
  });
});
