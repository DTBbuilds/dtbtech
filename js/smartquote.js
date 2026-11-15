/* DTB SmartQuote — public UI. AI, pricing and secure submissions are server-side.
   Never treat an opened WhatsApp/email draft as a sent enquiry. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const form=$('dtb-estimate-form');
if(!form)return;
const state={
  aiAvailable:false,submitEnabled:false,aiSiteKey:'',submitSiteKey:'',
  aiToken:'',submitToken:'',aiWidget:null,submitWidget:null,turnstilePromise:null,
  quote:null,requirements:null,mode:'guided',lastAnalysisId:0,
  requestId:null,confirmed:false,startedAt:Date.now(),debounce:null
};
const q=id=>$(id)?.value||'';
const checked=id=>Boolean($(id)?.checked);
const label=(id,text)=>{const e=$(id);if(e)e.textContent=text};
const fmt=n=>'A$'+Number(n).toLocaleString('en-AU');
const features=()=>Array.from(document.querySelectorAll('#estimate-feature-list input:checked')).map(x=>x.value);
const knownFeatures=new Set([
  'gallery','quote','booking','payments','customer_accounts','staff_workspace',
  'custom_staff_portal','inventory','integration','multi_location','seo','reports'
]);
function collect(){
  return {
    category:q('estimate-type'),region:q('estimate-region'),
    pages:Number(q('estimate-pages'))||1,
    staff:Number(q('estimate-staff'))||0,
    features:features(),
    description:q('estimate-goal').trim().slice(0,1000),
    timeframe:q('estimate-timeline')
  };
}
function renderList(id,items){
  const el=$(id);
  if(!el)return;
  el.replaceChildren();
  for(const item of items.slice(0,15)){
    const li=document.createElement('li');
    li.textContent=String(item);
    el.appendChild(li);
  }
}
function outline(){
  const s=state.requirements||collect();
  const c=state.quote;
  const lines=[
    'Hello DTB Technologies, I would like a written project quote.',
    '',
    'Project type: '+(c?.categoryLabel||s.category),
    'Project location: '+s.region,
    'Approx. pages/screens: '+s.pages,
    'Staff accounts: '+s.staff,
    'Selected features: '+(s.features.length?s.features.join(', '):'To discuss'),
    'Preferred timing: '+s.timeframe,
    'Customer budget (AUD): '+(q('estimate-budget')||'To discuss'),
    '',
    'Project idea:',
    (q('estimate-goal')||'To discuss').slice(0,800),
    '',
    'Indicative estimate: '+(c?.priced?fmt(c.low)+'–'+fmt(c.high):'Needs tailored quote'),
    'Pricing version: '+(c?.pricingVersion||'Not yet calculated'),
    'This is a nonbinding planning range; a final written quote is required.',
    'Source: https://dtbtech.org/estimate'
  ];
  return lines.join('\n').slice(0,1900);
}
function updateHandoffs(){
  $('estimate-whatsapp').href='https://wa.me/61450275013?text='+encodeURIComponent(outline());
  $('estimate-email').href='mailto:dtbbuildsoffice@gmail.com?subject='+encodeURIComponent('DTB SmartQuote — project enquiry')+'&body='+encodeURIComponent(outline());
}
function applyQuote(result){
  state.quote=result.quote;
  state.requirements=result.requirements;
  state.mode=result.mode==='ai'?'ai':'guided';
  label('estimate-result-type',result.quote.categoryLabel);
  label('estimate-price',result.quote.priced?fmt(result.quote.low)+' – '+fmt(result.quote.high):'Needs tailored quote');
  label('estimate-price-note',result.quote.priced?
    'Indicative AU project fee; scope, tax treatment and third-party costs require confirmation.' :
    'Projects outside Australia require a tailored regional quote. No automatic currency conversion is assumed.');
  label('estimate-analysis-mode',state.mode==='ai'?'AI-assisted requirements • fixed pricing rules':'Guided scope • fixed pricing rules (not AI)');
  renderList('estimate-scope',result.quote.scope);
  renderList('estimate-questions',result.suggestedQuestions?.length?result.suggestedQuestions:result.quote.questions);
  const b=Number(q('estimate-budget')),set=q('estimate-budget')!=='';
  label('estimate-budget-hint',set&&result.quote.priced?
    (b<result.quote.low?'Your budget is below this indicative range. Ask about reducing the scope or phasing the project.' :
     b>result.quote.high?'Your budget may provide room for optional scope, but this is not a guaranteed final price.' :
     'Your budget falls within this preliminary range. DTB must still review feasibility and issue a written quote.') :
    'This range is a starting point for planning, not a guaranteed project cost.');
  if(result.notice)label('estimate-suggest-status',result.notice);
  updateHandoffs();
}
async function postJson(url,body){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),16000);
  try{
    const r=await fetch(url,{
      method:'POST',headers:{'Content-Type':'application/json'},
      cache:'no-store',credentials:'same-origin',signal:controller.signal,
      body:JSON.stringify(body)
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error((r.status===401||r.status===403)?'preview_auth_required':(data.error||'service_unavailable'));
    return data;
  }finally{clearTimeout(timeout)}
}
function resetChallenge(kind){
  if(!window.turnstile)return;
  const widget=kind==='ai'?state.aiWidget:state.submitWidget;
  if(widget===null)return;
  try{window.turnstile.reset(widget)}catch{}
  if(kind==='ai')state.aiToken='';
  else state.submitToken='';
}
function loadTurnstile(){
  if(state.turnstilePromise)return state.turnstilePromise;
  state.turnstilePromise=new Promise((resolve,reject)=>{
    if(window.turnstile)return resolve(window.turnstile);
    const sc=document.createElement('script');
    sc.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    sc.async=true;sc.defer=true;
    sc.onload=()=>window.turnstile?resolve(window.turnstile):reject(new Error('turnstile_unavailable'));
    sc.onerror=()=>reject(new Error('turnstile_unavailable'));
    document.head.appendChild(sc);
  });
  return state.turnstilePromise;
}
async function setupTurnstile(){
  if(!state.aiAvailable&&!state.submitEnabled)return;
  try{
    const t=await loadTurnstile();
    if(state.aiAvailable){
      const el=$('estimate-ai-challenge');el.classList.remove('hidden');
      state.aiWidget=t.render(el,{
        sitekey:state.aiSiteKey,action:'dtb_smartquote',
        callback:token=>{state.aiToken=token;},
        'expired-callback':()=>{state.aiToken='';},
        'error-callback':()=>{state.aiToken='';}
      });
    }
    if(state.submitEnabled){
      const el=$('estimate-submit-challenge');el.classList.remove('hidden');
      state.submitWidget=t.render(el,{
        sitekey:state.submitSiteKey,action:'dtb_smartquote',
        callback:token=>{state.submitToken=token;},
        'expired-callback':()=>{state.submitToken='';},
        'error-callback':()=>{state.submitToken='';}
      });
    }
  }catch{
    label('estimate-ai-availability','Verification is unavailable. Guided estimates still work; AI is temporarily unavailable.');
    if(state.submitEnabled)label('estimate-submit-status','Verification failed to load. Please use WhatsApp or email for now.');
  }
}
async function analyze(wantAI){
  const serial=++state.lastAnalysisId;
  const button=$('estimate-suggest');
  button.disabled=true;
  label('estimate-suggest-status','Reviewing the scope and pricing guidance…');
  const data=collect();
  const ai=wantAI&&checked('estimate-ai-consent')&&state.aiAvailable;
  if(ai&&!state.aiToken){
    button.disabled=false;
    label('estimate-suggest-status','Complete the verification check to use AI. You can untick AI for a guided estimate.');
    return;
  }
  try{
    const result=await postJson('/api/smartquote',{
      ...data,aiConsent:ai,turnstileToken:ai?state.aiToken:'',
      suggestFeatures:wantAI
    });
    if(serial!==state.lastAnalysisId)return;
    if(wantAI){
      const selected=new Set(result.requirements?.features||[]);
      for(const el of document.querySelectorAll('#estimate-feature-list input')){
        if(knownFeatures.has(el.value)&&selected.has(el.value))el.checked=true;
      }
      if(q('estimate-type')==='auto'&&result.requirements?.category){
        // Preserve "auto" selection so a rewritten description can change the recommendation.
      }
      if(result.requirements?.staff>Number(q('estimate-staff'))&&Number(q('estimate-staff'))===0)
        $('estimate-staff').value=String(result.requirements.staff);
    }
    applyQuote(result);
    if(!result.notice)label('estimate-suggest-status',result.mode==='ai'?
      'AI suggested a scope. Check the selected features and clarify assumptions before requesting a written quote.' :
      'Guided scope and a dated DTB pricing range are ready. This was not a live AI analysis.');
  }catch{
    if(serial===state.lastAnalysisId){
      state.quote=null;
      label('estimate-price','Estimate unavailable');
      label('estimate-price-note','The pricing service could not respond. This is not a quote. You can still send your requirements to DTB manually.');
      label('estimate-analysis-mode','Guided calculation unavailable');
      label('estimate-suggest-status','We could not calculate your estimate. If this is a protected Preview, refresh your Vercel login and try again. No estimate was saved; WhatsApp and email drafts remain available.');
      updateHandoffs();
    }
  }finally{
    button.disabled=false;
    if(ai)resetChallenge('ai');
  }
}
function updateAnalysisButton(){
  $('estimate-suggest').textContent=state.aiAvailable&&checked('estimate-ai-consent')?'Analyse With AI':'Calculate My Estimate';
}
function manualUpdate(){
  label('estimate-page-count',q('estimate-pages'));
  // Mark previous quote as provisional rather than silently showing stale prices.
  state.quote=null;state.requirements=null;
  label('estimate-price','Updating…');
  label('estimate-analysis-mode','Guided scope • prices recalculating');
  updateHandoffs();
  clearTimeout(state.debounce);
  state.debounce=setTimeout(()=>analyze(false),450);
}
function uuid(){
  if(typeof crypto!=='undefined'&&crypto.randomUUID)return crypto.randomUUID();
  if(typeof crypto!=='undefined'&&crypto.getRandomValues){
    const x=crypto.getRandomValues(new Uint8Array(16));
    x[6]=(x[6]&15)|64;x[8]=(x[8]&63)|128;
    const h=Array.from(x,a=>a.toString(16).padStart(2,'0')).join('');
    return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
  }
  return null;
}
async function submit(event){
  event.preventDefault();
  if(!state.submitEnabled){label('estimate-submit-status','Secure submissions are not enabled. Use the WhatsApp or email draft above.');return;}
  if(state.confirmed)return;
  const description=q('estimate-goal').trim();
  const name=q('estimate-contact-name').trim();
  const email=q('estimate-contact-email').trim();
  const phone=q('estimate-contact-phone').trim();
  const preferred=q('estimate-contact-preferred');
  if(name.length<2||description.length<15||(!email&&!phone)){
    label('estimate-submit-status','Enter your name, a project description (15+ characters), and an email or phone number.');
    return;
  }
  if((preferred==='email'&&!email)||(preferred!=='email'&&!phone)){
    label('estimate-submit-status','Please provide the contact detail matching your preferred reply channel.');
    return;
  }
  if(!checked('estimate-contact-consent')){
    label('estimate-submit-status','Consent is required before storing your enquiry.');
    return;
  }
  if(!state.submitToken){
    label('estimate-submit-status','Complete the verification challenge before submitting.');
    return;
  }
  if(!state.requestId)state.requestId=uuid();
  if(!state.requestId){label('estimate-submit-status','Your browser cannot create a secure request ID. Use the contact options instead.');return;}
  const b=collect();
  const button=$('estimate-submit');button.disabled=true;
  label('estimate-submit-status','Sending the request securely…');
  try{
    const result=await postJson('/api/smartquote-submit',{
      ...b,name,business:q('estimate-business'),
      email,phone,preferredContact:preferred,
      consentGiven:true,website:q('estimate-website'),
      elapsedMs:Date.now()-state.startedAt,
      turnstileToken:state.submitToken,
      idempotencyKey:state.requestId,
      budget:q('estimate-budget')
    });
    if(!result.ok||!result.reference)throw new Error('unconfirmed');
    state.confirmed=true;
    label('estimate-submit-status','Saved successfully. Your enquiry reference is '+result.reference+'. DTB must review it before issuing a formal quote.');
  }catch{
    button.disabled=false;
    label('estimate-submit-status','We could not confirm that your request was saved. Please retry safely, or send your scope manually. Do not assume DTB received it.');
    resetChallenge('submit');
  }
}
async function boot(){
  label('estimate-page-count',q('estimate-pages'));
  $('estimate-suggest').addEventListener('click',()=>analyze(true));
  $('estimate-ai-consent').addEventListener('change',updateAnalysisButton);
  form.addEventListener('input',event=>{
    if(event.target.id==='estimate-ai-consent')return;
    if(event.target.id==='estimate-goal')return; // typing is not sent to AI until explicitly requested
    manualUpdate();
  });
  form.addEventListener('change',event=>{
    if(event.target.id==='estimate-ai-consent')return;
    manualUpdate();
  });
  $('estimate-copy').addEventListener('click',async()=>{
    try{
      if(!navigator.clipboard?.writeText)throw new Error('clipboard_unavailable');
      await navigator.clipboard.writeText(outline());
      label('estimate-action-status','Outline copied. Paste it into a message and send it to DTB.');
    }catch{label('estimate-action-status','Clipboard unavailable. You can use the prepared WhatsApp or email draft.');}
  });
  $('estimate-submit-form').addEventListener('submit',submit);
  updateHandoffs();
  const results=await Promise.allSettled([
    fetch('/api/smartquote',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()),
    fetch('/api/smartquote-submit',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject())
  ]);
  const aiConfig=results[0].status==='fulfilled'?results[0].value:{};
  state.aiAvailable=aiConfig.aiAvailable===true;
  state.aiSiteKey=aiConfig.siteKey||'';
  $('estimate-ai-consent').disabled=!state.aiAvailable;
  updateAnalysisButton();
  label('estimate-ai-availability',state.aiAvailable?
    'AI requirement extraction is available with optional consent and verification. Prices still come from fixed rules.' :
    'Guided estimates are available. AI analysis is not currently activated.');
  const submitConfig=results[1].status==='fulfilled'?results[1].value:{};
  state.submitEnabled=submitConfig.enabled===true;
  state.submitSiteKey=submitConfig.siteKey||'';
  $('estimate-submit').disabled=!state.submitEnabled;
  $('estimate-submit-form').hidden=!state.submitEnabled;
  label('estimate-submit-availability',state.submitEnabled?
    'Secure quote requests are enabled. Complete the form to request a written proposal.' :
    'Secure online submissions are not yet activated. Use the prepared WhatsApp or email message above; nothing is submitted automatically.');
  setupTurnstile();
  // Render an initial guided range without requiring AI or visitor details.
  analyze(false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();