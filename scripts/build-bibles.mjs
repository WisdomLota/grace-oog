#!/usr/bin/env node
/**
 * Downloads the public-domain Bible versions and normalises them into the
 * app's on-disk format.
 *
 *   npm run bibles            # download (if missing) + normalise
 *
 * Sources (all public domain):
 *   KJV, ASV, YLT, Darby, BBE  ← github.com/scrollmapper/bible_databases (formats/json)
 *   WEB                        ← api.getbible.net/v2/web.json (scrollmapper has no WEB)
 *
 * Output:
 *   public/bibles/<id>.json    one file per version (see BibleFile in src/lib/bible/types.ts)
 *   src/lib/bible/structure.ts verse counts per chapter (from KJV), used to
 *                              validate references so impossible ones are rejected.
 *
 * Every verse is conceptually a record {version, book, chapter, verse, text}.
 * On disk we store it compactly as books[BOOK][chapter-1][verse-1] = text,
 * which is ~3x smaller than a flat array of records.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawDir = path.join(root, "data/raw");
const outDir = path.join(root, "public/bibles");

/** USFM book codes in canonical (Protestant, 66-book) order. Same order as both sources. */
const BOOK_IDS = [
  "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA",
  "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO",
  "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO",
  "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL",
  "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH",
  "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS",
  "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV",
];

const SCROLLMAPPER = "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json";

/** id → where to get it + how to clean its text. */
const VERSIONS = [
  { id: "KJV", name: "King James Version", year: 1769, file: "KJV.json", url: `${SCROLLMAPPER}/KJV.json` },
  { id: "WEB", name: "World English Bible", year: 2000, file: "web.json", url: "https://api.getbible.net/v2/web.json" },
  { id: "ASV", name: "American Standard Version", year: 1901, file: "ASV.json", url: `${SCROLLMAPPER}/ASV.json` },
  { id: "YLT", name: "Young's Literal Translation", year: 1898, file: "YLT.json", url: `${SCROLLMAPPER}/YLT.json` },
  { id: "DARBY", label: "Darby", name: "Darby Translation", year: 1890, file: "Darby.json", url: `${SCROLLMAPPER}/Darby.json` },
  { id: "BBE", name: "Bible in Basic English", year: 1965, file: "BBE.json", url: `${SCROLLMAPPER}/BBE.json` },
];

/** Cleans source quirks so text is ready to project. */
function cleanText(versionId, text) {
  let t = text;
  // WEB: inline footnotes look like "/f + note text /f*". Remove them entirely.
  t = t.replace(/\/f\s*\+.*?\/f\*/g, "");
  // KJV/ASV/Darby: [brackets] mark translator-supplied words; keep the words.
  t = t.replace(/[[\]]/g, "");
  // Darby: the source glued "God" onto the previous word ("ofGod").
  if (versionId === "DARBY") t = t.replace(/([a-z])(God)/g, "$1 $2");
  // YLT: uses a backtick as an opening quote.
  t = t.replace(/`/g, "‘");
  // KJV: en-dash inside names ("Beth–el") is really a hyphen.
  t = t.replace(/(\w)–(\w)/g, "$1-$2");
  return t.replace(/\s+/g, " ").trim();
}

async function ensureDownloaded(v) {
  const p = path.join(rawDir, v.file);
  if (fs.existsSync(p)) return p;
  console.log(`Downloading ${v.id} from ${v.url}`);
  const res = await fetch(v.url);
  if (!res.ok) throw new Error(`Failed to download ${v.id}: HTTP ${res.status}`);
  fs.mkdirSync(rawDir, { recursive: true });
  fs.writeFileSync(p, await res.text());
  return p;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = [];
  let structure = null;

  for (const v of VERSIONS) {
    const raw = JSON.parse(fs.readFileSync(await ensureDownloaded(v), "utf8"));
    if (raw.books.length !== 66) throw new Error(`${v.id}: expected 66 books, got ${raw.books.length}`);

    const books = {};
    let count = 0;
    raw.books.forEach((book, i) => {
      const chapters = [];
      for (const ch of book.chapters) {
        const verses = [];
        for (const vs of ch.verses) {
          // Missing verses (some versions omit a few) stay as "" so indexes line up.
          verses[vs.verse - 1] = cleanText(v.id, vs.text);
          count++;
        }
        chapters[ch.chapter - 1] = Array.from(verses, (x) => x ?? "");
      }
      books[BOOK_IDS[i]] = chapters;
    });

    const file = { version: v.id, label: v.label ?? v.id, name: v.name, year: v.year, license: "Public Domain", books };
    fs.writeFileSync(path.join(outDir, `${v.id}.json`), JSON.stringify(file));
    manifest.push({ id: v.id, label: file.label, name: v.name, year: v.year, license: file.license });
    console.log(`${v.id}: ${count} verses`);

    if (v.id === "KJV") structure = Object.fromEntries(Object.entries(books).map(([id, chs]) => [id, chs.map((c) => c.length)]));
  }

  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  const ts = `// GENERATED by scripts/build-bibles.mjs — do not edit by hand.
// Number of verses in each chapter (KJV versification), indexed [book][chapter-1].
// Used to reject references that don't exist (e.g. "John 22" or "Jude 1:40").
import type { BookId } from "./books";

export const VERSE_COUNTS: Record<BookId, readonly number[]> = ${JSON.stringify(structure)};
`;
  fs.writeFileSync(path.join(root, "src/lib/bible/structure.ts"), ts);
  console.log("Wrote public/bibles/*.json and src/lib/bible/structure.ts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
