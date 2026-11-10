import Link from "next/link";

/** Simple launcher: which screen do you want? */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">Grace</h1>
      <p className="text-op-muted">Live scripture display. Open the operator panel on this laptop, and the output screen on the projector or in OBS.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/operator" className="rounded-op bg-op-accent p-5 text-op-accent-text shadow-sm hover:opacity-90">
          <div className="text-lg font-semibold">Operator panel</div>
          <div className="text-sm opacity-90">For the media team</div>
        </Link>
        <Link href="/output" className="rounded-op border border-op-border bg-op-surface p-5 shadow-sm hover:bg-white/60">
          <div className="text-lg font-semibold">Output screen</div>
          <div className="text-sm text-op-muted">Projector / OBS browser source</div>
        </Link>
      </div>
    </main>
  );
}
