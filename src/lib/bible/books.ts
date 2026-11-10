/**
 * The 66 books of the Bible.
 *
 * `id` is the standard USFM code (also used by API.Bible), so data from any
 * source can be keyed the same way.
 * `aliases` are the common written abbreviations used by the manual search box.
 * (The speech parser adds spoken variants on top of these.)
 */

export const BOOKS = [
  { id: "GEN", name: "Genesis", aliases: ["gen", "ge", "gn"] },
  { id: "EXO", name: "Exodus", aliases: ["exo", "ex", "exod"] },
  { id: "LEV", name: "Leviticus", aliases: ["lev", "le", "lv"] },
  { id: "NUM", name: "Numbers", aliases: ["num", "nu", "nm", "nb"] },
  { id: "DEU", name: "Deuteronomy", aliases: ["deut", "deu", "dt", "de"] },
  { id: "JOS", name: "Joshua", aliases: ["josh", "jos", "jsh"] },
  { id: "JDG", name: "Judges", aliases: ["judg", "jdg", "jg", "jdgs"] },
  { id: "RUT", name: "Ruth", aliases: ["ruth", "rut", "ru", "rth"] },
  { id: "1SA", name: "1 Samuel", aliases: ["1sam", "1sa", "1sm", "1s"] },
  { id: "2SA", name: "2 Samuel", aliases: ["2sam", "2sa", "2sm", "2s"] },
  { id: "1KI", name: "1 Kings", aliases: ["1kgs", "1ki", "1kin", "1k"] },
  { id: "2KI", name: "2 Kings", aliases: ["2kgs", "2ki", "2kin", "2k"] },
  { id: "1CH", name: "1 Chronicles", aliases: ["1chr", "1ch", "1chron"] },
  { id: "2CH", name: "2 Chronicles", aliases: ["2chr", "2ch", "2chron"] },
  { id: "EZR", name: "Ezra", aliases: ["ezra", "ezr", "ez"] },
  { id: "NEH", name: "Nehemiah", aliases: ["neh", "ne"] },
  { id: "EST", name: "Esther", aliases: ["esth", "est", "es"] },
  { id: "JOB", name: "Job", aliases: ["job", "jb"] },
  { id: "PSA", name: "Psalms", singular: "Psalm", aliases: ["ps", "psa", "psalm", "pss", "psm", "pslm"] },
  { id: "PRO", name: "Proverbs", aliases: ["prov", "pro", "prv", "pr"] },
  { id: "ECC", name: "Ecclesiastes", aliases: ["eccl", "ecc", "ec", "qoh"] },
  { id: "SNG", name: "Song of Solomon", aliases: ["song", "sos", "sng", "songofsongs", "songs", "canticles", "ss"] },
  { id: "ISA", name: "Isaiah", aliases: ["isa", "is"] },
  { id: "JER", name: "Jeremiah", aliases: ["jer", "je", "jr"] },
  { id: "LAM", name: "Lamentations", aliases: ["lam", "la"] },
  { id: "EZK", name: "Ezekiel", aliases: ["ezek", "eze", "ezk"] },
  { id: "DAN", name: "Daniel", aliases: ["dan", "da", "dn"] },
  { id: "HOS", name: "Hosea", aliases: ["hos", "ho"] },
  { id: "JOL", name: "Joel", aliases: ["joel", "jl", "joe"] },
  { id: "AMO", name: "Amos", aliases: ["amos", "am", "amo"] },
  { id: "OBA", name: "Obadiah", aliases: ["obad", "ob", "oba"] },
  { id: "JON", name: "Jonah", aliases: ["jonah", "jon", "jnh"] },
  { id: "MIC", name: "Micah", aliases: ["mic", "mc"] },
  { id: "NAM", name: "Nahum", aliases: ["nah", "na", "nam"] },
  { id: "HAB", name: "Habakkuk", aliases: ["hab", "hb"] },
  { id: "ZEP", name: "Zephaniah", aliases: ["zeph", "zep", "zp"] },
  { id: "HAG", name: "Haggai", aliases: ["hag", "hg"] },
  { id: "ZEC", name: "Zechariah", aliases: ["zech", "zec", "zc"] },
  { id: "MAL", name: "Malachi", aliases: ["mal", "ml"] },
  { id: "MAT", name: "Matthew", aliases: ["matt", "mat", "mt"] },
  { id: "MRK", name: "Mark", aliases: ["mark", "mrk", "mk", "mr"] },
  { id: "LUK", name: "Luke", aliases: ["luke", "luk", "lk"] },
  { id: "JHN", name: "John", aliases: ["john", "jhn", "jn", "joh"] },
  { id: "ACT", name: "Acts", aliases: ["acts", "act", "ac"] },
  { id: "ROM", name: "Romans", aliases: ["rom", "ro", "rm"] },
  { id: "1CO", name: "1 Corinthians", aliases: ["1cor", "1co"] },
  { id: "2CO", name: "2 Corinthians", aliases: ["2cor", "2co"] },
  { id: "GAL", name: "Galatians", aliases: ["gal", "ga"] },
  { id: "EPH", name: "Ephesians", aliases: ["eph", "ephes"] },
  { id: "PHP", name: "Philippians", aliases: ["phil", "php", "pp"] },
  { id: "COL", name: "Colossians", aliases: ["col", "co"] },
  { id: "1TH", name: "1 Thessalonians", aliases: ["1thess", "1th", "1thes"] },
  { id: "2TH", name: "2 Thessalonians", aliases: ["2thess", "2th", "2thes"] },
  { id: "1TI", name: "1 Timothy", aliases: ["1tim", "1ti"] },
  { id: "2TI", name: "2 Timothy", aliases: ["2tim", "2ti"] },
  { id: "TIT", name: "Titus", aliases: ["titus", "tit", "ti"] },
  { id: "PHM", name: "Philemon", aliases: ["philem", "phm", "phlm", "phile"] },
  { id: "HEB", name: "Hebrews", aliases: ["heb"] },
  { id: "JAS", name: "James", aliases: ["jas", "jm", "jam"] },
  { id: "1PE", name: "1 Peter", aliases: ["1pet", "1pe", "1pt", "1p"] },
  { id: "2PE", name: "2 Peter", aliases: ["2pet", "2pe", "2pt", "2p"] },
  { id: "1JN", name: "1 John", aliases: ["1john", "1jn", "1jo", "1j"] },
  { id: "2JN", name: "2 John", aliases: ["2john", "2jn", "2jo", "2j"] },
  { id: "3JN", name: "3 John", aliases: ["3john", "3jn", "3jo", "3j"] },
  { id: "JUD", name: "Jude", aliases: ["jude", "jud", "jd"] },
  { id: "REV", name: "Revelation", aliases: ["rev", "re", "revelations", "apocalypse"] },
] as const satisfies readonly { id: string; name: string; singular?: string; aliases: readonly string[] }[];

export type BookId = (typeof BOOKS)[number]["id"];
export type Book = { id: BookId; name: string; singular?: string; aliases: readonly string[] };

const byId = new Map<string, Book>(BOOKS.map((b) => [b.id, b]));

export function getBook(id: BookId): Book {
  return byId.get(id)!;
}

export function isBookId(id: string): id is BookId {
  return byId.has(id);
}

/** Name used when showing a single chapter/verse, e.g. "Psalm 23:1" rather than "Psalms 23:1". */
export function displayBookName(id: BookId): string {
  const b = getBook(id);
  return b.singular ?? b.name;
}
