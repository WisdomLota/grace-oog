import { describe, expect, it } from "vitest";
import { formatReference } from "../bible/reference";
import { detectReferences, tokenize } from "./detect";
import { wordsToDigits } from "./numbers";

/** First detection as "Book C:V[–E] (high|low)", or "none". */
function first(text: string): string {
  const d = detectReferences(text)[0];
  return d ? `${formatReference(d.ref)} (${d.confidence})` : "none";
}

describe("wordsToDigits", () => {
  it.each([
    ["three sixteen", "3 16"],
    ["twenty three", "23"],
    ["one hundred and nineteen", "119"],
    ["a hundred and five", "105"],
    ["one hundred", "100"],
    ["hundred and fifty", "150"],
    ["forty two", "42"],
    ["chapter thirteen verse four", "chapter 13 verse 4"],
    ["a man", "a man"],
  ])("%s → %s", (input, out) => expect(wordsToDigits(input.split(" ")).join(" ")).toBe(out));
});

describe("detectReferences — spoken examples (high confidence)", () => {
  it.each([
    // Plain "book chapter verse" in words
    ["John three sixteen", "John 3:16"],
    ["john 3 16", "John 3:16"],
    ["John 3:16", "John 3:16"],
    ["Romans eight twenty eight", "Romans 8:28"],
    ["Genesis one one", "Genesis 1:1"],
    ["Psalm twenty three verse one", "Psalm 23:1"],
    ["psalms one hundred and nineteen verse one hundred and five", "Psalm 119:105"],
    ["Psalm 119 105", "Psalm 119:105"],
    ["Jeremiah twenty nine eleven", "Jeremiah 29:11"],
    ["Isaiah fifty three five", "Isaiah 53:5"],
    ["Proverbs three five", "Proverbs 3:5"],
    ["Hebrews eleven one", "Hebrews 11:1"],
    ["Ephesians two eight", "Ephesians 2:8"],
    ["Revelation twenty one four", "Revelation 21:4"],
    ["revelations three twenty", "Revelation 3:20"],
    ["Matthew six thirty three", "Matthew 6:33"],
    ["Luke fifteen eleven", "Luke 15:11"],
    ["Daniel three seventeen", "Daniel 3:17"],
    ["Habakkuk two four", "Habakkuk 2:4"],
    ["habakuk two three", "Habakkuk 2:3"],
    ["Zechariah four six", "Zechariah 4:6"],
    ["Malachi three ten", "Malachi 3:10"],
    ["Deuteronomy thirty one six", "Deuteronomy 31:6"],

    // Numbered books
    ["First Corinthians thirteen four", "1 Corinthians 13:4"],
    ["1st Corinthians 13 4", "1 Corinthians 13:4"],
    ["one Corinthians thirteen four", "1 Corinthians 13:4"],
    ["second Corinthians five seventeen", "2 Corinthians 5:17"],
    ["two Timothy one seven", "2 Timothy 1:7"],
    ["first Thessalonians five seventeen", "1 Thessalonians 5:17"],
    ["second thessalonian three three", "2 Thessalonians 3:3"],
    ["first John one nine", "1 John 1:9"],
    ["third John one two", "3 John 1:2"],
    ["First Peter two nine", "1 Peter 2:9"],
    ["second Kings two nine", "2 Kings 2:9"],
    ["first Samuel seventeen forty five", "1 Samuel 17:45"],
    ["second Chronicles seven fourteen", "2 Chronicles 7:14"],
    ["II Corinthians 12 9", "2 Corinthians 12:9"],

    // Explicit chapter / verse words
    ["first Corinthians chapter thirteen verse four", "1 Corinthians 13:4"],
    ["Joshua chapter one verse nine", "Joshua 1:9"],
    ["Isaiah chapter forty verse thirty one", "Isaiah 40:31"],

    // Ranges
    ["first Corinthians thirteen verses four to seven", "1 Corinthians 13:4–7"],
    ["Romans twelve verses one through two", "Romans 12:1–2"],
    ["Matthew five three to twelve", "Matthew 5:3–12"],
    ["Galatians five twenty two through twenty three", "Galatians 5:22–23"],
    ["John fourteen verses one and two", "John 14:1–2"],
    ["Psalm 23 1-6", "Psalm 23:1–6"],
    ["first Corinthians chapter thirteen verses eleven to thirteen", "1 Corinthians 13:11–13"],

    // Cue phrases
    ["turn with me to the book of Hebrews chapter twelve verse two", "Hebrews 12:2"],
    ["open your Bible to Ephesians six ten", "Ephesians 6:10"],
    ["let's read Philippians four thirteen", "Philippians 4:13"],
    ["look at Colossians three twenty three", "Colossians 3:23"],
    ["in the book of Micah six eight", "Micah 6:8"],
    ["turn to Acts two thirty eight", "Acts 2:38"],
    ["let's go to Mark eleven twenty three", "Mark 11:23"],
    ["turn to Numbers six twenty four", "Numbers 6:24"],
    ["the Bible says in Job nineteen twenty five", "Job 19:25"],

    // Speech-recognition quirks
    ["Philippines four six", "Philippians 4:6"],
    ["first Thesalonians five sixteen", "1 Thessalonians 5:16"],
    ["Song of Solomon two four", "Song of Solomon 2:4"],
    ["song of songs eight seven", "Song of Solomon 8:7"],
    ["Acts of the Apostles one eight", "Acts 1:8"],
    ["Jude twenty four", "Jude 1:24"],
    ["Jude verse three", "Jude 1:3"],
    ["Acts 2:38", "Acts 2:38"], // colon = clearly a reference
    ["mark chapter four verse thirty nine", "Mark 4:39"],
    ["so the pastor said, John 3 16, God so loved", "John 3:16"],
  ])("%s → %s", (text, expected) => expect(first(text)).toBe(`${expected} (high)`));
});

describe("detectReferences — low confidence (goes to queue)", () => {
  it.each([
    ["Psalm twenty three", "Psalm 23:1–6"], // chapter only
    ["Mark four thirty nine", "Mark 4:39"], // everyday word, no cue
    ["acts two thirty eight", "Acts 2:38"],
    ["John 316", "John 3:16"], // numbers ran together
    ["first korintians thirteen four", "1 Corinthians 13:4"], // misheard book
    ["habakkok two two", "Habakkuk 2:2"], // misheard book
  ])("%s → %s (low)", (text, expected) => expect(first(text)).toBe(`${expected} (low)`));

  it("explains why", () => {
    const [d] = detectReferences("Mark four thirty nine");
    expect(d.reasons.join(" ")).toMatch(/everyday word/);
  });
});

describe("detectReferences — rejects things that aren't real references", () => {
  it.each([
    "John twenty two one", // John has 21 chapters
    "John three thirty seven", // John 3 has 36 verses
    "Jude one forty",
    "I have two kids and three dogs",
    "we sang songs for an hour",
    "make your mark on the world",
    "it was a great job",
    "Corinthians thirteen four", // which Corinthians? don't guess
    "Hello everyone, welcome to church",
    "",
  ])("%s → none", (text) => expect(first(text)).toBe("none"));

  it("drops an impossible range end but keeps the verse (low)", () => {
    expect(first("Romans eight twenty eight to forty five")).toBe("Romans 8:28 (low)");
  });
});

describe("detectReferences — multiple references", () => {
  it("finds every reference in a sentence", () => {
    const refs = detectReferences("compare John three sixteen with Romans five eight and first John four nine").map((d) => formatReference(d.ref));
    expect(refs).toEqual(["John 3:16", "Romans 5:8", "1 John 4:9"]);
  });
});

describe("tokenize", () => {
  it("handles punctuation, colons, dashes and ordinals", () => {
    expect(tokenize("1st Cor. 13:4–7!")).toEqual(["1", "cor", "13", ":", "4", "-", "7"]);
  });
});
