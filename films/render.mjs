// films/<id> → HyperFrames 렌더(1920×1080 30fps) → 앱이 쓰는 같은 경로·이름·형식으로 게시.
//   assets/concepts/<id>.mp4  1280×720 H.264(main, yuv420p, faststart), 무음 — 플레이어가 muted로 튼다
//   assets/concepts/<id>.webm 1280×720 VP9, 무음
//   assets/concepts/<id>.webp 마지막 장면(포스터 · 동작 줄이기/재생 실패 대체 그림)
// 실행: node films/build.mjs && RENDER_DIR=<외장 SSD 폴더> node films/render.mjs [id...]
//   SKIP_RENDER=1이면 RENDER_DIR에 있는 1080p 원본으로 게시만 다시 한다.
import { execFileSync } from 'node:child_process';
import { statSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { films } from './films.data.mjs';
import { DURATION } from './kit/kit.mjs';

const sharp = createRequire(import.meta.url)(process.env.SHARP || '/Users/yel/.local/node/lib/node_modules/sharp');
const here = dirname(fileURLToPath(import.meta.url)), out = join(here, '..', 'assets', 'concepts');
const renders = process.env.RENDER_DIR;
if (!renders) throw Error('RENDER_DIR를 외장 SSD 폴더로 지정해 줘(렌더 원본·임시 프레임을 저장소 밖에 둔다).');
mkdirSync(renders, { recursive: true });
const LIMIT = 2.5 * 1024 * 1024, only = process.argv.slice(2);
const probe = file => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString();
const ff = args => execFileSync('ffmpeg', ['-y', '-v', 'error', ...args]);

for (const f of films.filter(f => !only.length || only.includes(f.id))) {
  const src = join(renders, `${f.id}-1080.mp4`);
  if (process.env.SKIP_RENDER !== '1') execFileSync('hyperframes', ['render', '--quality', 'delivery', '--workers', '4', '--quiet', '-o', src], { cwd: join(here, f.id), stdio: 'inherit' });
  const length = probe(src);
  if (Math.abs(length - DURATION) > .1) throw Error(`${f.id}: 렌더 길이 ${length}s ≠ ${DURATION}s`);
  const mp4 = join(out, `${f.id}.mp4`), webm = join(out, `${f.id}.webm`), scale = ['-vf', 'scale=1280:720:flags=lanczos', '-r', '30', '-an'];
  ff(['-i', src, ...scale, '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-crf', '26', '-preset', 'slow', '-movflags', '+faststart', mp4]);
  ff(['-i', src, ...scale, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', '-cpu-used', '2', '-pix_fmt', 'yuv420p', webm]);
  for (const file of [mp4, webm]) if (statSync(file).size > LIMIT) throw Error(`${file}: ${statSync(file).size}B > 2.5MB`);
  const still = join(renders, `${f.id}-poster.png`);
  ff(['-sseof', '-0.1', '-i', src, '-frames:v', '1', '-vf', 'scale=1280:720:flags=lanczos', still]);
  await sharp(still).webp({ quality: 82 }).toFile(join(out, `${f.id}.webp`));
  console.log(`${f.id}: mp4 ${statSync(mp4).size}B, webm ${statSync(webm).size}B, poster ${statSync(join(out, `${f.id}.webp`)).size}B, ${probe(mp4).toFixed(2)}s`);
}
