"use client";

import dynamic from "next/dynamic";

/**
 * The operator panel is browser-only (it uses localStorage, BroadcastChannel
 * and, later, the microphone), so we skip server rendering for it.
 */
const OperatorPanel = dynamic(() => import("./OperatorPanel").then((m) => m.OperatorPanel), {
  ssr: false,
  loading: () => <p className="p-8 text-op-muted">Loading operator panel…</p>,
});

export function OperatorApp() {
  return <OperatorPanel />;
}
