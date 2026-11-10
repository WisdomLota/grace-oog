import { describe, expect, it } from "vitest";
import { textAfterWakePhrase, WakeGate } from "./wake";

describe("textAfterWakePhrase", () => {
  it.each([
    ["Hello Grace, John three sixteen", "John three sixteen"],
    ["hello grace john 3 16", "john 3 16"],
    ["hallo grace Romans eight", "Romans eight"],
    ["hello gras first Peter two nine", "first Peter two nine"],
    ["hello grays Psalm 23", "Psalm 23"],
    ["and so, hello Grace. Acts two", "Acts two"],
  ])("%s → %s", (text, after) => expect(textAfterWakePhrase(text)).toBe(after));

  it.each(["amazing grace how sweet", "John three sixteen", "hello everyone", "grace and peace"])("no wake phrase in %s", (text) => {
    expect(textAfterWakePhrase(text)).toBeNull();
  });
});

describe("WakeGate", () => {
  it("only passes text inside the 8-second window", () => {
    const g = new WakeGate(8000);
    expect(g.feed("John three sixteen", 0)).toBeNull();
    expect(g.feed("hello grace", 1000)).toBe("");
    expect(g.feed("John three sixteen", 5000)).toBe("John three sixteen");
    expect(g.feed("Romans eight", 9500)).toBeNull(); // window expired
  });

  it("stops after a reference is captured", () => {
    const g = new WakeGate();
    g.feed("hello grace", 0);
    g.disarm();
    expect(g.feed("John three sixteen", 100)).toBeNull();
  });
});
