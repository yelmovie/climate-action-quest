import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
const root = new URL('../', import.meta.url);
test('화면 글꼴은 공식 나눔스퀘어 네오 웹폰트와 라이선스를 함께 제공한다', () => {
  for (const name of ['NanumSquareNeoTTF-bRg.woff2', 'NanumSquareNeoTTF-cBd.woff2']) {
    const font = readFileSync(new URL('assets/fonts/' + name, root));
    assert.equal(font.subarray(0, 4).toString(), 'wOF2');
    assert.ok(font.length > 300000);
  }
  const license = readFileSync(new URL('assets/fonts/NanumSquareNeo-OFL.txt', root), 'utf8');
  assert.match(license, /NanumSquareNeo/);
  assert.match(license, /SIL OPEN FONT LICENSE/);
  assert.match(license, /DISCLAIMER/);
  assert.match(readFileSync(new URL('src/styles.css', root), 'utf8'), /font-family: "NanumSquareNeo"/);
});

// Font shorthand resets font-family, including transient loading/error states.
test('로딩·저장 보호 안내와 동적 스타일의 font 축약도 나눔스퀘어 네오를 유지한다', () => {
  const shell = readFileSync(new URL('src/shell.css', root), 'utf8');
  const styles = readFileSync(new URL('src/styles.css', root), 'utf8');
  assert.match(shell, /\.boot\{[^}]*font:600 24px "NanumSquareNeo",sans-serif/);
  assert.match(styles, /#save-protection\{[^}]*font:600 18px\/1\.5 "NanumSquareNeo",sans-serif/);
  for (const file of readdirSync(new URL('src/', root))) {
    if (file.startsWith('._') || !/\.(css|js)$/.test(file)) continue;
    // The shared achievement-card stylesheet is copied as shipped. Its font shorthands end in `inherit`, which browsers
    // drop as invalid, so the family stays the inherited NanumSquareNeo; map-reward-cards.css restores size and weight.
    if (file === 'reward-cards.css') continue;
    const source = readFileSync(new URL('src/' + file, root), 'utf8');
    for (const match of source.matchAll(/(?<![\w-])font\s*:\s*([^;{}<>\n]+)/g)) {
      assert.match(match[1], /NanumSquareNeo|var\(|^inherit\b/, `${file}: ${match[0]}`);
    }
  }
});

// scripts/subset-fonts.py keeps the screen text in small subset files. New on-screen text with a character outside the
// subset still shows (the official file is the fallback), but it would download the full font again: regenerate the subset.
test('화면 글자는 모두 부분 글꼴 범위 안에 있다(벗어나면 scripts/subset-fonts.py를 다시 돌린다)', () => {
  const styles = readFileSync(new URL('src/styles.css', root), 'utf8');
  const block = styles.slice(styles.indexOf('/* font-subset:start */'), styles.indexOf('/* font-subset:end */'));
  const inRange = (spec, code) => spec.split(',').some(part => { const [a, b = a] = part.trim().slice(2).split('-').map(h => parseInt(h, 16)); return code >= a && code <= b; });
  const face = file => block.match(new RegExp(`url\\("/assets/fonts/${file}"\\)[^}]*unicode-range: ([^;]+);`))[1];
  for (const weight of [400, 700]) assert.ok(readFileSync(new URL(`assets/fonts/climate-body-${weight}.woff2`, root)).length < 100000);
  const subset = face('climate-body-400\\.woff2'), full = face('NanumSquareNeoTTF-bRg\\.woff2');
  const outside = new Set();
  for (const file of [...readdirSync(new URL('src/', root)).map(f => 'src/' + f), 'index.html', 'manifest.webmanifest']) {
    if (file.includes('/._') || !/\.(css|js|html|webmanifest)$/.test(file)) continue;
    let text = readFileSync(new URL(file, root), 'utf8');
    if (file === 'src/styles.css') text = text.replace(block, '');
    for (const ch of text) { const code = ch.codePointAt(0); if (code >= 0x20 && !inRange(subset, code) && inRange(full, code)) outside.add(ch); }
  }
  assert.deepEqual([...outside], []);
});
