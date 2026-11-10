// DTB-LEADS-INBOX-013 browser UI/auth checks; run with jsdom@26 via npm --no-save.
'use strict';
const fs=require('fs');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('dashboard/enquiries.html','utf8');
const script=fs.readFileSync('js/inbox/inbox-app.js','utf8');
const record={
 id:'11111111-2222-4333-8444-555555555555',lead_reference:'DTB-20261110-1234',
 contact_name:'Sample Contact',business_name:'QA Example Co',email:'sample@example.test',
 phone:'+61 400 111 222',country:'Australia',service_required:'Business website',
 project_description:'Test string <img src=x onerror=alert(1)> must be rendered as text.',
 budget:'A$2000',timeframe:'Flexible',preferred_contact:'email',source_page:'contact',
 status:'unprocessed',created_at:'2026-11-10T09:30:00Z',processed_at:null
};
function wait(ms){return new Promise(r=>setTimeout(r,ms));}
async function create(kind){
 const dom=new JSDOM(html,{url:'https://example.vercel.app/dashboard/enquiries',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 w.HTMLElement.prototype.scrollIntoView=()=>{};
 let updatePayload=null;
 const newRow={...record};
 const mockClient={
  auth:{
   getUser:async()=>kind==='signed-out'?{data:{user:null}}:{data:{user:{id:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'}}},
   signInWithPassword:async()=>({data:{},error:null}),
   signOut:async()=>({error:null}),
   resetPasswordForEmail:async()=>({error:null}),
   updateUser:async()=>({error:null}),
   onAuthStateChange:()=>({data:{subscription:{unsubscribe:()=>{}}}})
  },
  from(table){
   if(table==='staff_members'){
     const query={
       eq(){return this;},
       maybeSingle:async()=>kind==='staff'
         ? {data:{id:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',role:'owner',status:'active',email:'owner@example.test'},error:null}
         : {data:null,error:null}
     };
     return {select:()=>query};
   }
   if(table!=='enquiry_intake')throw Error('unexpected table '+table);
   return {
    select:()=>({
      eq(){return this;},or(){return this;},order(){return this;},
      range:async()=>({data:[newRow],count:1,error:null})
    }),
    update(payload){
      updatePayload=payload;
      return {eq:()=>({select:()=>({single:async()=>({data:{id:record.id,status:payload.status,processed_at:'2026-11-10T10:00:00Z'},error:null})})})};
    }
   };
  }
 };
 w.fetch=async()=>({ok:true,json:async()=>kind==='disabled'?{enabled:false}:{
  enabled:true,url:'https://dtbtest.supabase.co',publishableKey:'sb_publishable_FAKE_TEST_ONLY'}});
 w.supabase={createClient:()=>mockClient};
 w.eval(script);
 d.dispatchEvent(new w.Event('DOMContentLoaded'));
 await wait(50);
 return {d,w,dom,getUpdate:()=>updatePayload};
}
(async()=>{
 const disabled=await create('disabled');
 assert.equal(disabled.d.getElementById('inbox-disabled').hidden,false);
 assert.equal(disabled.d.getElementById('inbox-dashboard').hidden,true);
 disabled.dom.window.close();
 console.log('PASS disabled config never displays inbox');
 const denied=await create('outsider');
 assert.equal(denied.d.getElementById('inbox-denied').hidden,false);
 assert.equal(denied.d.getElementById('inbox-dashboard').hidden,true);
 denied.dom.window.close();
 console.log('PASS nonstaff access denied');
 const staff=await create('staff');
 const doc=staff.d;
 assert.equal(doc.getElementById('inbox-dashboard').hidden,false);
 assert.match(doc.getElementById('inbox-list').textContent,/DTB-20261110-1234/);
 const view=Array.from(doc.querySelectorAll('#inbox-list button')).find(x=>x.textContent==='View enquiry');
 view.click();
 assert.equal(doc.getElementById('inbox-detail').hidden,false);
 assert.match(doc.getElementById('inbox-detail-description').textContent,/<img src=x/);
 assert.equal(doc.getElementById('inbox-detail-description').children.length,0);
 doc.getElementById('inbox-new-status').value='contacted';
 doc.getElementById('inbox-status-form').dispatchEvent(new staff.w.Event('submit',{cancelable:true,bubbles:true}));
 await wait(50);
 assert.deepEqual(staff.getUpdate(),{status:'contacted'});
 assert.match(doc.getElementById('inbox-status').textContent,/Status saved/);
 console.log('PASS active staff list, safe text rendering, status-only update');
 staff.dom.window.close();
 console.log('ALL_INBOX_UI_TESTS_PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
