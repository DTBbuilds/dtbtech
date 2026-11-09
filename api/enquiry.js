'use strict';
// DTB-CONVERT-011: isolated lead intake. Disabled unless an explicitly dedicated
// DTB database, Turnstile protection and owner release flag are configured.
// NO browser credentials; NO dependency on CRM PR #2/#8.
const MAX_BYTES = 16 * 1024;
const SERVICES = new Set([
  'Business website','Website redesign or repair','Online store or booking website',
  'Custom web or mobile application','POS or business software',
  'Hosting, maintenance or IT support','Tradie website and quote flow',
  'Other / not sure'
]);
const REGIONS = new Set(['Australia','Kenya','Other / remote']);
const CONTACTS = new Set(['email','whatsapp','phone']);
const KEY_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const ipBuckets = new Map();
const limited = (req) => {
  const ip = String(req.headers['x-real-ip'] || req.socket?.remoteAddress || '').slice(0,100);
  if (!ip) return false;
  const now = Date.now();
  const old = (ipBuckets.get(ip) || []).filter(t => now-t < 3600000);
  if (ipBuckets.size > 5000) ipBuckets.clear();
  if (old.length >= 5) { ipBuckets.set(ip, old); return true; }
  old.push(now); ipBuckets.set(ip, old); return false;
};
const getSettings = () => {
  const e = process.env;
  const hostnames = (e.DTB_TURNSTILE_HOSTNAMES || '').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  const url = e.DTB_INTAKE_SUPABASE_URL || '';
  const enabled = e.DTB_INTAKE_ENABLED === 'true' &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url) &&
    Boolean(e.DTB_INTAKE_SERVICE_KEY && e.DTB_TURNSTILE_SECRET_KEY &&
      e.DTB_TURNSTILE_SITE_KEY && hostnames.length);
  return {enabled, url: url.replace(/\/$/,''), key:e.DTB_INTAKE_SERVICE_KEY,
    secret:e.DTB_TURNSTILE_SECRET_KEY, siteKey:e.DTB_TURNSTILE_SITE_KEY, hostnames};
};
const send = (res,code,obj) => {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  return res.status(code).json(obj);
};
const trim = (v,n) => typeof v === 'string' ? v.trim().slice(0,n) : '';
function validate(b) {
  if (!b || Array.isArray(b) || typeof b !== 'object') return {fields:{body:'invalid'}};
  const fields = {};
  const name = trim(b.name,120), email = trim(b.email,254).toLowerCase(),
    phone=trim(b.phone,40), service=trim(b.service,80),
    description=trim(b.description,4000), preferred=trim(b.preferredContact,20).toLowerCase(),
    region=trim(b.region,40), idempotency=trim(b.idempotencyKey,50);
  if (!name) fields.name='required';
  if (!SERVICES.has(service)) fields.service='invalid';
  if (description.length<15) fields.description='too_short';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fields.email='invalid';
  if (!email && phone.replace(/\D/g,'').length<7) fields.contact='email_or_phone_required';
  if (!CONTACTS.has(preferred)) fields.preferredContact='invalid';
  else if (preferred==='email' && !email) fields.email='required_for_preference';
  else if (preferred!=='email' && phone.replace(/\D/g,'').length<7) fields.phone='required_for_preference';
  if (!REGIONS.has(region)) fields.region='invalid';
  if (b.consentGiven!==true) fields.consent='required';
  if (trim(b.website,200)) fields.bot='detected';
  if (!KEY_RE.test(idempotency)) fields.idempotency='invalid';
  const elapsed=Number(b.elapsedMs);
  if (!Number.isFinite(elapsed) || elapsed<1200) fields.bot='invalid_timing';
  const token=trim(b.turnstileToken,2050);
  if (!token || token.length>2048) fields.turnstile='required';
  const source = trim(b.sourcePage,100);
  if (!['contact','tradies','estimate'].includes(source)) fields.source='invalid';
  return {fields,token,data:{
    idempotency_key:idempotency,
    contact_name:name, business_name:trim(b.business,80)||null,
    email:email||null, phone:phone||null, service_required:service,
    country:region, project_description:description,
    budget:trim(b.budget,60)||null, timeframe:trim(b.timeframe,60)||null,
    preferred_contact:preferred,
    source_page:source, consent_given:true,
    consent_text:'I agree that DTB Technologies may contact me about this project enquiry.'
  }};
}
function originAllowed(req,settings){
  const origin=req.headers.origin;
  if (!origin) return true;
  try { const u=new URL(origin);
    return u.protocol==='https:' && settings.hostnames.includes(u.hostname.toLowerCase());
  } catch { return false; }
}
async function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body==='string') { try{return JSON.parse(req.body)}catch{return null;} }
    return req.body;
  }
  return new Promise(resolve => {
    let raw='',over=false;
    req.on('data',part=>{raw+=part;if(raw.length>MAX_BYTES)over=true;});
    req.on('end',()=>{if(over) return resolve('too_large');
      try {resolve(JSON.parse(raw))} catch {resolve(null)}});
    req.on('error',()=>resolve(null));
  });
}
async function siteverify(token,settings){
  const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),7000);
  try {
    const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST',signal:abort.signal,headers:{'Content-Type':'application/json'},
      body:JSON.stringify({secret:settings.secret,response:token})
    });
    if (!r.ok) return false;
    const v=await r.json();
    return v.success===true && v.action==='dtb_enquiry' &&
      settings.hostnames.includes(String(v.hostname||'').toLowerCase());
  } catch {return false} finally {clearTimeout(timer)}
}
async function postgrest(settings,method,path,data){
  const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),8500);
  try {
    return await fetch(settings.url+'/rest/v1/'+path,{
      method,signal:abort.signal,
      headers:{apikey:settings.key,Authorization:'Bearer '+settings.key,
        'Content-Type':'application/json',Prefer:'return=representation'},
      ...(data?{body:JSON.stringify(data)}:{})
    });
  } finally {clearTimeout(timer)}
}
async function handler(req,res){
  const settings=getSettings();
  if(req.method==='GET')return send(res,200,{ok:true,enabled:settings.enabled,
    ...(settings.enabled?{siteKey:settings.siteKey}:{})});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(res,405,{ok:false,error:'method_not_allowed'});}
  if(!settings.enabled)return send(res,503,{ok:false,error:'not_configured'});
  if(!originAllowed(req,settings))return send(res,403,{ok:false,error:'origin_rejected'});
  if(!String(req.headers['content-type']||'').includes('application/json'))return send(res,415,{ok:false,error:'content_type'});
  if(Number(req.headers['content-length'])>MAX_BYTES)return send(res,413,{ok:false,error:'too_large'});
  if(limited(req))return send(res,429,{ok:false,error:'rate_limited'});
  const body=await readBody(req);
  if(body==='too_large' || (body && JSON.stringify(body).length>MAX_BYTES))return send(res,413,{ok:false,error:'too_large'});
  const {fields,data,token}=validate(body);
  if(fields.bot)return send(res,400,{ok:false,error:'rejected'});
  if(Object.keys(fields).length)return send(res,400,{ok:false,error:'validation',fields});
  if(!(await siteverify(token,settings)))return send(res,403,{ok:false,error:'verification_failed'});
  let response;
  try {response=await postgrest(settings,'POST','dtb_enquiries',data)}
  catch{return send(res,502,{ok:false,error:'store_unavailable'})}
  if(response.status===409){
    try{
      const r=await postgrest(settings,'GET','dtb_enquiries?idempotency_key=eq.'+encodeURIComponent(data.idempotency_key)+'&select=reference');
      const rows=r.ok?await r.json():[];
      if(Array.isArray(rows)&&rows[0]?.reference)return send(res,200,{ok:true,reference:rows[0].reference,duplicate:true});
    }catch{/* avoid revealing database error */}
    return send(res,409,{ok:false,error:'retry_conflict'});
  }
  if(!response.ok)return send(res,502,{ok:false,error:'store_failed'});
  let rows;try{rows=await response.json()}catch{rows=[]}
  if(!Array.isArray(rows)||!rows[0]?.reference)return send(res,502,{ok:false,error:'store_unconfirmed'});
  return send(res,201,{ok:true,reference:rows[0].reference,duplicate:false});
}
module.exports=handler;
module.exports._test={validate,getSettings,siteverify,originAllowed};
