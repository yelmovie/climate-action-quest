# Character narration integration · 2026-11-10

## Scope

40 planned Korean lines connect to their own screens: welcome (1), home greetings (2), story (3), next destination (6), facilities (5), activity hints (11), retry feedback (5), badges (5), endings (2). The line definitions in `src/voice-lines.js` retain the approved captions and character assignments. Existing welcome media and all fonts/assets are preserved; no font replacements are part of this change.

- Ipsae, Mulbangul and narrator use generated fictional character voices, not impersonations.
- Home and ending narration use deliberate listen buttons. Opening a hint, story, facility help or map speech, and earning a badge can start its corresponding voice. Every line has a replay/stop control.
- A shared player stops old narration on another action, route change, dialog close, visibility loss, or global mute. Failed media leaves readable captions and learning controls intact.
- Narration temporarily suspends background music scheduling without changing the learner's settings. Concept videos keep their independent music suppression. Muted concept videos can accompany badge narration.
- Short landscape home screens use a scrollable copy container so the existing title, actions and welcome captions remain reachable without changing fonts or artwork.
- Facilities have a voice button in their title area because their decorative help characters are hidden by the existing mobile layout.

## Reproducible checks

Run `npm test`, `npm run build`, then `PORT=5357 npm run dev`.

- `BASE_URL=http://127.0.0.1:5357 npm run check:journey`: 72 actual learning units, all ten activities, genuine cumulative records, certificate download and reload. No injected completion in this journey.
- `node scripts/check-voices.mjs`: all 40 screen connections. This separate focused suite reuses the completed journey's saved records as fixtures; retry feedback is triggered through actual choices and badges through final-unit completion.
- `node scripts/check-voices.mjs --playback`: additionally requires actual native Chrome playback to reach `ended` for every individual line. Run only after all generated assets are finalized.
- `node scripts/check-voice-controls.mjs`: native playback, one active voice, music suppression/restoration, global mute, route/close interruption, simulated visibility event and media failure fallback.
- `VIEWPORT='{"width":390,"height":844}' CHECK_CLICKS=1 node scripts/check-voices.mjs` and the equivalent 844×390 profile: all 40 controls must be reachable without forced clicks.
- Existing interaction, resume, automatic activity playback, responsive and first-load suites remain applicable. Some legacy scripts require `CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` and `BASE_URL=http://127.0.0.1:5357`.

## Known boundaries

- Technical audio validation and native browser playback are not human speaker listening. Korean pronunciation, expressive delivery and distinct character perception have not been verified by a human listener.
- The existing 844×390 activity-1 layout has 16–18 px of chart workspace overrun in two states. Identical stage-1 HEAD results were reproduced by serving its source to the browser without changing any checkout. Answer selection and moving to the next question work; fonts and layout were left unchanged.
- Do not infer human listening from automated pronunciation checks or technical playback tests.

## Final generation provenance

The exact delivered `assets/audio/voices/manifest.json` has SHA-256 `66190260d29741d8851575da1bf7f7889ec99f89517e23e6093d7b9c48f8ac42`. All 40 MP3 hashes matched it before copying. Each entry records source UUID, generated voice/preset, spoken wording, ASR evidence, duration, loudness, peak and SHA-256. Source model: Qwen3-TTS-12Hz-1.7B-VoiceDesign via local Momo; model license: Apache-2.0. Output: mono 44.1 kHz, 96 kbps MP3. Measured loudness: −16.4 to −16.0 LUFS.

The five short badge lines use the existing narrator/preset-06 voice consistently. Repeated child-character candidates made “생활 실천가” unclear; the other 35 final MP3 files were unchanged by this badge-only revision. Badge-3 records both blind ASR and a separate check given only the word “배지”, not its full sentence. Story-2 records the acoustically identical 잎새/입새 spelling distinction. These are objective checks, not a claim of human listening.

## Final local verification

- Unit tests: 43/43 passed. Build: 156 deployable files, cache version `8a8dec32241d`.
- All 40 distinct files reached native Chrome `ended` on their corresponding screens at normal speed. Total manifest duration is 295.73 seconds; this is technical playback, not human listening.
- Eight voice-control checks passed, including actual BGM oscillator suppression and restoration; visibility loss was a simulated browser event.
- 40/40 controls were actually clicked at both 390×844 and 844×390 without forced clicks.
- Complete actual learning journey: 72 units, ten activities, certificate download with preserved embedded fonts, and refresh passed.
- Existing interaction checks: 24 passed; resume checks: 7 passed; automatic activity playback checks: 5 passed.
- Delivery checks: 5 passed (media byte ranges, offline WebM/MP4 fallback/seeking, offline hint). Additional offline reload plus generated welcome MP3 reached native `ended`.
- Home/story/map: 18 viewport-screen cases passed. Short landscape home scrolling was also visually reviewed at both the title and caption positions.
- Activity responsive sweep: 206/208 cases passed with no page errors. The two pre-existing 844×390 activity-1 chart overruns remain as described above; this aggregate command intentionally still reports those findings rather than suppressing them. All added voice controls and required learning actions were reachable.
