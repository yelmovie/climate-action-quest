// Cache outlined animation frames. Only the character's alpha is used as a mask.
const atlases = new WeakMap();
const frameHeight = 112;
const pad = 5;
export function drawMapSprite(ctx,img,sx,sy,sw,sh,x,y,w,h,pixelated=false){
  let frames=atlases.get(img);
  if(!frames){frames=new Map();atlases.set(img,frames);}
  const key=[sx,sy,sw,sh,pixelated].join(':');
  let frame=frames.get(key);
  if(!frame){
    const height=pixelated?sh:frameHeight,width=Math.max(1,Math.round(height*sw/sh));
    const canvas=document.createElement('canvas');
    canvas.width=width+pad*2;canvas.height=height+pad*2;
    const paint=canvas.getContext('2d');paint.imageSmoothingEnabled=!pixelated;
    for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2],[-1,-1],[-1,1],[1,-1],[1,1]]){
      const offset=pixelated?.65:1;
      paint.drawImage(img,sx,sy,sw,sh,pad+dx*offset,pad+dy*offset,width,height);
    }
    paint.globalCompositeOperation='source-in';
    paint.fillStyle='#fff4d2';paint.fillRect(0,0,canvas.width,canvas.height);
    paint.globalCompositeOperation='source-over';
    paint.drawImage(img,sx,sy,sw,sh,pad,pad,width,height);
    frame={canvas,width,height};frames.set(key,frame);
  }
  const px=pad*w/frame.width,py=pad*h/frame.height;
  const smoothing=ctx.imageSmoothingEnabled;
  if(pixelated)ctx.imageSmoothingEnabled=false;
  ctx.drawImage(frame.canvas,x-px,y-py,w+px*2,h+py*2);
  ctx.imageSmoothingEnabled=smoothing;
}
