/**
 * Parses references typed into the manual search box, e.g.
 *   "1 Cor 5:11"   "1cor 5:11-15"   "John 3 16"   "Psalm 23"   "Jude 5"   "I John 1.9"
 *
 * (Spoken references like "John three sixteen" are handled by the separate
 * speech parser; this one is for the keyboard.)
 */
import { BOOKS, type BookId } from "./books";
import { chapterCount, validateReference, verseCount } from "./reference";
import type { Reference } from "./types";

export type ParseResult = { ok: true; ref: Reference } | { ok: false; error: string };

/** Turns "First", "1st", "I", "One" etc. at the start of a book name into 1/2/3. */
function normaliseOrdinal(s: string): string {
  return s
    .replace(/^(first|1st|one|i)\s+/, "1 ")
    .replace(/^(second|2nd|two|ii)\s+/, "2 ")
    .replace(/^(third|3rd|three|iii)\s+/, "3 ");
}

/** Lower-case and squash spaces so "1 Cor" and "1cor" compare equal. */
function bookKey(s: string): string {
  return normaliseOrdinal(s.toLowerCase().replace(/\./g, " ").replace(/\s+/g, " ").trim()).replace(/\s+/g, "");
}

const exactLookup = new Map<string, BookId>();
for (const b of BOOKS) {
  exactLookup.set(bookKey(b.name), b.id);
  if ("singular" in b) exactLookup.set(bookKey(b.singular), b.id);
  for (const a of b.aliases) exactLookup.set(bookKey(a), b.id);
}
const nameKeys = BOOKS.map((b) => ({ id: b.id as BookId, key: bookKey(b.name) }));

/** Finds a book from typed text: exact name/abbreviation first, then a unique prefix ("1 corin", "habak"). */
export function findBook(text: string): BookId | null {
  const key = bookKey(text);
  if (!key) return null;
  const exact = exactLookup.get(key);
  if (exact) return exact;
  if (key.length < 3) return null;
  const matches = nameKeys.filter((n) => n.key.startsWith(key));
  return matches.length === 1 ? matches[0].id : null;
}

// book (must end in a letter) · chapter · optional [sep verse [- verse]]
const PATTERN = /^(.*?[a-z])\s*(\d+)(?:\s*(?::|\.|\s|v|vs|verses?)\s*(\d+)(?:\s*(?:-|to|through)\s*(\d+))?)?$/;

export function parseTypedReference(input: string): ParseResult {
  const text = input
    .toLowerCase()
    .replace(/[–—]/g, "-") // en/em dashes
    .replace(/([a-z])\./g, "$1 ") // abbreviation dots: "Cor." → "Cor"
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return { ok: false, error: "Type a reference, e.g. John 3:16" };

  const m = PATTERN.exec(text);
  if (!m) return { ok: false, error: "Type a book and chapter, e.g. John 3:16 or Psalm 23" };

  const [, bookText, chStr, vStartStr, vEndStr] = m;
  const book = findBook(bookText);
  if (!book) return { ok: false, error: `Didn't recognise the book "${bookText.trim()}"` };

  let chapter = Number(chStr);
  let verseStart = vStartStr ? Number(vStartStr) : undefined;
  const verseEnd = vEndStr ? Number(vEndStr) : undefined;

  // One-chapter books: "Jude 5" means Jude 1:5.
  if (verseStart === undefined && chapterCount(book) === 1 && chapter > 1) {
    verseStart = chapter;
    chapter = 1;
  }

  let ref: Reference;
  if (verseStart === undefined) {
    // Whole chapter, e.g. "Psalm 23" → every verse in the chapter.
    const n = verseCount(book, chapter);
    if (!n) return { ok: false, error: validateReference({ book, chapter, verseStart: 1 })! };
    ref = { book, chapter, verseStart: 1, verseEnd: n };
  } else {
    ref = { book, chapter, verseStart };
    if (verseEnd !== undefined && verseEnd !== verseStart) ref.verseEnd = verseEnd;
  }

  const problem = validateReference(ref);
  if (problem) return { ok: false, error: problem };
  if (ref.verseEnd === ref.verseStart) delete ref.verseEnd;
  return { ok: true, ref };
}
