'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'), site=path.join(root,'site');
const primary=[
'index.html','about.html','contact.html','services.html','tradies.html',
'services/software-development.html','locations/software-development-sydney.html',
'locations/software-development-nairobi.html','services/web-app-dev.html',
'services/websites.html','services/website-repairs.html','services/e-commerce.html',
'services/mobile-apps.html','services/cloud-solutions.html',
'services/network-solutions.html','services/hardware-solutions.html',
'services/it-support.html','services/desktop-apps.html',
'projects/jack-of-all-trades.html','projects/keus-logistics.html',
'projects/smartduka.html','estimate.html'
];
const read=file=>fs.readFileSync(path.join(site,file),'utf8');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"');
const getTitle=s=>decode(s.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'');
const getDesc=s=>decode(s.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]||'');
test('SEO priority pages use concise, distinct, factual titles and meta descriptions',()=>{
 const titles=new Map();
 for(const file of primary){
   const html=read(file),title=getTitle(html),desc=getDesc(html);
   assert.ok(title.length>20&&title.length<=60, file+' title length '+title.length);
   assert.ok(desc.length>70&&desc.length<=160, file+' description length '+desc.length);
   assert.equal((html.match(/<h1\b/gi)||[]).length,1,file+' H1 count');
   assert.ok(!titles.has(title),'duplicate title '+title+' ('+file+')');
   titles.set(title,file);
   assert.match(html,/<link rel="canonical" href="https:\/\/www\.dtbtech\.org\//,file+' canonical');
   for(const field of ['og:title','twitter:title']){
     const m=html.match(new RegExp('<meta\\s+property="'+field+'"\\s+content="([^"]*)"', 'i'));
     if(m)assert.equal(decode(m[1]),title,file+' '+field+' inconsistent');
   }
   for(const field of ['og:description','twitter:description']){
     const m=html.match(new RegExp('<meta\\s+property="'+field+'"\\s+content="([^"]*)"', 'i'));
     if(m)assert.equal(decode(m[1]),desc,file+' '+field+' inconsistent');
   }
   const scripts=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
   for(const script of scripts)assert.doesNotThrow(()=>JSON.parse(script[1]),file+' JSON-LD');
 }
});
test('Sydney and general software pages have separate commercial purposes and helpful answers',()=>{
 const general=read('services/software-development.html');
 const sydney=read('locations/software-development-sydney.html');
 assert.match(getTitle(general),/Business Software & Integrations/);
 assert.match(getTitle(sydney),/Software Development Sydney/);
 for(const q of ['What can custom business software solve?','Should we use an existing platform or build our own?',
                  'What changes the cost of a business software project?'])
   assert.ok(general.includes(q),'Missing useful answer: '+q);
 assert.ok(sydney.includes('Planning custom software for a Sydney business?'));
 assert.ok(sydney.includes('How much could it cost?'));
 assert.ok(sydney.includes('written proposal'));
 assert.ok(!sydney.includes('clear plan, timeline and fixed quote'),'no automatic fixed-quote promise');
 assert.ok(general.includes('href="../locations/software-development-sydney"'));
 assert.ok(general.includes('href="../locations/software-development-nairobi"'));
 assert.ok(sydney.includes('href="../estimate"'),'estimator is discoverable');
});
test('important page links are available in statically rendered HTML',()=>{
 const home=read('index.html'),services=read('services.html'),webapps=read('services/web-app-dev.html');
 assert.ok(home.includes('href="/locations/software-development-sydney"'));
 assert.ok(services.includes('href="locations/software-development-sydney"'));
 assert.ok(webapps.includes('href="../locations/software-development-sydney"'));
 assert.ok(home.includes('href="/tradies"'));
 assert.ok(read('services/software-development.html').includes('href="../projects/keus-logistics"'));
});
test('thin information hierarchy fixes keep Tech Lab heading structure accessible',()=>{
 const html=read('tech-lab.html');
 const levels=[...html.matchAll(/<h([1-6])\b/gi)].map(m=>Number(m[1]));
 assert.equal(levels[0],1);
 assert.ok(levels.every((n,i)=>i===0||n-levels[i-1]<=1),'heading levels skip');
 assert.equal((levels.filter(x=>x===1)).length,1);
});
test('audited noindex decision and scoped website maintenance statements remain accurate',()=>{
 const estimate=read('estimate.html');
 assert.match(estimate,/<meta\s+name="robots"\s+content="noindex, follow">/);
 assert.ok(!read('services/websites.html').includes("Updates, backups and support, included."));
 assert.ok(read('services/websites.html').includes('agreed maintenance plan'));
 const sitemap=read('sitemap.xml');
 assert.ok(!sitemap.includes('/estimate</loc>'),'noindex SmartQuote stays out of sitemap');
 for(const target of ['/services/software-development','/locations/software-development-sydney','/services/web-app-dev','/services/websites']){
   assert.ok(sitemap.includes('<loc>https://www.dtbtech.org'+target+'</loc><lastmod>2026-11-16</lastmod>'),target+' change date');
 }
});
