# Build Spec: Live Scripture Auto-Display App (for Claude Code)

## 1. Goal
A free web app for a church media team. It listens to the pastor through a laptop microphone, detects spoken Bible references in real time, and displays the verse on a clean output page (projector/stream). A media operator controls everything from a separate operator panel. **Zero cost: no paid services or subscriptions.**

## 2. Stack
- Next.js (App Router) + TypeScript + Tailwind
- Browser Web Speech API (`SpeechRecognition`, continuous, interim results) for listening. Works in Chrome/Edge, needs internet. Keep the speech layer behind an interface so local Whisper can replace it later.
- BroadcastChannel API to sync the operator panel and the output page (same browser, same laptop). No server needed for sync.
- Bible data stored locally as JSON, loaded client-side or via a Next.js route.
- Deploy: runs locally (`npm run dev` / `npm start`), optionally on Vercel free tier.

## 3. Screens
### `/operator` (media team)
- **Mode toggle:** Off | Always listening | Wake phrase (wake phrase = **"Hello Grace"**)
- Live transcript strip (shows what the app is hearing, interim text greyed)
- **Detected queue:** detected references appear here, newest on top
- **Preview with cancel:** in automatic modes a detected verse shows a 2-second "about to display" countdown with a Cancel button before it goes live
- **Verse stepper:** Previous / Next buttons that move through the current passage one verse at a time (these exist ONLY here)
- **Version switcher:** one-click buttons for every available version; default **KJV**
- **Manual search box:** type "1 Cor 5:11" to display by hand (safety net for mishearing)
- **History list:** previously displayed verses, click to re-display
- **Blank/clear screen button**
- Status indicators: mic on/off, listening mode, connection to output page

### `/output` (projector / OBS browser source)
- Fullscreen, light background, dark text, large readable serif font, auto-fit text size so long verses never overflow
- Shows only: verse text, reference (e.g. "1 Corinthians 5:11"), version label
- **No controls visible.** Cursor hidden. Smooth fade between verses.
- Blank state when cleared.
- Styling is a placeholder; keep design tokens in one file so it can be restyled later.

## 4. Verse behaviour
- A range like "1 Cor 5:11-15" loads as a **queue of individual verses**. Verse 11 displays first; the operator steps with Next/Previous. The output page only ever shows the current single verse.
- Spoken commands (when listening): "next verse", "previous verse", "go back", "read it in NIV" (switch version).
- Single-verse references display immediately (subject to the 2-second cancel preview).

## 5. Reference detection (the hard part, build and test carefully)
Parse spoken text into `{book, chapter, verseStart, verseEnd?}`.
- Book names and aliases: "First/1st/one Corinthians", "Song of Solomon/Songs", "Psalm/Psalms", "Revelation(s)", etc. All 66 books.
- Number words to digits: "chapter thirteen verse four", "John three sixteen", "verses eleven to fifteen", "eleven through fifteen".
- Phrases: "turn to", "open your Bible to", "let's read", "look at", "in the book of".
- Handle speech-recognition quirks: "Corinthians" misheard, "Thessalonians", "Habakkuk", numbers split like "3 16".
- Validate against the real Bible structure (reject chapters or verses that don't exist) to prevent false positives.
- Confidence handling: ambiguous detections go to the queue for manual confirmation instead of auto-displaying.
- **Wake phrase mode:** only parse text spoken after "Hello Grace" (within about 8 seconds or until the reference is captured). Tolerate variants ("hello grace", "hallo grace", "hello gras").
- Write unit tests with at least 50 spoken-style examples.

## 6. Bible data and versions
- **Offline, free, public domain:** KJV (default), WEB, ASV, YLT, Darby, BBE. Source as JSON from a public-domain repository (e.g. scrollmapper/bible_databases) and normalise into one schema: `{version, book, chapter, verse, text}`.
- **NIV and TPT:** licensed, so no guaranteed free source. Try the free API.Bible tier (free API key) and use only versions it legitimately offers; cache what the licence allows. **Check and respect each version's terms; do not scrape or use unlicensed text.** If unavailable, provide an **Import Bible** feature (upload JSON/CSV the church obtains legitimately) so any version can be added later.
- Version architecture must be pluggable: adding a version = adding a data source, no UI changes.

## 7. Sync design
- Operator panel is the single source of truth. It broadcasts `{reference, verseText, version, state}` over BroadcastChannel; `/output` renders whatever it receives. Output page requests current state on load so a refresh recovers.

## 8. Build order
1. Project setup, design tokens, `/operator` and `/output` shells
2. Bible data layer and version switching
3. Manual search + display + BroadcastChannel sync (full flow working without speech)
4. Verse queue, Next/Previous stepper, history, clear
5. Reference parser with tests
6. Web Speech integration, live transcript, the three modes, wake phrase
7. Auto-display with 2-second cancel preview
8. Spoken commands (next/previous/version)
9. API.Bible integration for extra versions + Import Bible
10. Polish: error states, mic permission handling, auto-restart of speech recognition (the Web Speech API stops periodically; reconnect silently), keyboard shortcuts for the operator

## 9. Constraints and notes
- No paid APIs. Web Speech API needs internet in Chrome/Edge; document this clearly. Plan for a local Whisper option later.
- A wrong verse on screen is worse than a delay: prefer showing it in the queue when confidence is low.
- Keep the code simple, typed and commented; the media team is non-technical, so the operator UI must be obvious at a glance.
- Provide a README with setup, how to open the output on a second screen, and how to use it with OBS (browser source URL).
