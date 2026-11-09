# Audio provenance and release review

## New sound effects
- `src/theme-effects.js` is original procedural Web Audio code authored for this task. No third-party recordings, samples, audio service, or microphone.
- Theme: clear climate research station signals. No external sample license dependency; this is not an absolute legal warranty.
- User interaction unlock, mute/effects settings, narration priority, hidden-tab and page-exit stop are respected. Existing settings persistence is preserved.

## Preserved existing assets
- Existing Kenney Interface Sounds retained, with CC0 text available in project source/cache license files. The license expressly permits personal, educational, and commercial use. https://kenney.nl/assets/interface-sounds / https://creativecommons.org/publicdomain/zero/1.0/
- Runtime effects now use procedural synthesis without download/decode latency. Existing procedural music retained.

## NPC narration
Existing Korean F1 narration preserved. No new generation or microphone input. Source metadata `67f4022b-f0f2-407d-93e7-8fce205a2764.json` identifies momo-voice / Supertonic 3 / OpenRAIL-M, generated 2026-11-07T22:03:14.529Z. Original script exactly matches the runtime caption. Matching script and duration support conversion lineage; lossy AAC does not share WAV hash.

Official license: https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE . Section 6 claims no output rights subject to use restrictions. This is licensed educational narration, not public domain or an unconditional copyright-free claim. Snapshot: SUPERTONIC3-LICENSE.txt.

67f4022b-f0f2-407d-93e7-8fce205a2764.wav: SHA-256 fbbe06dffcc5f29be3ec371b64777128fa893c056efdca161baf8aa97a594a1f, duration 11.424218 seconds.
npc-welcome.m4a: SHA-256 2da9e6b2149cf3b21eb0ff9a4677bada775c2b14b08d3b666ad77ea1cabef861, duration 11.424218 seconds.
