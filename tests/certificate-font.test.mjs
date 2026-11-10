import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { certificateFontStyle } from '../src/certificate-font.js';
test('downloaded certificate embeds both official fonts without external requests', async () => {
  const paths = [];
  const css = await certificateFontStyle(async path => {
    paths.push(path);
    const bytes = await readFile(new URL('../' + path.slice(1), import.meta.url));
    return { ok: true, arrayBuffer: async () => bytes, text: async () => bytes.toString() };
  });
  assert.equal(paths.length, 3);
  assert.match(css, /font-weight:400/); assert.match(css, /font-weight:700/);
  assert.equal((css.match(/data:font\/woff2;base64,/g) || []).length, 2);
  assert.match(css, /<metadata>[\s\S]*OPEN FONT LICENSE[\s\S]*<\/metadata>/);
  assert.doesNotMatch(css.match(/<style>([\s\S]*)<\/style>/)[1], /https?:/);
});
test('invalid or unavailable certificate fonts are not silently exported', async () => {
  await assert.rejects(certificateFontStyle(async () => ({ok: false})));
  await assert.rejects(certificateFontStyle(async () => ({ok: true, arrayBuffer: async () => new Uint8Array([1,2,3,4])})));
});
