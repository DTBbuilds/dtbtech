'use strict';
// Optional secure SmartQuote enquiry submission. Fails closed until explicitly
// activated AND private DTB inbox ownership / monitoring are ready.
// Reuses existing DTB2 public.enquiry_intake, never inserts directly from client.
const {estimate,normalize} = require('../lib/smartquote-pricing');
const MAX_BYTES=12*1024;
const LIMIT=4,WINDOW=3600000;
const recent=new Map();
const REGIONS=new Set(['Australia','Kenya','Other']);
const CONTACTS=new Set(['email','phone','whatsapp']);
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function settings(){
  const e=process.env;
  const url=String(e.DTB_INTAKE_SUPABASE_URL||'').replace(/\/$/,'');
  const key=String(e.DTB_INTAKE_SERVICE_KEY||'');
  const secret=String(e.DTB_SMARTQUOTE_TURNSTILE_SECRET_KEY||'');
  const siteKey=String(e.DTB_SMARTQUOTE_TURNSTILE_SITE_KEY||'');
  const hostnames=String(e.DTB_SMARTQUOTE_HOSTNAMES||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  const enabled=e.DTB_SMARTQUOTE_SUBMIT_ENABLED==='true' &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) &&
    Boolean(key&&secret&&siteKey&&hostnames.length);
  return {enabled,url,key,secret,siteKey,hostnames};
}
function send(res,status,obj){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(status).json(obj)}
const string=(x,n=200)=>typeof x==='string'?x.trim().slice(0,n):'';
function validate(b){
  const f={};
  if(!b||typeof b!=='object'||Array.isArray(b))return {errors:{body:'invalid'}};
  const name=string(b.name,120),email=string(b.email,254).toLowerCase(),phone=string(b.phone,40);
  const preferred=string(b.preferredContact,20).toLowerCase();
  const region=string(b.region,25);
  const description=string(b.description,1100);
  const uuid=string(b.idempotencyKey,50);
  if(name.length<2)f.name='required';
  if(!REGIONS.has(region))f.region='invalid';
  if(!CONTACTS.has(preferred))f.preferredContact='invalid';
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))f.email='invalid';
  if(!email&&phone.replace(/\D/g,'').length<7)f.contact='email_or_phone_required';
  if(preferred==='email'&&!email)f.email='required_for_email';
  if(preferred!=='email'&&phone.replace(/\D/g,'').length<7)f.phone='required_for_phone';
  if(description.length<15)f.description='too_short';
  if(!UUID.test(uuid))f.idempotency='invalid';
  if(b.consentGiven!==true)f.consent='required';
  if(string(b.website,250))f.bot='honeypot';
  if(Number(b.elapsedMs)<1200 || !Number.isFinite(Number(b.elapsedMs)))f.bot='timing';
  const token=string(b.turnstileToken,2050);
  if(!token||token.length>2048)f.turnstile='missing';
  return {errors:f,token,record:{name,email,phone,preferred,region,description,uuid},scope:normalize({
    category:b.category,features:b.features,pages:b.pages,staff:b.staff,
    region:b.region,description,timeframe:b.timeframe
  })};
}
function originAllowed(req,config){
  const origin=req.headers.origin;
  if(!origin)return false; // Browser-only form, origin required to prevent surprise cross-origin submissions.
  try{
    const u=new URL(origin);
    return u.protocol==='https:'&&config.hostnames.includes(u.hostname.toLowerCase())&&
      String(req.headers.host||'').toLowerCase()===u.host.toLowerCase();
  }catch{return false}
}
function limited(req){
  const key=String(req.headers['x-real-ip']||req.socket?.remoteAddress||'unknown').slice(0,80);
  const now=Date.now(),a=(recent.get(key)||[]).filter(t=>now-t<WINDOW);
  if(recent.size>1500)recent.clear();
  if(a.length>=LIMIT){recent.set(key,a);return true;}
  a.push(now);recent.set(key,a);return false;
}
async function readBody(req){
  if(req.body!==undefined){if(typeof req.body==='string'){try{return JSON.parse(req.body)}catch{return null}}return req.body;}
  return new Promise(resolve=>{
    let s='',size=0,tooLarge=false;
    req.on('data',x=>{size+=x.length;if(size>MAX_BYTES)tooLarge=true;else s+=x.toString('utf8')});
    req.on('end',()=>{if(tooLarge)return resolve('too_large');try{resolve(JSON.parse(s))}catch{return resolve(null)}});
    req.on('error',()=>resolve(null));
  });
}
async function siteverify(token,config){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6500);
  try{
    const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},
      body:JSON.stringify({secret:config.secret,response:token})
    });
    if(!r.ok)return false;
    const result=await r.json();
    return result.success===true&&result.action==='dtb_smartquote'&&
      config.hostnames.includes(String(result.hostname||'').toLowerCase());
  }catch{return false}finally{clearTimeout(timer)}
}
async function storage(config,method,route,data){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
  try{
    return await fetch(config.url+'/rest/v1/'+route,{
      method,signal:controller.signal,
      headers:{
        apikey:config.key,
        ...(config.key.startsWith('sb_secret_')?{}:{Authorization:'Bearer '+config.key}),
        'Content-Type':'application/json',
        Prefer:'return=representation'
      },
      ...(data?{body:JSON.stringify(data)}:{})
    });
  }finally{clearTimeout(timer)}
}
async function handler(req,res){
  const config=settings();
  if(req.method==='GET')return send(res,200,{
    ok:true,enabled:config.enabled,siteKey:config.enabled?config.siteKey:null
  });
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(res,405,{ok:false,error:'method_not_allowed'})}
  if(!config.enabled)return send(res,503,{ok:false,error:'not_configured'});
  if(!originAllowed(req,config))return send(res,403,{ok:false,error:'origin_rejected'});
  if(!String(req.headers['content-type']||'').includes('application/json'))return send(res,415,{ok:false,error:'content_type'});
  if(Number(req.headers['content-length'])>MAX_BYTES)return send(res,413,{ok:false,error:'too_large'});
  if(limited(req))return send(res,429,{ok:false,error:'rate_limited'});
  const body=await readBody(req);
  if(body==='too_large'||(body&&JSON.stringify(body).length>MAX_BYTES))return send(res,413,{ok:false,error:'too_large'});
  const {errors,token,record,scope}=validate(body);
  if(errors.bot)return send(res,400,{ok:false,error:'rejected'});
  if(Object.keys(errors).length)return send(res,400,{ok:false,error:'validation',fields:errors});
  if(!(await siteverify(token,config)))return send(res,403,{ok:false,error:'verification_failed'});
  const quote=estimate(scope);
  const summary=[
    'DTB SmartQuote planning enquiry — not an accepted fixed quote',
    'Requirements: '+record.description,
    'Project route: '+quote.categoryLabel,
    'Approximate pages/screens: '+scope.pages,
    'Features: '+scope.features.join(', '),
    'Staff: '+scope.staff,
    'Indicative AU estimate: '+(quote.priced?'A$'+quote.low+'–A$'+quote.high:'manual regional quote required'),
    'Pricing baseline: '+quote.pricingVersion,
    'The customer requests a human-reviewed written quote.'
  ].join('\n').slice(0,3900);
  const data={
    idempotency_key:record.uuid,
    contact_name:record.name,email:record.email||null,phone:record.phone||null,
    business_name:string(body.business,120)||null,
    service_required:'Other / not sure',
    country:record.region,project_description:summary,
    budget:string(body.budget,60)||null,timeframe:string(body.timeframe,60)||null,
    preferred_contact:record.preferred,source_page:'estimate',
    consent_given:true,
    consent_text:'I agree that DTB Technologies may contact me about this project enquiry.',
    email_consent:false
  };
  let r;
  try{r=await storage(config,'POST','enquiry_intake',data)}
  catch{return send(res,502,{ok:false,error:'store_unavailable'})}
  if(r.status===409){
    try{
      const check=await storage(config,'GET','enquiry_intake?idempotency_key=eq.'+encodeURIComponent(record.uuid)+'&select=lead_reference');
      const rows=check.ok?await check.json():[];
      if(Array.isArray(rows)&&rows[0]?.lead_reference)return send(res,200,{ok:true,reference:rows[0].lead_reference,duplicate:true});
    }catch{/* not proof of successful submission */}
    return send(res,409,{ok:false,error:'duplicate_unconfirmed'});
  }
  if(!r.ok)return send(res,502,{ok:false,error:'store_failed'});
  let rows;try{rows=await r.json()}catch{rows=[]}
  if(!Array.isArray(rows)||!rows[0]?.lead_reference)return send(res,502,{ok:false,error:'store_unconfirmed'});
  return send(res,201,{ok:true,reference:rows[0].lead_reference,duplicate:false});
}
module.exports=handler;
module.exports._test={settings,validate,originAllowed,siteverify};
