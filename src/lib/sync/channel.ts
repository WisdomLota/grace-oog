/**
 * Operator ⇄ Output sync over BroadcastChannel (same browser, same laptop —
 * no server needed).
 *
 * The operator panel is the single source of truth. It broadcasts the
 * current DisplayState; /output just renders whatever it last received.
 * When /output loads (or is refreshed) it asks for the current state, and it
 * sends a heartbeat so the operator can show "Output connected".
 */

export const CHANNEL_NAME = "grace-scripture-display";

/** What the output screen should show right now. */
export type DisplayState =
  | { state: "blank" }
  | {
      state: "verse";
      /** e.g. "1 Corinthians 5:11" */
      reference: string;
      verseText: string;
      /** Version label, e.g. "KJV" */
      version: string;
    };

export type SyncMessage =
  | { type: "display"; display: DisplayState }
  | { type: "request-state" }
  | { type: "heartbeat"; outputId: string };

/** How often /output says "I'm here", and how long until the operator assumes it's gone. */
export const HEARTBEAT_MS = 2000;
export const HEARTBEAT_TIMEOUT_MS = 5000;

export function openChannel(onMessage: (msg: SyncMessage) => void): { post: (msg: SyncMessage) => void; close: () => void } {
  if (typeof BroadcastChannel === "undefined") {
    // Very old browser: nothing to sync with.
    return { post: () => {}, close: () => {} };
  }
  const ch = new BroadcastChannel(CHANNEL_NAME);
  ch.onmessage = (e: MessageEvent<SyncMessage>) => onMessage(e.data);
  return { post: (msg) => ch.postMessage(msg), close: () => ch.close() };
}
