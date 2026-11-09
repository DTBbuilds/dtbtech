// Standalone, zero-network tests for DTB-CONVERT-011 (Node 18+).
'use strict';
const assert=require('node:assert/strict');
const handler=require('../api/enquiry');
const {validate}=handler._test;
function req(method='GET',body,ip='192.0.2.8',origin='https://dtbtech.org'){
  return {method,body,headers:{'content-type':'application/json',origin,'x-real-ip':ip},socket:{remoteAddress:ip}};
}
function res(){
  const obj={code:0,body:null,headers:{}};
  obj.setHeader=(k,v)=>{obj.headers[k]=v;return obj};
  obj.status=n=>{obj.code=n;return obj};
  obj.json=b=>{obj.body=b;return obj};
  return obj;
}
function env(on){
  for(const k of ['DTB_INTAKE_ENABLED','DTB_INTAKE_SUPABASE_URL','DTB_INTAKE_SERVICE_KEY','DTB_TURNSTILE_SECRET_KEY','DTB_TURNSTILE_SITE_KEY','DTB_TURNSTILE_HOSTNAMES'])delete process.env[k];
  if(on){
    Object.assign(process.env,{
      DTB_INTAKE_ENABLED:'true',DTB_INTAKE_SUPABASE_URL:'https://dtbtest.supabase.co',
      DTB_INTAKE_SERVICE_KEY:'LOCAL_FAKE_KEY',DTB_TURNSTILE_SECRET_KEY:'LOCAL_FAKE_SECRET',
      DTB_TURNSTILE_SITE_KEY:'LOCAL_PUBLIC_KEY',DTB_TURNSTILE_HOSTNAMES:'dtbtech.org'
    });
  }
}
function payload(){return {
  name:'Jane Business',business:'Test Painting',email:'jane@example.com',phone:'',
  service:'Business website',description:'New mobile friendly website with an enquiry form.',
  region:'Australia',budget:'AUD 2500',timeframe:'Flexible / not sure',
  preferredContact:'email',sourcePage:'contact',consentGiven:true,
  website:'',elapsedMs:2000,turnstileToken:'LOCAL_FAKE_TOKEN',
  idempotencyKey:'4e00ce8a-0786-4c10-a5c4-1f2c7c5ba001'
}}
function mockFetch(insertStatus=201){
  const urls=[];
  global.fetch=async (url,opts)=>{
    urls.push({url:String(url),method:opts?.method});
    if(String(url).includes('siteverify'))return {ok:true,json:async()=>({success:true,action:'dtb_enquiry',hostname:'dtbtech.org'})};
    if(String(url).includes('idempotency_key=eq.'))return {ok:true,status:200,json:async()=>[{reference:'DTB-20261110-ABCDEF123456'}]};
    return {ok:insertStatus<400,status:insertStatus,json:async()=>insertStatus===201?[{reference:'DTB-20261110-ABCDEF123456'}]:{}};
  };
  return urls;
}
async function run(){
  const originalFetch=global.fetch;
  try{
    env(false);
    let r=res();await handler(req('GET'),r);
    assert.equal(r.code,200);assert.equal(r.body.enabled,false);
    r=res();await handler(req('POST',payload()),r);
    assert.equal(r.code,503);assert.equal(r.body.error,'not_configured');
    console.log('PASS config fail-closed');
    env(true);
    r=res();await handler(req('GET'),r);
    assert.equal(r.body.enabled,true);assert.equal(r.body.siteKey,'LOCAL_PUBLIC_KEY');
    console.log('PASS public config exposes only site key');
    r=res();await handler(req('POST',payload(),'192.0.2.10','https://evil.example'),r);
    assert.equal(r.code,403);assert.equal(r.body.error,'origin_rejected');
    console.log('PASS cross-origin rejected');
    r=res();await handler(req('POST',{...payload(),website:'bot'},'192.0.2.11'),r);
    assert.equal(r.code,400);assert.equal(r.body.error,'rejected');
    console.log('PASS honeypot');
    for(const [delta,field] of [[{consentGiven:false},'consent'],[{email:''},'contact'],[{turnstileToken:''},'turnstile'],[{idempotencyKey:'bad'},'idempotency'],[{service:'invalid'},'service']]){
      const d=validate({...payload(),...delta});
      assert.ok(d.fields[field],field);
    }
    console.log('PASS invalid consent/contact/challenge/idempotency/service');
    const calls=mockFetch();
    r=res();await handler(req('POST',payload(),'192.0.2.12'),r);
    assert.equal(r.code,201);assert.equal(r.body.reference,'DTB-20261110-ABCDEF123456');
    assert.equal(calls.length,2);
    assert.ok(calls[1].url.endsWith('/rest/v1/dtb_enquiries'));
    console.log('PASS valid challenge then confirmed insert');
    mockFetch(409);
    r=res();await handler(req('POST',payload(),'192.0.2.13'),r);
    assert.equal(r.code,200);assert.equal(r.body.duplicate,true);
    console.log('PASS idempotent retry');
    mockFetch(503);
    r=res();await handler(req('POST',payload(),'192.0.2.14'),r);
    assert.equal(r.code,502);assert.equal(r.body.error,'store_failed');
    console.log('PASS DB failure never acknowledged');
    const fail=mockFetch();global.fetch=async(u,o)=>String(u).includes('siteverify')?{ok:true,json:async()=>({success:false})}:fail(u,o);
    r=res();await handler(req('POST',payload(),'192.0.2.15'),r);
    assert.equal(r.code,403);assert.equal(r.body.error,'verification_failed');
    console.log('PASS invalid anti-bot token rejects');
    console.log('ALL_INTAKE_HANDLER_TESTS_PASSED');
  }finally{global.fetch=originalFetch;env(false);}
}
run().catch(e=>{console.error(e);process.exitCode=1});
