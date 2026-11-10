import { describe, expect, it } from "vitest";
import { formatReference } from "./reference";
import { findBook, parseTypedReference } from "./typedReference";

/** Parse and format, or return "ERR" so tables stay readable. */
const p = (s: string) => {
  const r = parseTypedReference(s);
  return r.ok ? formatReference(r.ref) : "ERR";
};

describe("parseTypedReference", () => {
  it.each([
    ["1 Cor 5:11", "1 Corinthians 5:11"],
    ["1cor 5:9-13", "1 Corinthians 5:9–13"],
    ["1 Cor. 5:9–13", "1 Corinthians 5:9–13"],
    ["John 3 verse 16", "John 3:16"],
    ["1 cor 13 vs 4 to 7", "1 Corinthians 13:4–7"],
    ["First Corinthians 13:4", "1 Corinthians 13:4"],
    ["I John 1:9", "1 John 1:9"],
    ["1 John 1.9", "1 John 1:9"],
    ["john 3 16", "John 3:16"],
    ["Jn 3:16", "John 3:16"],
    ["John 3v16", "John 3:16"],
    ["Psalm 23", "Psalm 23:1–6"],
    ["ps 23:1", "Psalm 23:1"],
    ["Psalms 119:105", "Psalm 119:105"],
    ["Jude 5", "Jude 1:5"],
    ["Philemon 4", "Philemon 1:4"],
    ["Song of Solomon 2:4", "Song of Solomon 2:4"],
    ["Songs 2:4", "Song of Solomon 2:4"],
    ["Rev 21:4", "Revelation 21:4"],
    ["Revelations 3:20", "Revelation 3:20"],
    ["phil 4:13", "Philippians 4:13"],
    ["phlm 6", "Philemon 1:6"],
    ["habak 2:4", "Habakkuk 2:4"],
    ["2 thess 3:3", "2 Thessalonians 3:3"],
    ["Romans 8:28 - 28", "Romans 8:28"],
    ["  gen   1 : 1  ", "Genesis 1:1"],
  ])("%s → %s", (input, expected) => expect(p(input)).toBe(expected));

  it.each([
    "John 22:1", // John has 21 chapters
    "John 3:37", // John 3 has 36 verses
    "Jude 1:40",
    "1 Cor 5:11-15", // 1 Corinthians 5 has only 13 verses
    "Romans 8:30-20", // backwards range
    "Hezekiah 1:1", // not a book
    "John",
    "",
  ])("rejects %s", (input) => expect(p(input)).toBe("ERR"));

  it("explains why a reference is invalid", () => {
    const r = parseTypedReference("John 22:1");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/21 chapters/);
  });
});

describe("findBook", () => {
  it("does not guess when a prefix is ambiguous", () => {
    expect(findBook("jo")).toBeNull(); // Joshua, Job, Joel, John, Jonah…
    expect(findBook("phi")).toBeNull(); // Philippians or Philemon
  });
});
