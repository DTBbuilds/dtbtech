'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const site=path.join(root,'site');
function bytes(rel){return fs.readFileSync(path.join(site,rel))}
function pngSize(rel){
  const b=bytes(rel);assert.deepEqual([...b.subarray(0,8)],[137,80,78,71,13,10,26,10],rel+' PNG signature');
  return [b.readUInt32BE(16),b.readUInt32BE(20)];
}
test('all production icon formats use generated spider artwork',()=>{
  for(const [file,expected] of [['favicon-16x16.png',16],['favicon-32x32.png',32],
    ['favicon-48x48.png',48],['apple-touch-icon.png',180],
    ['assets/dtb-logo.png',192],['assets/brand/spider-192.png',192],
    ['assets/brand/spider-512.png',512],['assets/brand/spider-maskable-512.png',512]]){
    assert.deepEqual(pngSize(file),[expected,expected],file+' dimensions');
  }
  const ico=bytes('favicon.ico');
  assert.equal(ico.readUInt16LE(0),0);
  assert.equal(ico.readUInt16LE(2),1);
  assert.equal(ico.readUInt16LE(4),4,'ICO contains 16,32,48,256 sizes');
  assert.match(fs.readFileSync(path.join(site,'favicon.svg'),'utf8'),/DTB Technologies spider and web emblem/);
  assert.ok(bytes('assets/dtb-logo.png').equals(bytes('assets/brand/spider-192.png')),'brand icon must match logo asset');
});
test('app manifest has square Android icons and a padded maskable icon',()=>{
  const json=JSON.parse(bytes('site.webmanifest').toString('utf8'));
  assert.equal(json.name,'DTB Technologies');
  assert.equal(json.start_url,'/');
  assert.equal(json.scope,'/');
  assert.equal(json.display,'standalone');
  for(const icon of json.icons){
    assert.ok(icon.src.startsWith('/assets/brand/spider-'),icon.src);
    assert.ok(fs.existsSync(path.join(site,icon.src.slice(1))),icon.src);
    assert.match(icon.type,/image\/png/);
  }
  assert.ok(json.icons.some(x=>x.sizes==='192x192'&&x.purpose==='any'));
  assert.ok(json.icons.some(x=>x.sizes==='512x512'&&x.purpose==='any'));
  assert.ok(json.icons.some(x=>x.sizes==='512x512'&&x.purpose==='maskable'));
});
test('every page declares consistent site favicon, iOS icon and manifest',()=>{
  function walk(directory){
    return fs.readdirSync(directory,{withFileTypes:true}).flatMap(x=>{
      const p=path.join(directory,x.name);
      return x.isDirectory()?walk(p):x.isFile()&&p.endsWith('.html')?[p]:[];
    });
  }
  let checked=0;
  for(const file of walk(site)){
    const html=fs.readFileSync(file,'utf8');
    if(!/<head\b[^>]*>/i.test(html))continue;
    assert.equal((html.match(/href="\/favicon.svg"/g)||[]).length,1,file+' favicon');
    assert.equal((html.match(/href="\/favicon-48x48.png"/g)||[]).length,1,file+' Google 48 favicon');
    assert.equal((html.match(/href="\/apple-touch-icon.png"/g)||[]).length,1,file+' iOS app icon');
    assert.equal((html.match(/href="\/site.webmanifest"/g)||[]).length,1,file+' manifest');
    checked++;
  }
  assert.ok(checked>=40,'unexpected public HTML count '+checked);
});
test('navigation, footer and structured company identity reference new spider assets',()=>{
  const nav=fs.readFileSync(path.join(site,'components/nav-header.js'),'utf8');
  const footer=fs.readFileSync(path.join(site,'components/site-footer.js'),'utf8');
  const home=fs.readFileSync(path.join(site,'index.html'),'utf8');
  const about=fs.readFileSync(path.join(site,'about.html'),'utf8');
  assert.match(nav,/assets\/brand\/spider-192\.png/);
  assert.match(footer,/assets\/brand\/spider-192\.png/);
  assert.ok(!nav.includes('assets/dtb-logo.png'));
  assert.ok(!footer.includes('assets/dtb-logo.png'));
  assert.match(home,/https:\/\/www\.dtbtech\.org\/assets\/brand\/spider-512\.png/);
  assert.match(about,/https:\/\/www\.dtbtech\.org\/assets\/brand\/spider-512\.png/);
});
