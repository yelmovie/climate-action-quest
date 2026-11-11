import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(process.argv.includes('--dist')?'dist':'.');
const port=Number(process.env.PORT)||4173;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.m4a':'audio/mp4','.mp3':'audio/mpeg','.ogg':'audio/ogg','.txt':'text/plain; charset=utf-8','.md':'text/markdown; charset=utf-8'};
createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(path==='/index.html'&&process.argv.includes('--redirect-index')){
   res.writeHead(307,{Location:'/'});res.end();return;
  }
  const file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(!file.startsWith(root+sep)||path.includes('\0')){res.writeHead(403);res.end();return;}
  if(!(await stat(file)).isFile())throw new Error('not file');
  const data=await readFile(file),headers={'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   const start=match?(match[1]?Number(match[1]):Math.max(0,data.length-Number(match[2]))):NaN;
   const end=match&&match[1]&&match[2]?Math.min(data.length-1,Number(match[2])):data.length-1;
   if(!match||(!match[1]&&!match[2])||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=data.length||end<start){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
   res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));return;
  }
  res.writeHead(200,{...headers,'Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('자료를 찾을 수 없어요.');}
}).listen(port,'127.0.0.1',()=>console.log(`기후 미래 작전실 http://localhost:${port}`));
