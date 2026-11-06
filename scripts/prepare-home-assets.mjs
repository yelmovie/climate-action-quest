// Authoring only: cut the home-screen guide poses out of the character sheet
// and trim the title logo to its lettering.
// Run from the project root: node scripts/prepare-home-assets.mjs
// The sheet background is flat paper, so a flood fill from the crop edge removes it
// without touching the cream fur enclosed by the outline.
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp');}catch{sharp=createRequire(process.env.MEDIA_PACKAGE||resolve('../1udangtangtang/package.json'))('sharp');}
const sheet='references/characters/chatgpt_generated_22.png';
const poses={
 'home-squirrel':{left:222,top:330,width:205,height:250},
 'home-otter':{left:858,top:330,width:212,height:250}
};
for(const [name,box] of Object.entries(poses)){
 const {data,info}=await sharp(sheet).extract(box).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h}=info,at=(x,y)=>(y*w+x)*4;
 const bg=[data[0],data[1],data[2]],dist=i=>Math.hypot(data[i]-bg[0],data[i+1]-bg[1],data[i+2]-bg[2]);
 const seen=new Uint8Array(w*h),stack=[];
 for(let x=0;x<w;x++)stack.push([x,0],[x,h-1]);for(let y=0;y<h;y++)stack.push([0,y],[w-1,y]);
 while(stack.length){const [x,y]=stack.pop();if(x<0||y<0||x>=w||y>=h||seen[y*w+x])continue;const i=at(x,y),d=dist(i);if(d>42)continue;seen[y*w+x]=1;data[i+3]=Math.round(255*Math.max(0,Math.min(1,(d-16)/26)));stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
 await sharp(data,{raw:{width:w,height:h,channels:4}}).trim().webp({quality:92,alphaQuality:100}).toFile(`assets/${name}.webp`);
 console.log(`assets/${name}.webp`);
}
await sharp('references/branding/chatgpt_generated_23.png').trim({threshold:4}).resize({width:1200,withoutEnlargement:true}).webp({quality:90,alphaQuality:100}).toFile('assets/logo-title.webp');
console.log('assets/logo-title.webp');
