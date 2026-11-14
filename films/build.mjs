// films.data.mjs + kit/ → films/<id>/ (HyperFrames 프로젝트: index.html + hyperframes.json + assets/).
// 그림은 게임에 이미 있는 것만 쓴다: 잎새·물방울 자세 시트(references/characters), 개념 그림(assets/concept-art), Jua 글꼴(assets/fonts).
// assets/는 저장소 원본에서 매번 다시 만든다(.gitignore). 실행: node films/build.mjs
import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { films } from './films.data.mjs';
import { page } from './kit/kit.mjs';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP || '/Users/yel/.local/node/lib/node_modules/sharp');
sharp.cache(false); sharp.concurrency(1);
const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..');
const css = await readFile(join(here, 'kit', 'kit.css'), 'utf8');
const SHEET = join(root, 'references', 'characters', 'chatgpt_generated_22.png');
// 물방울 자세 시트의 칸(px).
const POSES = { 'otter-think': [1276, 580, 164, 222, false], 'otter-cheer': [1436, 580, 236, 222, false] };
const BG = [251, 248, 243];

// 종이색 바탕을 가장자리에서부터만 지운다(눈의 흰자처럼 윤곽선 안의 밝은 곳은 남는다).
async function pose([left, top, width, height, flip], out) {
  let img = sharp(SHEET).extract({ left, top, width, height });
  if (flip) img = img.flop();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, seen = new Uint8Array(W * H), queue = [];
  const near = i => Math.hypot(data[i * 4] - BG[0], data[i * 4 + 1] - BG[1], data[i * 4 + 2] - BG[2]) < 20;
  for (let x = 0; x < W; x++) queue.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) queue.push(y * W, y * W + W - 1);
  while (queue.length) {
    const i = queue.pop();
    if (seen[i] || !near(i)) continue;
    seen[i] = 1; data[i * 4 + 3] = 0;
    const x = i % W, y = (i - x) / W;
    if (x > 0) queue.push(i - 1); if (x < W - 1) queue.push(i + 1); if (y > 0) queue.push(i - W); if (y < H - 1) queue.push(i + W);
  }
  // 모든 자세를 같은 240×222 칸에 바닥 맞춰 넣어 바뀔 때 크기가 튀지 않게 한다.
  const cut = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  await sharp({ create: { width: 240, height: 222, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: cut, left: Math.round((240 - W) / 2), top: 0 }]).webp({ quality: 92, alphaQuality: 100 }).toFile(out);
}

async function parrotPose(out) {
  // The art faces right by default; the companion stands to the right of the lesson board.
  const file = join(root, 'assets', 'ipsae-parrot.webp');
  await sharp(file).flop().resize(240, 222, {
    fit: 'contain', position: 'south', background: { r: 0, g: 0, b: 0, alpha: 0 }
  }).webp({ quality: 92, alphaQuality: 100 }).toFile(out);
}

const only = process.argv.slice(2);
for (const f of films.filter(f => !only.length || only.includes(f.id))) {
  const dir = join(here, f.id), img = join(dir, 'assets', 'img'), fonts = join(dir, 'assets', 'fonts');
  await mkdir(img, { recursive: true }); await mkdir(fonts, { recursive: true });
  for (const font of ['jua-korean-400.woff2', 'jua-latin-400.woff2', 'OFL.txt']) await copyFile(join(root, 'assets', 'fonts', font), join(fonts, font));
  if(f.cast==='parrot'){
    const ask=join(img,'parrot-think.webp');await parrotPose(ask);
    await copyFile(ask,join(img,'parrot-react.webp'));
  }else for (const [name, box] of Object.entries(POSES)) if (name.startsWith(f.cast)) await pose(box, join(img, `${name}.webp`));
  const used = new Set([...f.body.matchAll(/assets\/img\/([a-z0-9-]+)\.webp/g)].map(m => m[1]));
  for (const id of used) await copyFile(join(root, 'assets', 'concept-art', `${id}.webp`), join(img, `${id}.webp`));
  await writeFile(join(dir, 'index.html'), page(f, css));
  await writeFile(join(dir, 'hyperframes.json'), JSON.stringify({ $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json', paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true }, authoringSkill: 'hyperframes' }, null, 2) + '\n');
  await writeFile(join(dir, 'meta.json'), JSON.stringify({ id: f.id, name: f.title }, null, 2) + '\n');
  console.log(`${f.id}: ${used.size} pictures, cast ${f.cast}`);
}
