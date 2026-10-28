// Authoring only: preserve original illustrations; deliver bounded-size WebP assets.
import {createRequire} from 'node:module';
import {mkdir,readdir,copyFile,readFile,writeFile,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp');}catch{sharp=createRequire(process.env.MEDIA_PACKAGE||'F:/iscreammedia_sc34/1udangtangtang/package.json')('sharp');}
const root=resolve('.'),input=join(root,'references/generated/concept-art'),output=join(root,'assets/concept-art');
await mkdir(input,{recursive:true});await mkdir(output,{recursive:true});
// Newly generated PNGs are copied here first. Keep their exact originals separately.
for(const file of await readdir(output))if(file.endsWith('.png'))await copyFile(join(output,file),join(input,file));
const manifest=[];
for(const file of (await readdir(input)).filter(f=>f.endsWith('.png')).sort()){
 const id=file.slice(0,-4),scene=id.startsWith('scene-'),source=join(input,file),target=join(output,id+'.webp');
 const original=await readFile(source),meta=await sharp(original).metadata();
 const pipeline=sharp(original).resize(scene?{width:1280,height:720,fit:'cover',withoutEnlargement:true}:{width:640,height:480,fit:'contain',background:{r:0,g:0,b:0,alpha:0},withoutEnlargement:true});
 await pipeline.webp({quality:scene?82:86,alphaQuality:100,effort:5}).toFile(target);
 const final=await sharp(target).metadata();
 manifest.push({id,kind:scene?'scene':'object',src:'assets/concept-art/'+id+'.webp',original:'references/generated/concept-art/'+file,width:final.width,height:final.height,bytes:(await stat(target)).size,hasAlpha:final.hasAlpha,sourceWidth:meta.width,sourceHeight:meta.height,sourceSha256:createHash('sha256').update(original).digest('hex')});
}
await writeFile(join(root,'docs/concept-art-manifest.json'),JSON.stringify({generator:'Built-in image_gen; original PNG retained; resized and encoded as WebP only.',assets:manifest},null,2)+'\n');
console.log(`Prepared ${manifest.length} illustrations · ${(manifest.reduce((n,a)=>n+a.bytes,0)/1024/1024).toFixed(2)} MiB WebP`);
