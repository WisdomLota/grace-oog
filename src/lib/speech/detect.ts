/**
 * Finds Bible references in spoken text (what speech recognition hears).
 *
 *   "turn with me to first Corinthians chapter thirteen verse four"
 *     → 1 Corinthians 13:4 (high confidence)
 *   "John three sixteen"           → John 3:16
 *   "verses eleven to fifteen"     → a range
 *   "Mark four"                    → Mark 4 (chapter only → low confidence)
 *
 * Every detection is validated against the real Bible structure; references
 * that don't exist are dropped. Each one gets a confidence:
 *   - "high": safe to auto-display (after the 2-second cancel preview)
 *   - "low":  shown in the Detected queue for the operator to confirm
 * A wrong verse on screen is worse than a delay, so when in doubt it's "low".
 */
import { getBook, type BookId } from "../bible/books";
import { chapterCount, validateReference, verseCount } from "../bible/reference";
import type { Reference } from "../bible/types";
import { wordsToDigits } from "./numbers";
import { ORDINALS, SPOKEN_BOOKS } from "./spokenBooks";

export type Confidence = "high" | "low";

export type Detection = {
  ref: Reference;
  confidence: Confidence;
  /** Why it is low confidence (empty for high). Shown to the operator. */
  reasons: string[];
  /** The words that were recognised as this reference. */
  text: string;
};

// ---------------------------------------------------------------------------
// Tokenising
// ---------------------------------------------------------------------------

/** Lower-cases, splits into words, keeps ":" and "-" as their own tokens, and turns number words into digits. */
export function tokenize(text: string): string[] {
  const cleaned = text
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[’']/g, "") // let's → lets, habakkuk's → habakkuks
    .replace(/\b(\d+)(st|nd|rd|th)\b/g, "$1") // 1st → 1
    .replace(/[:\-]/g, " $& ")
    .replace(/[^a-z0-9:\- ]+/g, " ");
  return wordsToDigits(cleaned.split(/\s+/).filter(Boolean));
}

const isNum = (t: string | undefined): t is string => t !== undefined && /^\d+$/.test(t);

// ---------------------------------------------------------------------------
// Book matching
// ---------------------------------------------------------------------------

type BookEntry = { words: string[]; id?: BookId; numbered?: BookId[]; everyday: boolean };

const ENTRIES: BookEntry[] = SPOKEN_BOOKS.flatMap((b) =>
  b.names.map((n) => ({ words: tokenize(n), id: b.id, numbered: b.numbered, everyday: !!b.everyday })),
);

type BookMatch = { book: BookId; start: number; end: number; everyday: boolean; fuzzy: boolean };

/** Exact book match whose name starts at token i (a number prefix may sit at i-1). Longest wins. */
function matchBookAt(tokens: string[], i: number): BookMatch | null {
  let best: BookMatch | null = null;
  for (const e of ENTRIES) {
    if (!e.words.every((w, k) => tokens[i + k] === w)) continue;
    const end = i + e.words.length;
    let m: BookMatch | null = null;
    if (e.numbered) {
      const n = ORDINALS[tokens[i - 1]];
      if (n && n <= e.numbered.length) m = { book: e.numbered[n - 1], start: i - 1, end, everyday: false, fuzzy: false };
    } else if (e.id) {
      m = { book: e.id, start: i, end, everyday: e.everyday, fuzzy: false };
    }
    if (m && (!best || m.end - m.start > best.end - best.start)) best = m;
  }
  return best;
}

/** Levenshtein edit distance (small strings only). */
function distance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

const FUZZY_ENTRIES = ENTRIES.filter((e) => e.words.length === 1 && !e.everyday && e.words[0].length >= 5);

/**
 * Misheard book name, e.g. "corinthans", "habbakuk". Only tried for longer
 * words directly followed by a number, and always gives low confidence.
 */
function fuzzyBookAt(tokens: string[], i: number): BookMatch | null {
  const word = tokens[i];
  if (word.length < 5 || !/^[a-z]+$/.test(word) || !(isNum(tokens[i + 1]) || tokens[i + 1] === "chapter")) return null;
  const maxDist = word.length >= 8 ? 2 : 1;
  const found = new Map<BookId, BookMatch>();
  for (const e of FUZZY_ENTRIES) {
    if (distance(word, e.words[0]) > maxDist) continue;
    if (e.numbered) {
      const n = ORDINALS[tokens[i - 1]];
      if (n && n <= e.numbered.length) found.set(e.numbered[n - 1], { book: e.numbered[n - 1], start: i - 1, end: i + 1, everyday: false, fuzzy: true });
    } else if (e.id) found.set(e.id, { book: e.id, start: i, end: i + 1, everyday: false, fuzzy: true });
  }
  return found.size === 1 ? [...found.values()][0] : null; // ambiguous → don't guess
}

// ---------------------------------------------------------------------------
// Numbers after the book
// ---------------------------------------------------------------------------

const VERSE_WORDS = new Set(["verse", "verses", "vs", "v", "vers", "versus"]);
const RANGE_WORDS = new Set(["-", "to", "through", "thru", "till", "until", "unto"]);

type Numbers = { chapter: number; verse?: number; verseEnd?: number; end: number; keyword: boolean; colon: boolean };

function readNumbers(tokens: string[], j: number, oneChapter: boolean): Numbers | null {
  let k = j;
  let keyword = false;
  let colon = false;
  // One-chapter books: "Jude verse three" has no chapter number.
  if (oneChapter && tokens[k] !== undefined && VERSE_WORDS.has(tokens[k]) && isNum(tokens[k + 1])) {
    return { chapter: 1, verse: Number(tokens[k + 1]), end: k + 2, keyword: true, colon: false };
  }
  if (tokens[k] === "chapter") {
    k++;
    keyword = true;
  }
  if (!isNum(tokens[k])) return null;
  const chapter = Number(tokens[k++]);
  let verse: number | undefined;

  if (tokens[k] === ":" && isNum(tokens[k + 1])) {
    verse = Number(tokens[k + 1]);
    k += 2;
    colon = true;
  } else if (tokens[k] !== undefined && VERSE_WORDS.has(tokens[k]) && isNum(tokens[k + 1])) {
    verse = Number(tokens[k + 1]);
    k += 2;
    keyword = true;
  } else if (isNum(tokens[k])) {
    verse = Number(tokens[k++]); // "john 3 16"
  }

  let verseEnd: number | undefined;
  if (verse !== undefined) {
    let r = k;
    const word = tokens[r];
    if (word !== undefined && (RANGE_WORDS.has(word) || word === "and")) {
      r++;
      if (tokens[r] !== undefined && VERSE_WORDS.has(tokens[r])) r++;
      if (isNum(tokens[r])) {
        const n = Number(tokens[r]);
        // "verses 3 and 4" is a range; "3 and 9" is probably not.
        if (word !== "and" || n === verse + 1) {
          verseEnd = n;
          k = r + 1;
        }
      }
    }
  }
  return { chapter, verse, verseEnd, end: k, keyword, colon };
}

/** "316" heard instead of "3 16": every valid chapter/verse split of the digits. */
function splitGlued(book: BookId, digits: string): Reference[] {
  const out: Reference[] = [];
  for (let a = 1; a < digits.length; a++) {
    const ch = digits.slice(0, a);
    const vs = digits.slice(a);
    if (vs.startsWith("0")) continue;
    const ref = { book, chapter: Number(ch), verseStart: Number(vs) };
    if (!validateReference(ref)) out.push(ref);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Cue phrases: "turn to", "open your Bible to", "let's read", …
// ---------------------------------------------------------------------------

const CUE = /\b(turn (with me |over )?to|open (your |our |the )?(bibles? |bible )?(with me )?to|lets (read|look at|go to)|look at|book of|reading (from|in)|read (from|in)|says in|go (with me )?to|found in|according to)( the book of| the)?$/;

function hasCue(tokens: string[], start: number): boolean {
  return CUE.test(tokens.slice(Math.max(0, start - 8), start).join(" "));
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function detectReferences(text: string): Detection[] {
  const tokens = tokenize(text);
  const found: Detection[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const book = matchBookAt(tokens, i) ?? fuzzyBookAt(tokens, i);
    if (!book) continue;
    const nums = readNumbers(tokens, book.end, chapterCount(book.book) === 1);
    if (!nums) continue;

    const reasons: string[] = [];
    if (book.fuzzy) reasons.push(`Book name sounded like ${getBook(book.book).name}`);
    if (book.everyday && !(hasCue(tokens, book.start) || nums.keyword || nums.colon)) {
      reasons.push(`"${tokens.slice(book.start, book.end).join(" ")}" is also an everyday word`);
    }

    let ref: Reference | null = null;
    if (nums.verse === undefined) {
      if (chapterCount(book.book) === 1 && nums.chapter > 1 && nums.chapter <= verseCount(book.book, 1)) {
        // One-chapter book: "Jude five" = Jude 1:5.
        ref = { book: book.book, chapter: 1, verseStart: nums.chapter };
      } else if (verseCount(book.book, nums.chapter) > 0) {
        ref = { book: book.book, chapter: nums.chapter, verseStart: 1, verseEnd: verseCount(book.book, nums.chapter) };
        reasons.push("Only a chapter was heard");
      } else {
        const splits = splitGlued(book.book, String(nums.chapter));
        if (splits.length === 1) {
          ref = splits[0];
          reasons.push("The numbers ran together");
        }
      }
    } else {
      ref = { book: book.book, chapter: nums.chapter, verseStart: nums.verse };
      if (nums.verseEnd !== undefined && nums.verseEnd !== nums.verse) {
        const ranged = { ...ref, verseEnd: nums.verseEnd };
        if (!validateReference(ranged)) ref = ranged;
        else reasons.push("The end of the range doesn't exist");
      }
      if (validateReference(ref)) ref = null; // chapter/verse doesn't exist → not a reference
    }

    if (!ref) continue;
    found.push({
      ref,
      confidence: reasons.length ? "low" : "high",
      reasons,
      text: tokens.slice(book.start, nums.end).join(" "),
    });
    i = nums.end - 1;
  }
  return found;
}
