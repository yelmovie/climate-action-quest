// Generated illustrations carry places and objects; motion/data remain deterministic.
export const FPS=24,SECONDS=9;
export const ART_IDS=['scene-observe','scene-classroom','scene-cooling','scene-forest','scene-repair','scene-power','scene-home','scene-reuse','scene-heat','scene-commute','trees','shade','pond','refuge','ground','beach','road','wetland','homes','park','school'];
let artwork={};
export function configureArt(images){artwork=images;}
const C={ink:'#173f42',green:'#1e665b',mint:'#bad7b2',gold:'#ffd574',blue:'#61adca',rust:'#cc8550',paper:'#fffbed'};
const p=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
const ease=t=>t*t*(3-2*t);
const rect=(x,y,w,h,fill,rx=16)=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${Math.max(0,h)}" rx="${rx}" fill="${fill}"/>`;
const path=(d,stroke=C.green,width=8)=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const arrow=(x,y,length,color=C.green)=>path(`M${x} ${y}h${length}m-18-18 18 18-18 18`,color);
const art=(id,x,y,w,h,cover=false)=>{if(!artwork[id])throw Error('Missing concept art: '+id);return `<image href="${artwork[id]}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${cover?'xMidYMid slice':'xMidYMid meet'}"/>`;};
const panel=(x,y,w,h)=>rect(x,y,w,h,'#fffdf3f2',22)+`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="none" stroke="#aac8ac" stroke-width="3"/>`;
const check=(x,y,alpha=1)=>`<g opacity="${alpha}">${circle(x,y,27,C.green)}${path(`M${x-13} ${y}l9 10 19-21`,C.paper,6)}</g>`;
function graph(t,index){
 const reveal=ease(p(t,2.7,5.8)),settle=ease(p(t,6,7.8));
 let out=art('scene-observe',40,40,1200,640,true);
 out+=`<g opacity="${reveal}">${panel(610,100,585,510)}${path('M665 520H1145M665 520V175','#8aa697',4)}`;
 const past=[82,105,91,110],later=index===0?[145,180,217,260]:[140,174,208,248];
 for(let i=0;i<4;i++){const x=700+i*110;out+=rect(x,520-past[i],34,past[i],C.mint,5)+rect(x+40,520-later[i]*reveal,34,later[i]*reveal,C.green,5);}
 out+=`<g opacity="${settle}">${arrow(705,560,400)}${check(1135,160)}</g></g>`;
 return out;
}
function story(t,index){
 const sequence=index===2?['scene-classroom','scene-repair','trees']:index===3?['scene-classroom','scene-cooling','scene-power']:['scene-home','scene-reuse','scene-heat'];
 const shot=Math.min(2,Math.floor(t/3)),elapsed=t-shot*3;
 let out=sequence[shot]==='trees'
  ?panel(170,70,940,560)+art('trees',260,80,760,540)
  :art(sequence[shot],40,40,1200,640,true);
 // A small three-step marker matches the external DOM caption, not an invented causal diagram.
 out+=rect(526,638,228,24,'#fffdf3dc',12);
 for(let i=0;i<3;i++)out+=rect(542+i*68,646,52,8,i<=shot?C.green:'#c8d6c0',4);
 if(shot===2)out+=check(1180,100,ease(p(elapsed,.15,.7)));
 return out;
}
function water(t){
 const rise=ease(p(t,2,5.7)),level=575-150*rise;
 let out=rect(50,60,1180,580,'#eaf5df',24);
 out+=`<path d="M70 550Q260 550 400 498T680 478Q790 444 875 403T1190 330V640H70Z" fill="#d4bd88" stroke="#9db473" stroke-width="4"/>`;
 const places=[['beach',180,550],['road',390,510],['wetland',565,490],['homes',760,448],['park',930,396],['school',1090,350]];
 for(const [id,x,y] of places)out+=art(id,x-100,y-155,200,160);
 out+=`<path d="M70 ${level}Q240 ${level-8} 410 ${level}T750 ${level}T1190 ${level}V640H70Z" fill="${C.blue}" opacity=".68"/>`;
 out+=path(`M75 ${level}H1185`,'#d4f6ff',5);
 out+=`<g opacity="${ease(p(t,6,7.7))}">${check(1100,175)}${path('M180 290v110m-16-16 16 16 16-16',C.rust,6)}</g>`;
 return out;
}
function effects(t){
 const stages=[['beach',80],['road',485],['refuge',890]];
 let out='';
 for(let i=0;i<stages.length;i++){
  const [id,x]=stages[i],visible=i===0?1:ease(p(t,i*2.4,i*2.4+.65));
  out+=`<g opacity="${visible}">${panel(x,160,310,380)}${art(id,x+12,190,286,285)}`;
  if(i<2)out+=rect(x+25,470,260,38,C.blue,12);
  if(i===2)out+=check(x+155,480);
  out+='</g>';
  if(i<2)out+=`<g opacity="${ease(p(t,(i+1)*2.4,(i+1)*2.4+.65))}">${arrow(x+332,350,52)}</g>`;
 }
 return out;
}
function comparison(t){
 const change=ease(p(t,3,5.8));
 let out=art('scene-commute',40,40,1200,640,true);
 out+=panel(110,360,470,275)+panel(700,360,470,275);
 const baseline=[130,100,130],alternative=[130-75*change,100,130-75*change];
 for(const [x,values,color] of [[205,baseline,C.rust],[795,alternative,C.green]])for(let i=0;i<3;i++)out+=rect(x+i*100,590-values[i],58,values[i],color,8);
 out+=arrow(608,494,64)+check(1115,410,ease(p(t,6,7.6)));
 return out;
}
function city(t,index){
 const ids=index===8?['trees','shade','pond','refuge','ground','trees']:['shade','pond','shade','pond','trees','trees'];
 const heat=[1,2,1,1,1,0],rain=[1,1,2,1,1,1],isRain=t>=4.4;
 let out=rect(52,65,1176,585,'#d9e9ce',26);
 for(let i=0;i<6;i++){
  const x=85+(i%3)*400,y=105+Math.floor(i/3)*265;
  const visible=index===9?1:ease(p(t,.4+i*.7,1.05+i*.7));
  out+=panel(x,y,310,235);
  out+=`<g opacity="${visible}">${art(ids[i],x+24,y+8,262,182)}</g>`;
  if(index===9){const risk=(isRain?rain:heat)[i];out+=rect(x+30,y+202,250,12,'#d9dfcf',6)+rect(x+30,y+202,risk/4*250,12,isRain?C.blue:C.rust,6);}
  else out+=`<g opacity="${visible}">${check(x+265,y+195)}</g>`;
 }
 if(index===9){
  if(isRain)out+=path('M1060 45l-8 18m43-18-8 18m43-18-8 18',C.blue,6);
  else out+=circle(1120,43,20,C.gold);
 }
 return out;
}
export function frame(index,seconds){
 const t=Math.min(seconds,8.2);
 const body=index<2?graph(t,index):index<4?story(t,index):index===4?water(t):index===5?effects(t):index===6?story(t,index):index===7?comparison(t):city(t,index);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">${rect(0,0,1280,720,C.paper,0)}${body}</svg>`;
}
