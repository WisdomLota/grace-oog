/**
 * How book names come out of speech recognition, including common mishearings.
 *
 * - `names`: spoken forms (lower case, words separated by spaces).
 * - `numbered`: books like 1/2 Corinthians are listed by their base name and
 *   need a number before them ("first", "1st", "one", "2", "II").
 * - `everyday`: the name is also an ordinary English word ("acts", "mark",
 *   "numbers"). These only count as confident if the pastor clearly cues a
 *   reference ("turn to Acts…", "chapter", "verse", "3:16"); otherwise they go
 *   to the queue for the operator to confirm.
 */
import type { BookId } from "../bible/books";

export type SpokenBook = {
  names: string[];
  /** Plain book, or [1st, 2nd, 3rd] variants when a number prefix is required. */
  id?: BookId;
  numbered?: BookId[];
  /** Without a number prefix, which book is it? (e.g. "john" alone = Gospel of John) */
  everyday?: boolean;
};

export const SPOKEN_BOOKS: SpokenBook[] = [
  { id: "GEN", names: ["genesis", "genesys", "jenesis"] },
  { id: "EXO", names: ["exodus", "exodos"] },
  { id: "LEV", names: ["leviticus", "leviticas", "levitikus"] },
  { id: "NUM", names: ["numbers"], everyday: true },
  { id: "DEU", names: ["deuteronomy", "deuteronomi", "duteronomy", "deutronomy"] },
  { id: "JOS", names: ["joshua"] },
  { id: "JDG", names: ["judges"], everyday: true },
  { id: "RUT", names: ["ruth"] },
  { numbered: ["1SA", "2SA"], names: ["samuel"] },
  { numbered: ["1KI", "2KI"], names: ["kings"] },
  { numbered: ["1CH", "2CH"], names: ["chronicles", "chronicle"] },
  { id: "EZR", names: ["ezra"] },
  { id: "NEH", names: ["nehemiah", "nehemia"] },
  { id: "EST", names: ["esther", "ester"] },
  { id: "JOB", names: ["job"], everyday: true },
  { id: "PSA", names: ["psalm", "psalms", "psalmist", "salm", "salms", "sams"] },
  { id: "PRO", names: ["proverbs", "proverb"] },
  { id: "ECC", names: ["ecclesiastes", "ecclesiastics", "ecclesiastes's", "ecclesiastis"] },
  { id: "SNG", names: ["song of solomon", "songs of solomon", "song of songs", "songs of songs", "song of solomons"] },
  { id: "SNG", names: ["songs"], everyday: true },
  { id: "ISA", names: ["isaiah", "isiah", "isaiahs", "isaya"] },
  { id: "JER", names: ["jeremiah", "jeremia", "jeremy"] },
  { id: "LAM", names: ["lamentations", "lamentation"], everyday: true },
  { id: "EZK", names: ["ezekiel", "ezekial", "ezekhiel", "ezikiel"] },
  { id: "DAN", names: ["daniel"] },
  { id: "HOS", names: ["hosea", "hosaya", "hoseah"] },
  { id: "JOL", names: ["joel"] },
  { id: "AMO", names: ["amos"] },
  { id: "OBA", names: ["obadiah", "obadaiah", "obadia"] },
  { id: "JON", names: ["jonah", "jona"] },
  { id: "MIC", names: ["micah", "mika", "mica"] },
  { id: "NAM", names: ["nahum", "nahom"] },
  { id: "HAB", names: ["habakkuk", "habakuk", "habbakuk", "habacuc", "habakook", "habbakkuk", "habakkuk's"] },
  { id: "ZEP", names: ["zephaniah", "zephania", "zefaniah"] },
  { id: "HAG", names: ["haggai", "hagai", "haggay"] },
  { id: "ZEC", names: ["zechariah", "zachariah", "zecharia", "zacharia", "zachariah's"] },
  { id: "MAL", names: ["malachi", "malachai", "malaki"] },
  { id: "MAT", names: ["matthew", "mathew", "matthews"] },
  { id: "MRK", names: ["mark", "marks"], everyday: true },
  { id: "LUK", names: ["luke"] },
  { id: "JHN", names: ["john", "jon"] },
  { numbered: ["1JN", "2JN", "3JN"], names: ["john", "jon"] },
  { id: "ACT", names: ["acts of the apostles", "acts of apostles", "the acts"] },
  { id: "ACT", names: ["acts", "act"], everyday: true },
  { id: "ROM", names: ["romans", "roman"] },
  { numbered: ["1CO", "2CO"], names: ["corinthians", "corinthian", "carinthians", "chorinthians", "corinthans", "corinthiens", "korinthians", "corenthians"] },
  { id: "GAL", names: ["galatians", "galatian", "galations", "galatia"] },
  { id: "EPH", names: ["ephesians", "ephesian", "efesians", "ephesions", "ephesus"] },
  { id: "PHP", names: ["philippians", "phillipians", "philipians", "philippines", "phillipines", "philippian"] },
  { id: "COL", names: ["colossians", "colossian", "colosians", "collosians", "colossae"] },
  { numbered: ["1TH", "2TH"], names: ["thessalonians", "thessalonian", "thesalonians", "thessalonica", "thessalonions", "tesalonians"] },
  { numbered: ["1TI", "2TI"], names: ["timothy", "timoty"] },
  { id: "TIT", names: ["titus", "tidus"] },
  { id: "PHM", names: ["philemon", "philemons", "filemon"] },
  { id: "HEB", names: ["hebrews", "hebrew"] },
  { id: "JAS", names: ["james"] },
  { numbered: ["1PE", "2PE"], names: ["peter", "peters"] },
  { id: "JUD", names: ["jude"] },
  { id: "REV", names: ["revelation", "revelations", "revelation of john", "revelations of john"] },
];

/** Spoken words that mean 1, 2 or 3 in front of a book name ("first", "1st", "II"). */
export const ORDINALS: Record<string, number> = {
  "1": 1, first: 1, "1st": 1, i: 1,
  "2": 2, second: 2, "2nd": 2, ii: 2,
  "3": 3, third: 3, "3rd": 3, iii: 3,
};
