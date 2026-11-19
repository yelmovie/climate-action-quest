// Original procedural sound design, plus optional local CC0 samples for named cues. No microphone.
// samples: { kind: [{ src, at, gain, rate }] } layers decoded files on the same settings.
// Three lanes share those settings: interface tones (one at a time), sample cues for map fights and rewards (up to
// four at once; an interface tone or a footstep never cuts them) and the walker's footsteps (their own single voice).
const CUE_LIMIT = 4, UI_GAIN = .28;
export function createThemeEffects(theme, getSettings = () => ({}), { samples = {} } = {}) {
  let context, disposed = false, last = -Infinity;
  const ui = new Set(), cues = [], steps = new Set(), gains = new WeakMap(), raw = new Map(), buffers = new Map();
  const fetchSample = src => {
    if (!raw.has(src)) raw.set(src, fetch(src).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null).then(data => { if (!data) raw.delete(src); return data; }));
    return raw.get(src);
  };
  const decode = src => {
    if (!context || buffers.has(src)) return;
    buffers.set(src, null);
    fetchSample(src).then(data => data && context.decodeAudioData(data.slice(0))).then(buffer => { if (buffer) buffers.set(src, buffer); else buffers.delete(src); }, () => buffers.delete(src));
  };
  const sources = kinds => [...new Set(kinds.flatMap(kind => (samples[kind] || []).map(part => part.src)))];
  // Fetch the named cues ahead of use; decoding waits for the first gesture's audio context.
  function prepare(kinds = Object.keys(samples)) { if (disposed || typeof fetch !== 'function') return; for (const src of sources(kinds)) { fetchSample(src); decode(src); } }
  // Returns the cue's length in seconds, or 0 while its files are not decoded yet.
  function playSample(parts, volume, voices, rate = 1) {
    if (!parts.every(part => buffers.get(part.src))) { prepare(Object.keys(samples).filter(kind => samples[kind] === parts)); return 0; }
    let length = 0;
    for (const part of parts) {
      const source = context.createBufferSource(), g = context.createGain(), speed = (part.rate || 1) * rate;
      source.buffer = buffers.get(part.src); source.playbackRate.value = speed;
      g.gain.value = Math.min(1, (part.gain ?? 1) * volume);
      source.connect(g); g.connect(context.destination); voices.add(source); gains.set(source, g);
      source.onended = () => { voices.delete(source); source.disconnect(); g.disconnect(); };
      source.start(context.currentTime + (part.at || 0));
      length = Math.max(length, (part.at || 0) + source.buffer.duration / speed);
    }
    return length;
  }
  const scales = { sky: [523.25, 783.99, 1046.5], ecosystem: [587.33, 880, 1174.66], gas: [196, 293.66, 392], climate: [392, 523.25, 783.99] };
  const halt = voices => { for (const voice of voices) { try { voice.stop(); voice.disconnect(); } catch {} } voices.clear(); };
  function stop() { halt(ui); for (const cue of cues) halt(cue); cues.length = 0; halt(steps); }
  function unlock() {
    if (disposed) return;
    try { const Audio = globalThis.AudioContext || globalThis.webkitAudioContext; if (!Audio) return; context ||= new Audio(); if (context.state === 'suspended') context.resume().catch(() => {}); } catch {}
    for (const src of raw.keys()) decode(src);
  }
  function sync() { const s = getSettings(); if (s.muted || s.enabled === false || document.hidden) stop(); }
  const level = s => Math.max(0, Math.min(1, Number.isFinite(s.volume) ? s.volume : 1));
  function tone(kind, volume, voices) {
    const notes = scales[theme] || scales.sky, success = ['success','award','discover','collect'].includes(kind), soft = ['error','retry'].includes(kind);
    const count = success ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const o = context.createOscillator(), g = context.createGain(), t = context.currentTime + i * .075;
      const airy = theme === 'gas' && ['pump','rotate','experiment'].includes(kind);
      const f = soft ? notes[0] * .55 : notes[i];
      o.type = theme === 'gas' ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(airy ? 110 : f, t);
      o.frequency.exponentialRampToValueAtTime(airy ? 440 : f * (theme === 'ecosystem' ? 1.3 : 1.04), t + .09);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(UI_GAIN * volume, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + (success ? .32 : .18));
      o.connect(g); g.connect(context.destination); voices.add(o);
      o.onended = () => { voices.delete(o); o.disconnect(); g.disconnect(); };
      o.start(t); o.stop(t + (success ? .35 : .21));
    }
  }
  // Returns false when nothing could sound yet, the cue's length in seconds for a sample cue, true for a tone.
  function play(kind = 'tap') {
    const s = getSettings();
    if (disposed || document.hidden || s.muted || s.enabled === false) return false;
    const now = performance.now(); if (now - last < 65 && ['click','tap'].includes(kind)) return false; last = now;
    unlock(); if (!context || context.state !== 'running') return false;
    const volume = level(s);
    if (samples[kind]) {
      for (let i = cues.length; i--;) if (!cues[i].size) cues.splice(i, 1);
      while (cues.length >= CUE_LIMIT) halt(cues.shift());
      const voices = new Set(); cues.push(voices);
      // A cue whose files are not decoded yet falls back to the synthesized tone, in the same lane.
      const length = playSample(samples[kind], volume, voices);
      if (!length) tone(kind, volume, voices);
      return length || true;
    }
    halt(ui);
    tone(kind, volume, ui);
    return true;
  }
  // Footsteps: a new step replaces only the previous step, and stopping fades the last one out.
  function stopStep(seconds = .06) {
    for (const source of steps) {
      try { const g = gains.get(source).gain, t = context.currentTime; g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + seconds); source.stop(t + seconds + .01); } catch {}
    }
    steps.clear();
  }
  function step(kind, { gain = 1, rate = 1 } = {}) {
    const s = getSettings();
    if (!samples[kind] || disposed || document.hidden || s.muted || s.enabled === false) return false;
    unlock(); if (!context || context.state !== 'running') return false;
    stopStep(.03);
    return playSample(samples[kind], level(s) * gain, steps, rate) > 0;
  }
  const hide = () => { if (document.hidden) { stop(); context?.suspend().catch(() => {}); } };
  const leave = () => { stop(); context?.suspend().catch(() => {}); };
  document.addEventListener('visibilitychange', hide); globalThis.addEventListener?.('pagehide', leave);
  return { unlock, play, step, stopStep, stop, sync, prepare, dispose() { if (disposed) return; disposed = true; stop(); document.removeEventListener('visibilitychange', hide); globalThis.removeEventListener?.('pagehide', leave); context?.close().catch(() => {}); } };
}
