# Grace — Live Scripture Display

A free web app for a church media team. The operator panel puts Bible verses
on a clean output screen (projector or OBS). Everything runs on one laptop,
and no paid services are used.

> **Status:** build steps 1–4 are done (manual search, display, versions,
> verse stepper, history). Listening to the pastor via the microphone comes in
> the next steps. See [SPEC.md](SPEC.md) for the full plan.

## Setup

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run build
npm start          # then open http://localhost:3000
```

For development, use `npm run dev` instead of build/start.

## Using it

1. Open **http://localhost:3000/operator** on the laptop. This is the media team's control panel.
2. Click **Open output window**, or open **http://localhost:3000/output** yourself.
   The output screen must be open **in the same browser** as the operator panel,
   because the two talk to each other inside the browser.
3. Type a reference such as `John 3:16`, `1 Cor 13:4-7` or `Psalm 23` and press **Enter**.
   - A range becomes a queue. The first verse shows, and **Next verse ▶** / **◀ Previous verse** step through it.
   - **Clear screen** blanks the output. **Show on screen** brings the verse back.
   - Click a **version** (KJV, WEB, ASV, …) to switch translation; the same verse stays on screen.
   - Click anything in **History** to show it again.

The header shows **Output connected** once an output screen is open.
If you refresh either page, it picks up where it left off.

### Output on a second screen (projector)

1. Connect the projector and set the display to **extend** (not mirror).
2. Click **Open output window** in the operator panel and drag the new window onto the projector.
3. **Double-click** the output to make it fullscreen (double-click again to exit). The mouse cursor is hidden on the output screen.

### Output in OBS

Add a **Browser** source with:

- URL: `http://localhost:3000/output`
- Width/Height: your canvas size, e.g. 1920 × 1080

OBS's browser source is a separate browser, so it can't hear the operator
panel directly. Until a sync option for OBS is added, use **Window Capture**
of the output window from the step above. (This is tracked for a later step.)

## Bible versions

Offline and public domain: **KJV** (default), **WEB**, **ASV**, **YLT**, **Darby**, **BBE**.
They're already in `public/bibles/`. To rebuild them from source:

```bash
npm run bibles
```

This downloads them from [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases)
(KJV, ASV, YLT, Darby, BBE) and [getbible.net](https://api.getbible.net/v2/web.json) (WEB).
It then cleans up source quirks and writes one compact file per version.

A few verses aren't included in WEB (e.g. Acts 8:37). For those, the screen
says so instead of showing the wrong text.

## Restyling

All colours, fonts and sizes live in [src/styles/tokens.css](src/styles/tokens.css).
Output-screen tokens start with `--out-` and operator tokens with `--op-`.

## For developers

```bash
npm test           # unit tests (vitest)
npm run lint
npm run typecheck  # run after a build/dev once, so Next's route types exist
```

| Path | What |
| --- | --- |
| `src/lib/bible/books.ts` | 66 books, USFM ids, abbreviations |
| `src/lib/bible/structure.ts` | Verse counts per chapter (generated), used to reject impossible references |
| `src/lib/bible/typedReference.ts` | Parser for the manual search box |
| `src/lib/bible/sources.ts` | Pluggable version registry (`BibleSource`). Adding a version = registering a source |
| `src/lib/operator/state.ts` | Operator state reducer: passage queue, stepper, live/blank, history |
| `src/lib/sync/channel.ts` | BroadcastChannel protocol between operator and output |
| `src/components/operator/` | Operator panel UI |
| `src/components/output/` | Output screen (auto-fit text, fades) |
| `scripts/build-bibles.mjs` | Downloads + normalises Bible data |
