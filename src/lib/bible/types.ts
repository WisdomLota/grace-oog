import type { BookId } from "./books";

/** A reference to a chapter, a verse, or a range of verses inside one chapter. */
export type Reference = {
  book: BookId;
  chapter: number;
  verseStart: number;
  /** Last verse of a range (inclusive). Missing for a single verse. */
  verseEnd?: number;
};

/** The single normalised verse schema every data source produces. */
export type Verse = {
  version: string;
  book: BookId;
  chapter: number;
  verse: number;
  text: string;
};

/** Describes a Bible version shown in the version switcher. */
export type VersionInfo = {
  /** Stable key, e.g. "KJV". */
  id: string;
  /** Short label shown on buttons and on the output screen, e.g. "KJV". */
  label: string;
  /** Full name, e.g. "King James Version". */
  name: string;
  year?: number;
  license?: string;
};

/** On-disk format of public/bibles/<id>.json, written by scripts/build-bibles.mjs. */
export type BibleFile = VersionInfo & {
  version: string;
  /** books[BOOK][chapter - 1][verse - 1] = verse text ("" if this version omits the verse). */
  books: Partial<Record<BookId, string[][]>>;
};
