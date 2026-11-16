'use strict';
// DTB deploys only explicit public website assets; do not publish the repository root.
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const site=path.join(root,'site');
const folders=['assets','components','css','dashboard','dist','js',
  'locations','projects','services','styles','tech-lab'];
const rootFile=/^(?:[^/]+\.html|[^/]+\.css|[^/]+\.png|[^/]+\.ico|[^/]+\.svg|robots\.txt|sitemap\.xml)$/;
fs.rmSync(site,{recursive:true,force:true});
fs.mkdirSync(site,{recursive:true});
for(const ent of fs.readdirSync(root,{withFileTypes:true})){
  if(ent.isFile()&&rootFile.test(ent.name)){
    fs.copyFileSync(path.join(root,ent.name),path.join(site,ent.name));
  }
}
for(const name of folders){
  const source=path.join(root,name);
  if(!fs.existsSync(source))throw Error('Required public site folder missing: '+name);
  fs.cpSync(source,path.join(site,name),{recursive:true});
}
for(const forbidden of ['api','docs','supabase','lib','src','tests','reports','.git','package.json','server.js','vercel.json']){
  if(fs.existsSync(path.join(site,forbidden)))throw Error('Internal material found in public output: '+forbidden);
}
console.log('Prepared allowlisted public website at site/ (internal files excluded).');
