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
  assert.match(styles, /#save-protection\{[^}]*font:600 15px\/1\.5 "NanumSquareNeo",sans-serif/);
  for (const file of readdirSync(new URL('src/', root))) {
    if (file.startsWith('._') || !/\.(css|js)$/.test(file)) continue;
    const source = readFileSync(new URL('src/' + file, root), 'utf8');
    for (const match of source.matchAll(/(?<![\w-])font\s*:\s*([^;{}<>\n]+)/g)) {
      assert.match(match[1], /NanumSquareNeo|var\(|^inherit\b/, `${file}: ${match[0]}`);
    }
  }
});
