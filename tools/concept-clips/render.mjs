import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {concepts} from '../../src/concept-data.js';
import {frame,FPS,SECONDS,ART_IDS,configureArt} from './scenes.mjs';
const local=createRequire(import.meta.url);
let sharp;
try{sharp=local('sharp');}catch{sharp=createRequire(process.env.MEDIA_PACKAGE||'F:/iscreammedia_sc34/1udangtangtang/package.json')('sharp');}
const ffmpeg=process.env.FFMPEG||'F:/iscreammedia_sc34/_scratch/pylib/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-version'],{stdio:'pipe'});
const out=resolve('assets/concepts');await mkdir(out,{recursive:true});
const art={};
for(const id of ART_IDS){const png=await sharp(resolve('assets/concept-art',id+'.webp')).resize(id.startsWith('scene-')?{width:1200}:{width:420}).png().toBuffer();art[id]='data:image/png;base64,'+png.toString('base64');}
configureArt(art);
function encoder(file,codec){
 const proc=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba','-s','1280x720','-r',String(FPS),'-i','-',...codec,'-threads','2','-pix_fmt','yuv420p','-an',file],{stdio:['pipe','inherit','inherit']});
 const done=new Promise((ok,fail)=>{proc.on('error',fail);proc.on('close',code=>code===0?ok():fail(Error('Encoder exit '+code)));});
 proc.stdin.on('error',()=>{});
 return {write:buf=>new Promise(ok=>{proc.stdin.write(buf)?ok():proc.stdin.once('drain',ok);}),end:()=>{proc.stdin.end();return done;}};
}
for(const [index,clip] of concepts.entries()){
 if(process.argv[2]&&process.argv[2]!==clip.id)continue;
 const base=resolve(out,clip.id),webm=encoder(base+'.webm',['-c:v','libvpx-vp9','-crf','34','-b:v','0','-row-mt','1','-deadline','good','-cpu-used','5']),mp4=encoder(base+'.mp4',['-c:v','libx264','-crf','24','-preset','fast','-movflags','+faststart']);
 for(let f=0;f<FPS*SECONDS;f++){
  const rgba=await sharp(Buffer.from(frame(index,f/FPS))).ensureAlpha().raw().toBuffer();
  await Promise.all([webm.write(rgba),mp4.write(rgba)]);
 }
 await Promise.all([webm.end(),mp4.end()]);
 await sharp(Buffer.from(frame(index,SECONDS))).webp({quality:86}).toFile(base+'.webp');
 console.log(`${clip.id}: ${SECONDS}s · 1280×720 · WebM + MP4 + poster`);
}
