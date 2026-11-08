/** One shared, scalable icon family. The button supplies its accessible name. */
const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  back: '<path d="m10 5-7 7 7 7M3 12h18"/>',
  sound: '<path d="M11 4 6 8H3v8h3l5 4zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="M11 4 6 8H3v8h3l5 4zM16 9l6 6m0-6-6 6"/>',
  settings: '<path d="m10 3-1 3-3 1-3 3 2 2-2 2 3 3 3 1 1 3h4l1-3 3-1 3-3-2-2 2-2-3-3-3-1-1-3z"/><circle cx="12" cy="12" r="3"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2"/>',
  leaf: '<path d="M20 3c-1 7 2 15-9 17a7 7 0 0 1-7-7C5 2 13 5 20 3ZM3 22l12-12"/>',
  shelter: '<path d="m2 11 10-8 10 8ZM5 11v10m14-10v10M3 21h18M8 17h8"/>',
  shield: '<path d="m12 2 9 4v6c0 5-5 8-9 10-4-2-9-5-9-10V6Z"/><path d="m7 12 3 3 7-7"/>',
  ground: '<path d="M3 8h18M3 19h18M7 2v3m10-3v3M7 11v5m-3-3 3 3 3-3m7-2v5m-3-3 3 3 3-3"/>',
  water: '<path d="M12 2c-2 4-8 9-8 13a8 8 0 0 0 16 0c0-4-6-9-8-13Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  cloud: '<path d="M7 19a5 5 0 1 1 .5-10A6 6 0 0 1 19 9a5 5 0 0 1-1 10Z"/>',
  scan: '<path d="M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m8 0h4a1 1 0 0 0 1-1v-4M3 12h18"/><circle cx="12" cy="12" r="4"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M10 7v6m-3-3h6"/>',
  link: '<path d="m10 13 4-4m-5 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1"/>',
  flask: '<path d="M9 3h6m-5 0v7L4 20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-6-10V3M7 15h10"/><path d="M10 18h.01m4-1h.01"/>',
  city: '<path d="M3 21V9h6v12m0-18h7v18m0-9h5v9M2 21h20M6 12v2m0 3v1m6-12v2m0 3v2m0 3v2m7-3v2"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  play: '<path d="m9 5 11 7-11 7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  book: '<path d="M12 5C9 2 4 3 2 4v16c3-2 7-2 10 0m0-15c3-3 8-2 10-1v16c-3-2-7-2-10 0V5Z"/>',
  reset: '<path d="M3 10a9 9 0 1 1 1 8M3 3v7h7"/>',
  trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0zM8 5H3v3a4 4 0 0 0 5 4m8-7h5v3a4 4 0 0 1-5 4M12 13v5m-4 3v-3h8v3M6 21h12"/>',
  seed: '<path d="M12 21v-9M12 15C4 15 2 10 3 5c6-1 10 3 9 10Zm0-3c0-6 4-10 9-9 1 6-2 10-9 9Z"/>',
  rain: '<path d="M6 14a4 4 0 1 1 1-8 5 5 0 0 1 10 0 4 4 0 0 1 1 8ZM7 17l-1 3m6-3-1 3m6-3-1 3"/>',
  chevron: '<path d="m8 4 8 8-8 8"/>',
  footsteps: '<ellipse cx="7" cy="8" rx="3" ry="5" transform="rotate(-20 7 8)"/><ellipse cx="17" cy="15" rx="3" ry="5" transform="rotate(20 17 15)"/><path d="m8 16 1 3m7-14 1 3"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5m0-1V4a2 2 0 0 0-4 0v6m0 .5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/>',
  locate: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>',
  skip: '<path d="m4 5 9 7-9 7zm9 0 7 7-7 7M21 5v14"/>',
};

export function icon(name) {
  return `<svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.leaf}</svg>`;
}

export const iconNames = Object.freeze(Object.keys(paths));
