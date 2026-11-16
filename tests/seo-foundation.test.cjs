'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const site=path.join(root,'site');
const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
test('Vercel serves only the allowlisted output rather than the repository root',()=>{
  assert.equal(config.outputDirectory,'site');
  const required=['index.html','404.html','estimate.html','tradies.html','sitemap.xml',
    'robots.txt','components/nav-header.js','js/smartquote.js','dist/output.css',
    'services/software-development.html','dashboard/enquiries.html',
    'assets/projects/keus-logistics-screen.jpg'];
  for(const file of required)assert.ok(fs.existsSync(path.join(site,file)),file+' absent');
  for(const forbidden of ['api','docs','supabase','lib','src','tests','reports','server.js',
    'vercel.json','package.json','.gitignore']){
    assert.equal(fs.existsSync(path.join(site,forbidden)),false,forbidden+' leaked');
  }
});
test('Vercel 404 fallback and internal noindex routing preserve public endpoints',()=>{
  const routes=config.rewrites;
  assert.deepEqual(routes.slice(-1),[{source:'/:path*',destination:'/api/not-found'}]);
  for(const section of ['/docs/:path*','/supabase/:path*']){
    assert.ok(routes.some(x=>x.source===section&&x.destination==='/api/not-found'));
  }
  for(const section of ['/dashboard','/dashboard/:path*']){
    assert.ok(config.headers.some(h=>h.source===section&&h.headers.some(x=>x.key==='X-Robots-Tag'&&x.value.includes('noindex'))));
  }
  const notFound=require('../api/not-found');
  const headers={};
  const res={statusCode:200,setHeader:(k,v)=>headers[k]=v,end(value){this.body=value}};
  notFound({},res);
  assert.equal(res.statusCode,404);
  assert.match(headers['X-Robots-Tag'],/noindex/);
  assert.match(res.body,/Page not found/);
});
test('sitemap contains canonical www URLs for public, existing, indexable pages',()=>{
  const xml=fs.readFileSync(path.join(site,'sitemap.xml'),'utf8');
  assert.match(xml,/<urlset\s/);
  assert.ok(xml.includes('<loc>https://www.dtbtech.org/tradies</loc>'));
  assert.ok(xml.includes('<loc>https://www.dtbtech.org/locations/software-development-sydney</loc>'));
  assert.ok(!xml.includes('https://dtbtech.org/'));
  assert.ok(!xml.includes('/dashboard'));
  assert.ok(!xml.includes('/estimate</loc>'),'noindex estimator should not enter sitemap yet');
  const locations=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.equal(new Set(locations).size,locations.length,'duplicate sitemap URL');
  for(const url of locations){
    const pathname=new URL(url).pathname;
    const file=pathname==='/'?'index.html':pathname.slice(1)+'.html';
    assert.ok(fs.existsSync(path.join(site,file)),'sitemap includes missing page '+pathname);
  }
});
test('public pages declare consistent canonical host and do not leak apex SEO metadata',()=>{
  function walk(dir){
    return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
      const f=path.join(dir,e.name);
      return e.isDirectory()?walk(f):f.endsWith('.html')?[f]:[];
    });
  }
  for(const file of walk(site)){
    const rel=path.relative(site,file).replaceAll(path.sep,'/');
    if(rel.startsWith('dashboard/')||rel==='dashboard.html'||rel==='404.html')continue;
    const text=fs.readFileSync(file,'utf8');
    assert.ok(!text.includes('https://dtbtech.org/'),'apex URL in '+rel);
    if(rel==='estimate.html'){
      assert.match(text,/<meta name="robots" content="noindex, follow">/);
      continue;
    }
    assert.match(text,/<link rel="canonical" href="https:\/\/www\.dtbtech\.org\//,rel+' missing www canonical');
  }
});
