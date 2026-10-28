export const world={width:1672,height:941,spawn:{x:500,y:603},radius:27,
 nodes:[[320,780],[420,744],[500,603],[463,499],[390,360],[390,300],[600,348],[800,305],[903,280],[970,321],[1040,380],[1160,385],[1292,394],[960,435],[900,520],[1000,630],[1020,800],[850,788],[858,733],[1130,797],[1300,800],[1300,768],[640,650]],
 edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[6,7],[7,8],[7,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[16,17],[17,18],[16,19],[19,20],[20,21],[2,22],[22,17]],
 buildings:[{stage:0,node:5,label:{x:350,y:145}},{stage:1,node:8,label:{x:900,y:100}},{stage:2,node:12,label:{x:1365,y:229}},{stage:3,node:21,label:{x:1320,y:601}},{stage:4,node:18,label:{x:857,y:547}},{stage:5,node:0,label:{x:267,y:603}}]};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const nodePoint=i=>({x:world.nodes[i][0],y:world.nodes[i][1]});
export function projectPath(p){let best;world.edges.forEach(([a,b],edge)=>{const A=nodePoint(a),B=nodePoint(b),dx=B.x-A.x,dy=B.y-A.y,t=Math.max(0,Math.min(1,((p.x-A.x)*dx+(p.y-A.y)*dy)/(dx*dx+dy*dy))),q={x:A.x+dx*t,y:A.y+dy*t};const d=distance(p,q);if(!best||d<best.distance)best={...q,edge,t,distance:d};});return best;}
export function isWalkable(p){return Number.isFinite(p.x)&&Number.isFinite(p.y)&&projectPath(p).distance<=world.radius;}
export function routeTo(from,to){
 const a=projectPath(from),b=projectPath(to);
 if(a.edge===b.edge)return [{x:b.x,y:b.y}];
 const n=world.nodes.length,points=world.nodes.map((_,i)=>nodePoint(i)).concat([a,b]);
 const edges=world.edges.concat(world.edges[a.edge].map(i=>[n,i]),world.edges[b.edge].map(i=>[n+1,i]));
 const distances=Array(n+2).fill(Infinity),prev=Array(n+2).fill(-1),pending=new Set(points.map((_,i)=>i));distances[n]=0;
 while(pending.size){let u=-1;for(const i of pending)if(u<0||distances[i]<distances[u])u=i;if(!Number.isFinite(distances[u]))return [];pending.delete(u);if(u===n+1)break;for(const [x,y] of edges){const v=x===u?y:y===u?x:-1;if(v<0||!pending.has(v))continue;const alt=distances[u]+distance(points[u],points[v]);if(alt<distances[v]){distances[v]=alt;prev[v]=u;}}}
 const result=[];let i=n+1;while(i!==n&&i>=0){result.unshift({x:points[i].x,y:points[i].y});i=prev[i];}return result;
}
export function inputVector(keys){const x=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA')),y=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'));const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};}
