import {mkdir,cp,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=resolve('.'),dist=join(root,'dist');
for(const file of await readdir(join(root,'src')))if(!file.startsWith('._')&&file.endsWith('.js'))execFileSync(process.execPath,['--check',join(root,'src',file)],{stdio:'pipe'});
// Start from an empty dist so moved or deleted assets never linger in the deploy or the offline cache list.
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
for(const p of ['index.html','manifest.webmanifest','src','assets'])await cp(join(root,p),join(dist,p),{recursive:true,filter:path=>!path.split(/[\\/]/).pop().startsWith('._')});
const files=[];
// exFAT drives add macOS "._*" metadata files while copying; they must never enter the offline cache list.
async function walk(dir,prefix=''){for(const f of await readdir(dir,{withFileTypes:true})){if(f.name.startsWith('._'))continue;const rel=prefix+'/'+f.name;if(f.isDirectory())await walk(join(dir,f.name),rel);else if(!f.name.endsWith('.md')&&f.name!=='sw.js')files.push(rel);}}
await walk(dist);
const hash=createHash('sha256');
hash.update(await readFile(new URL(import.meta.url)));
for(const f of files.sort())hash.update(await readFile(join(dist,f)));
const version=hash.digest('hex').slice(0,12);
// Static hosts redirect index.html to /. Cache the canonical, non-redirected document.
const cacheFiles=files.map(file=>file==='/index.html'?'/':file);
await writeFile(join(dist,'sw.js'),`const CACHE='climate-${version}'; const FILES=${JSON.stringify(cacheFiles)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('climate-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith((async()=>{
 const cached=await caches.match(e.request);
 if(cached){
  const range=e.request.headers.get('range');
  if(range){const bytes=await cached.arrayBuffer(),match=/^bytes=(\\d*)-(\\d*)$/.exec(range),start=match?(match[1]?Number(match[1]):Math.max(0,bytes.byteLength-Number(match[2]))):NaN,end=match&&match[1]&&match[2]?Math.min(bytes.byteLength-1,Number(match[2])):bytes.byteLength-1;
   if(!match||(!match[1]&&!match[2])||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=bytes.byteLength||end<start)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.byteLength}});
   return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':cached.headers.get('content-type')||'application/octet-stream','Content-Range':'bytes '+start+'-'+end+'/'+bytes.byteLength,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
  }return cached;
 }
 try{return await fetch(e.request);}catch{return e.request.mode==='navigate'?caches.match('/'):Response.error();}
})())});`);
console.log(`배포본 준비: dist · ${files.length} files · cache ${version}`);
