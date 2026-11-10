/**
 * Turns spoken number words into digits, token by token:
 *   "three sixteen"              → ["3", "16"]
 *   "twenty three"               → ["23"]
 *   "one hundred and nineteen"   → ["119"]
 *   "a hundred and five"         → ["105"]
 * Other words pass through unchanged.
 */

const UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
};
const TEENS: Record<string, number> = {
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

/** Value of a number below 100 starting at tokens[i], and how many tokens it used. */
function underHundred(tokens: string[], i: number): [number, number] | null {
  const t = tokens[i];
  if (t in TEENS) return [TEENS[t], 1];
  if (t in TENS) {
    const next = tokens[i + 1];
    if (next !== undefined && next in UNITS && UNITS[next] > 0) return [TENS[t] + UNITS[next], 2];
    return [TENS[t], 1];
  }
  if (t in UNITS) return [UNITS[t], 1];
  return null;
}

export function wordsToDigits(tokens: string[]): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];

    // "<one|a> hundred [and] <rest>"
    const lead = t === "a" ? 1 : t in UNITS ? UNITS[t] : null;
    if (lead !== null && tokens[i + 1] === "hundred") {
      let value = lead * 100;
      let j = i + 2;
      if (tokens[j] === "and") j++;
      const rest = j < tokens.length ? underHundred(tokens, j) : null;
      if (rest) {
        value += rest[0];
        j += rest[1];
      } else if (tokens[i + 2] === "and") {
        j = i + 2; // "hundred and" with nothing after: leave "and" alone
      }
      out.push(String(value));
      i = j;
      continue;
    }
    if (t === "hundred") {
      // bare "hundred and nineteen"
      let value = 100;
      let j = i + 1;
      if (tokens[j] === "and") j++;
      const rest = j < tokens.length ? underHundred(tokens, j) : null;
      if (rest) {
        value += rest[0];
        j += rest[1];
      } else j = i + 1;
      out.push(String(value));
      i = j;
      continue;
    }

    const small = underHundred(tokens, i);
    if (small) {
      out.push(String(small[0]));
      i += small[1];
      continue;
    }
    out.push(t);
    i++;
  }
  return out;
}
