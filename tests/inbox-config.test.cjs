'use strict';
const assert=require('node:assert/strict');
const handler=require('../api/inbox-config');
function req(method='GET'){return {method};}
function res(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;}};}
const vars=['DTB_INBOX_ENABLED','DTB_INBOX_SUPABASE_URL','DTB_INBOX_PUBLISHABLE_KEY'];
const original=Object.fromEntries(vars.map(k=>[k,process.env[k]]));
try{
 for(const k of vars)delete process.env[k];
 let x=res();handler(req(),x);
 assert.equal(x.body.enabled,false);
 process.env.DTB_INBOX_ENABLED='true';
 process.env.DTB_INBOX_SUPABASE_URL='https://validtest.supabase.co';
 process.env.DTB_INBOX_PUBLISHABLE_KEY='sb_publishable_abcdefghijklmnop';
 x=res();handler(req(),x);
 assert.equal(x.body.enabled,true);
 assert.equal(x.body.publishableKey,process.env.DTB_INBOX_PUBLISHABLE_KEY);
 assert.ok(!JSON.stringify(x.body).includes('DTB_INTAKE_SERVICE_KEY'));
 assert.equal(x.headers['Cache-Control'],'no-store');
 x=res();handler(req('POST'),x);assert.equal(x.statusCode,405);
 console.log('ALL_INBOX_CONFIG_TESTS_PASS');
}finally{
 for(const k of vars){if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k];}
}
