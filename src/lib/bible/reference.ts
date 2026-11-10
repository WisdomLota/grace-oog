/**
 * Helpers for working with references: validation against the real Bible
 * structure and formatting for display.
 */
import { displayBookName, getBook, type BookId } from "./books";
import { VERSE_COUNTS } from "./structure";
import type { Reference } from "./types";

export function chapterCount(book: BookId): number {
  return VERSE_COUNTS[book].length;
}

/** Number of verses in a chapter, or 0 if the chapter doesn't exist. */
export function verseCount(book: BookId, chapter: number): number {
  return VERSE_COUNTS[book][chapter - 1] ?? 0;
}

/**
 * Checks that a reference really exists. Returns null if it's fine, or a
 * plain-English reason the operator can understand.
 */
export function validateReference(ref: Reference): string | null {
  const name = getBook(ref.book).name;
  const chapters = chapterCount(ref.book);
  if (!Number.isInteger(ref.chapter) || ref.chapter < 1 || ref.chapter > chapters) {
    return `${name} has ${chapters} chapter${chapters === 1 ? "" : "s"}, so there is no chapter ${ref.chapter}.`;
  }
  const verses = verseCount(ref.book, ref.chapter);
  const chName = `${displayBookName(ref.book)} ${ref.chapter}`;
  if (!Number.isInteger(ref.verseStart) || ref.verseStart < 1 || ref.verseStart > verses) {
    return `${chName} has ${verses} verses, so there is no verse ${ref.verseStart}.`;
  }
  if (ref.verseEnd !== undefined) {
    if (ref.verseEnd < ref.verseStart) return `The range ends (${ref.verseEnd}) before it starts (${ref.verseStart}).`;
    if (ref.verseEnd > verses) return `${chName} has ${verses} verses, so there is no verse ${ref.verseEnd}.`;
  }
  return null;
}

/** Every verse number covered by the reference, in order. */
export function versesInReference(ref: Reference): number[] {
  const end = ref.verseEnd ?? ref.verseStart;
  return Array.from({ length: end - ref.verseStart + 1 }, (_, i) => ref.verseStart + i);
}

/** "1 Corinthians 5:11" or "1 Corinthians 5:11–15". */
export function formatReference(ref: Reference): string {
  const base = `${displayBookName(ref.book)} ${ref.chapter}:${ref.verseStart}`;
  return ref.verseEnd !== undefined && ref.verseEnd !== ref.verseStart ? `${base}–${ref.verseEnd}` : base;
}

/** Same reference? (Used to de-duplicate history.) */
export function sameReference(a: Reference, b: Reference): boolean {
  return a.book === b.book && a.chapter === b.chapter && a.verseStart === b.verseStart && (a.verseEnd ?? a.verseStart) === (b.verseEnd ?? b.verseStart);
}
