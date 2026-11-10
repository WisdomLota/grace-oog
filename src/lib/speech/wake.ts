/**
 * Wake-phrase mode: only listen for references spoken after "Hello Grace".
 *
 * After the wake phrase, text is passed through for about 8 seconds, or
 * until a reference has been captured (call `disarm()`), whichever comes first.
 * Speech recognition often mishears it, so variants like "hallo grace",
 * "hello gras" or "hello grays" are accepted too.
 */

export const WAKE_WINDOW_MS = 8000;

const WAKE = /\b(?:hello|hallo|hullo|helo|hallow|hollow|ello|allo)[\s,.!]+(?:grace|gras|grays|graze|grass|grase|greys|grey's|gracie|grace's)\b/gi;

/** The text after the LAST wake phrase, or null if there is none. */
export function textAfterWakePhrase(text: string): string | null {
  let last: RegExpExecArray | null = null;
  WAKE.lastIndex = 0;
  for (let m = WAKE.exec(text); m; m = WAKE.exec(text)) last = m;
  return last ? text.slice(last.index + last[0].length).replace(/^[\s,.!]+/, "") : null;
}

export class WakeGate {
  private armedAt: number | null = null;

  constructor(private windowMs = WAKE_WINDOW_MS) {}

  /**
   * Feed newly heard text. Returns the part that may be parsed for
   * references, or null if we're not inside a wake window.
   */
  feed(text: string, now = Date.now()): string | null {
    const after = textAfterWakePhrase(text);
    if (after !== null) {
      this.armedAt = now;
      return after;
    }
    return this.isArmed(now) ? text : null;
  }

  isArmed(now = Date.now()): boolean {
    if (this.armedAt === null) return false;
    if (now - this.armedAt > this.windowMs) this.armedAt = null;
    return this.armedAt !== null;
  }

  /** Call once a reference has been captured, so later speech is ignored again. */
  disarm() {
    this.armedAt = null;
  }
}
