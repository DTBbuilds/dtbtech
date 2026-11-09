/* DTB-CONVERT-011 — optional secure enquiry submission.
   Fail closed until the backend, dedicated DTB database and Turnstile are enabled.
   Existing WhatsApp/email/copy actions remain usable and do not save form data. */
(function(){
'use strict';
function byId(id){return document.getElementById(id)}
function value(id){return (byId(id)?.value||'').trim()}
function init(){
 const kind=byId('dtb-project-brief-form')?'contact':byId('dtb-tradies-check-form')?'tradies':null;
 if(!kind)return;
 const form=byId(kind==='contact'?'dtb-project-brief-form':'dtb-tradies-check-form');
 const prefix=kind==='contact'?'dtb-contact':'dtb-tradies';
 const button=byId(prefix+'-submit'), section=byId(prefix+'-online-fields');
 const status=byId(prefix+'-online-status'), challenge=byId(prefix+'-turnstile');
 if(!button||!section||!status||!challenge)return;
 const started=Date.now();
 let token='',widgetId=null,enabled=false,pending=false,done=false,key=null;
 const setStatus=(message)=>{status.textContent=message};
 const resetChallenge=()=>{
   token='';
   if(widgetId!==null && window.turnstile?.reset)window.turnstile.reset(widgetId);
 };
 function getKey(){
   if(!key){
     if(!window.crypto?.randomUUID)throw Error('secure_random_unavailable');
     key=window.crypto.randomUUID();
   }
   return key;
 }
 function getPayload(){
   const contact=kind==='contact';
   const email=value(contact?'dtb-contact-email':'dtb-tradies-email-address');
   const phone=value(contact?'dtb-contact-phone':'dtb-tradies-phone-number');
   if(contact){
     return {
       name:value('project-contact-name'),business:value('project-business'),
       email,phone,service:value('project-service'),region:value('project-region'),
       description:value('project-goal'),budget:value('project-budget'),
       timeframe:value('project-timeline'),sourcePage:'contact',
       preferredContact:email?'email':'whatsapp',
       consentGiven:byId('dtb-contact-consent').checked,
       website:value('dtb-contact-hp')
     };
   }
   const prefer=value('tradie-contact');
   const descriptions=[
     'Free website check: '+value('tradie-problem'),
     'Trade: '+value('tradie-trade'),
     'Service area: '+(value('tradie-area')||'Not specified'),
     'Current website: '+(byId('tradie-no-website').checked?'None':(value('tradie-website')||'Not specified')),
     'Interest: '+value('tradie-offer')
   ];
   return {
     name:value('tradie-name'),business:value('tradie-business'),email,phone,
     service:'Tradie website and quote flow',region:'Australia',
     description:descriptions.join('\n'),budget:'',timeframe:'Flexible / not sure',
     sourcePage:'tradies',preferredContact:prefer==='Email'?'email':prefer==='Phone call'?'phone':'whatsapp',
     consentGiven:byId('dtb-tradies-consent').checked,website:value('dtb-tradies-hp')
   };
 }
 function validate(payload){
   if(!payload.name){setStatus('Please enter your name before submitting.');byId(kind==='contact'?'project-contact-name':'tradie-name').focus();return false;}
   if(!payload.email && payload.phone.replace(/\D/g,'').length<7){setStatus('Please enter a valid email address or phone number to receive a reply.');byId(kind==='contact'?'dtb-contact-email':'dtb-tradies-email-address').focus();return false;}
   if(payload.preferredContact==='email' && !payload.email){setStatus('Please add an email address for your chosen reply method.');return false;}
   if(payload.preferredContact!=='email' && payload.phone.replace(/\D/g,'').length<7){setStatus('Please add a phone number for your chosen reply method.');return false;}
   if(!payload.consentGiven){setStatus('Please review and tick the project-enquiry consent checkbox.');return false;}
   if(kind==='tradies'){
     if(!value('tradie-trade')||value('tradie-problem').length<10){setStatus('Please select your trade and describe the website issue first.');return false;}
     if(value('tradie-website') && !byId('tradie-website').checkValidity()){setStatus('Please correct the website URL or tick “I do not have a website”.');return false;}
   }
   if(!form.reportValidity()){setStatus('Please complete the required project details correctly.');return false;}
   return true;
 }
 async function send(){
   if(!enabled||pending||done)return;
   const payload=getPayload();
   if(!validate(payload))return;
   if(!token){setStatus('Please complete the verification box, then submit again.');return;}
   let idempotency;
   try{idempotency=getKey()}catch{setStatus('Secure request ID unavailable. Please use WhatsApp or email.');return;}
   pending=true;button.disabled=true;setStatus('Submitting securely to DTB…');
   const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
   try{
     const r=await fetch('/api/enquiry',{
       method:'POST',signal:abort.signal,
       headers:{'Content-Type':'application/json'},
       body:JSON.stringify({...payload,idempotencyKey:idempotency,
         elapsedMs:Date.now()-started,turnstileToken:token})
     });
     const result=await r.json();
     if(r.ok && result.ok===true && /^DTB-[0-9]{8}-[A-Z0-9]{12}$/.test(result.reference||'')){
       done=true;
       setStatus('Enquiry received by DTB. Your reference is '+result.reference+'. Please keep it for follow-up.');
       button.textContent='Enquiry Submitted';
       return;
     }
     if(r.status===403 && result.error==='verification_failed'){
       setStatus('Verification expired or failed. Please complete the new challenge and try again.');
     }else if(r.status===429){
       setStatus('Too many requests at present. Please use WhatsApp or email to reach DTB.');
     }else if(r.status===400){
       setStatus('Some details need attention. Check your contact method and project description.');
     }else{
       setStatus('We could not confirm delivery to DTB. Nothing is marked received. Try again or use WhatsApp/email.');
     }
   }catch{
     setStatus('We could not confirm the enquiry was saved. Your details remain on this page; retry or use WhatsApp/email.');
   }finally{
     clearTimeout(timer);pending=false;
     if(!done){button.disabled=false;resetChallenge();}
   }
 }
 function loadTurnstile(siteKey){
   return new Promise((resolve,reject)=>{
     function render(){
       if(!window.turnstile?.render)return reject(Error('widget_missing'));
       try{
         widgetId=window.turnstile.render(challenge,{
           sitekey:siteKey,action:'dtb_enquiry',theme:'dark',
           callback:(t)=>{token=t},
           'expired-callback':()=>{token='';setStatus('Verification expired. Please complete it again.');},
           'error-callback':()=>{token='';setStatus('Verification unavailable. Use WhatsApp or email.');}
         });
         resolve();
       }catch(e){reject(e)}
     }
     if(window.turnstile?.render)return render();
     const script=document.createElement('script');
     script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
     script.async=true;script.defer=true;
     script.onload=render;script.onerror=()=>reject(Error('widget_load_failed'));
     document.head.appendChild(script);
   });
 }
 async function setup(){
   try{
     const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),7500);
     let response;
     try{response=await fetch('/api/enquiry',{signal:abort.signal,cache:'no-store',headers:{Accept:'application/json'}})}
     finally{clearTimeout(timer)}
     if(!response.ok)throw Error('config_failed');
     const cfg=await response.json();
     if(cfg.enabled!==true||typeof cfg.siteKey!=='string'){
       setStatus('Online submission is not active yet. Use WhatsApp or email below to reach DTB directly.');
       return;
     }
     section.hidden=false;section.disabled=false;
     await loadTurnstile(cfg.siteKey);
     enabled=true;button.disabled=false;
     setStatus('Online submission is available. Complete your contact details and verification to send your enquiry.');
   }catch{
     section.hidden=true;section.disabled=true;
     setStatus('Online submission is currently unavailable. Use WhatsApp or email below—those options still work.');
   }
 }
 form.addEventListener('input',()=>{if(!pending&&!done)key=null});
 form.addEventListener('change',()=>{if(!pending&&!done)key=null});
 form.addEventListener('submit',event=>{event.preventDefault();send()});
 button.addEventListener('click',event=>{event.preventDefault();send()});
 setup();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
