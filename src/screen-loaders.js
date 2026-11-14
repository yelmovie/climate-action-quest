const styles = new Map();
export function loadStyle(name, anchor) {
  if (styles.has(name)) return styles.get(name);
  const promise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(name, import.meta.url);
    link.onload = resolve;
    link.onerror = () => {
      styles.delete(name);
      link.remove();
      reject(new Error(`Stylesheet unavailable: ${name}`));
    };
    document.head.insertBefore(link, document.getElementById(anchor));
  });
  styles.set(name, promise);
  return promise;
}

export async function loadActivity(index) {
  const visualStyle = index < 4 ? './observation-visuals.css' : index < 8 ? './impact-visuals.css' : './city-visuals.css';
  const [module] = await Promise.all([
    import('./activities.js'),
    // These are the activity's dependencies. Request them together on entry
    // so a slow connection doesn't pay one round trip for each import level.
    import('./activity-data.js'),
    import('./activity-guide.js'),
    import('./activity-playback.js'),
    import('./manipulation.js'),
    import('./observation-visuals.js'),
    import('./impact-visuals.js'),
    import('./city-visuals.js'),
    loadStyle(visualStyle, 'responsive-style'),
    loadStyle('./activity-screen.css', 'glass-style'),
  ]);
  return module;
}

export function waitForScreen(pending, signal, deadline = 10000) {
  return new Promise((resolve, reject) => {
    const finish = settle => value => {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      settle(value);
    };
    const fail = finish(reject);
    const cancel = () => fail(signal.reason);
    const timer = setTimeout(() => fail(new Error('Screen load timed out')), deadline);
    if (signal.aborted) cancel();
    else signal.addEventListener('abort', cancel, { once: true });
    pending.then(finish(resolve), fail);
  });
}

export async function loadMapArt(parrot, walk, signal) {
  const request = new AbortController();
  const cancel = () => request.abort();
  if (signal.aborted) cancel();
  else signal.addEventListener('abort', cancel, { once: true });
  const image = async (src, priority = 'auto') => {
    const picture = new Image();
    picture.fetchPriority = priority;
    picture.src = src;
    const detach = () => picture.removeAttribute('src');
    if (request.signal.aborted) detach();
    else request.signal.addEventListener('abort', detach, { once: true });
    try { await picture.decode(); return picture; }
    finally { request.signal.removeEventListener('abort', detach); }
  };
  try {
    return await waitForScreen(Promise.all([
      image('/assets/village.webp', 'high'), image('/assets/field-team.webp'), image(parrot),
      // The standing portrait is a usable fallback for the optional walking sheet.
      waitForScreen(image(walk), request.signal, 2500).catch(() => null),
    ]), request.signal, 20000);
  } finally {
    signal.removeEventListener('abort', cancel);
    request.abort();
  }
}
