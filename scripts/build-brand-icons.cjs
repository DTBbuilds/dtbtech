'use strict';
/** Rasterises the traced brand emblem with Node built-ins only, no remote assets. */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = process.env.DTB_BRAND_ROOT || path.resolve(__dirname,'..');
const site = process.env.DTB_BRAND_OUTPUT || path.join(root,'site');
const source = fs.readFileSync(path.join(root,'favicon.svg'),'utf8');
const vb = /viewBox="0 0 (\d+) (\d+)"/.exec(source);
if(!vb)throw Error('Brand icon SVG viewBox not found');
const sw=+vb[1],sh=+vb[2];
const groups = [...source.matchAll(/<path fill="(#[0-9a-fA-F]{6})"[^>]* d="([^"]+)"\s*\/>/g)]
  .map(([,color,d])=>({color:color.match(/\w\w/g).map(x=>parseInt(x,16)),polygons:[...d.matchAll(/M([^Z]+)Z/g)].map(([,coords])=>[...coords.matchAll(/(\d+),(\d+)/g)].map(m=>[+m[1],+m[2]]))}));
if(groups.length!==2 || groups.some(x=>!x.polygons.length))throw Error('Expected the gold web and dark spider path groups');
const crcTable = Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++) c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0});
function crc32(buf){let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function chunk(name,data){const h=Buffer.alloc(8);h.writeUInt32BE(data.length,0);h.write(name,4,'ascii');const tail=Buffer.alloc(4);tail.writeUInt32BE(crc32(Buffer.concat([Buffer.from(name),data])),0);return Buffer.concat([h,data,tail])}
function png(size,rgb){const row=1+size*3,bytes=Buffer.alloc(size*row);for(let y=0;y<size;y++){let dst=y*row+1,src=y*size*3;rgb.copy(bytes,dst,src,src+size*3)}const ih=Buffer.alloc(13);ih.writeUInt32BE(size,0);ih.writeUInt32BE(size,4);ih[8]=8;ih[9]=2;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(bytes,{level:9})),chunk('IEND',Buffer.alloc(0))])}
function render(size,maskable=false){
 const ss=size<=64?3:(size<=192?2:1),n=size*ss;
 const bg=[253,250,241],pixels=Buffer.alloc(n*n*3);
 for(let i=0;i<pixels.length;i+=3){pixels[i]=bg[0];pixels[i+1]=bg[1];pixels[i+2]=bg[2]}
 // Maskable icons put the entire hexagon inside the central 70% safe area.
 const scale=maskable?0.70:1;const px=(x)=>(x/sw-.5)*scale+.5;
 const py=(y)=>(y/sh-.5)*scale+.5;
 const prepared=groups.map(g=>({...g,polygons:g.polygons.map(poly=>poly.map(([x,y])=>[px(x)*n,py(y)*n]))}));
 for(const group of prepared){
  for(let y=0;y<n;y++){
   const yy=y+0.5, intersections=[];
   for(const polygon of group.polygons){
    let j=polygon.length-1;
    for(let i=0;i<polygon.length;i++){
     const [x1,y1]=polygon[j],[x2,y2]=polygon[i];
     if((y1<=yy&&yy<y2)||(y2<=yy&&yy<y1)) intersections.push(x1+(yy-y1)*(x2-x1)/(y2-y1));
     j=i;
    }
   }
   intersections.sort((a,b)=>a-b);
   for(let k=0;k+1<intersections.length;k+=2){
    const from=Math.max(0,Math.ceil(intersections[k]-.5));
    const to=Math.min(n,Math.ceil(intersections[k+1]-.5));
    for(let x=from;x<to;x++){
      const idx=(y*n+x)*3;
      pixels[idx]=group.color[0];pixels[idx+1]=group.color[1];pixels[idx+2]=group.color[2];
    }
   }
  }
 }
 if(ss===1)return png(size,pixels);
 const out=Buffer.alloc(size*size*3);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const sum=[0,0,0];
   for(let v=0;v<ss;v++)for(let h=0;h<ss;h++){
      const at=(((y*ss+v)*n)+(x*ss+h))*3;
      for(let c=0;c<3;c++)sum[c]+=pixels[at+c];
   }
   for(let c=0;c<3;c++)out[(y*size+x)*3+c]=Math.round(sum[c]/(ss*ss));
 }
 return png(size,out);
}
function ico(map){const entries=Object.entries(map).map(([size,data])=>({size:+size,data}));const header=Buffer.alloc(6+16*entries.length);header.writeUInt16LE(1,2);header.writeUInt16LE(entries.length,4);let offset=header.length;for(let i=0;i<entries.length;i++){
const {size,data}=entries[i],j=6+i*16;header[j]=size===256?0:size;header[j+1]=size===256?0:size;header.writeUInt16LE(1,j+4);header.writeUInt16LE(32,j+6);header.writeUInt32LE(data.length,j+8);header.writeUInt32LE(offset,j+12);offset+=data.length}return Buffer.concat([header,...entries.map(e=>e.data)])}
function save(rel,data){const fp=path.join(site,rel);fs.mkdirSync(path.dirname(fp),{recursive:true});fs.writeFileSync(fp,data);console.log('Brand icon',rel,data.length,'bytes')}
const sizes={};for(const n of [16,32,48,180,192,256,512])sizes[n]=render(n);
save('favicon-16x16.png',sizes[16]);save('favicon-32x32.png',sizes[32]);save('favicon-48x48.png',sizes[48]);save('favicon.ico',ico({16:sizes[16],32:sizes[32],48:sizes[48],256:sizes[256]}));
save('apple-touch-icon.png',sizes[180]);save('assets/dtb-logo.png',sizes[192]);save('assets/brand/spider-192.png',sizes[192]);save('assets/brand/spider-512.png',sizes[512]);save('assets/brand/spider-maskable-512.png',render(512,true));
const manifest={name:'DTB Technologies',short_name:'DTB',description:'Websites, business software, and project quotes.',start_url:'/',scope:'/',display:'standalone',background_color:'#fdfaf1',theme_color:'#0f172a',icons:[
{src:'/assets/brand/spider-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
{src:'/assets/brand/spider-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
{src:'/assets/brand/spider-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]};
save('site.webmanifest',JSON.stringify(manifest,null,2)+'\n');