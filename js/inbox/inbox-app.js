/* DTB-LEADS-INBOX-013 — staff-only, RLS-enforced enquiry viewer. */
(function () {
'use strict';
const byId = (id) => document.getElementById(id);
const statusNames = {unprocessed:'New',contacted:'Contacted',qualified:'Qualified',proposal_sent:'Proposal sent',won:'Won',lost:'Lost',processed:'Processed',rejected:'Rejected'};
const PAGE_SIZE = 12;
const state = {client:null,profile:null,page:0,total:0,rows:[],selected:null,loading:false,authFlow:''};
const sections = ['inbox-disabled','inbox-login','inbox-password-panel','inbox-denied','inbox-dashboard'];
function notify(message, failure) {
  const n = byId('inbox-status');
  n.textContent = message;
  n.className = (failure ? 'text-red-300' : 'text-blue-300') + ' text-sm mb-6';
}
function show(name) {
  for (const section of sections) byId(section).hidden = section !== name;
  byId('inbox-signout').hidden = name !== 'inbox-dashboard' && name !== 'inbox-denied' && name !== 'inbox-password-panel';
  if(name !== 'inbox-dashboard') byId('inbox-detail').hidden=true;
}
function node(tag,cls,text) {
  const n=document.createElement(tag);
  if(cls)n.className=cls;
  if(text!==undefined && text!==null)n.textContent=String(text);
  return n;
}
function date(value){
  if(!value)return '—';
  const t=new Date(value);return Number.isNaN(t.getTime())?'—':t.toLocaleString('en-AU',{dateStyle:'medium',timeStyle:'short'});
}
function safeMail(value) {
  if(typeof value!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return null;
  return 'mailto:'+encodeURIComponent(value);
}
function safeTel(value) {
  if(typeof value!=='string'||!(/^\+?[0-9\s().-]{7,35}$/).test(value))return null;
  const digits=value.replace(/[^+0-9]/g,'');return 'tel:'+digits;
}
function item(label,value,href) {
  const box=node('div','min-w-0');
  const dt=node('dt','text-slate-400 text-xs mb-1',label);
  const dd=node('dd','text-slate-200 text-sm break-words',value||'—');
  if(href){const a=node('a','text-blue-300 underline underline-offset-4 break-all',value);a.href=href;dd.replaceChildren(a);}
  box.append(dt,dd);return box;
}
function displayDetails(row) {
  if(!row)return;
  state.selected=row;
  byId('inbox-detail').hidden=false;
  byId('inbox-detail-reference').textContent=row.lead_reference||'No reference';
  byId('inbox-detail-title').textContent=row.business_name||row.contact_name||'Enquiry';
  const dl=byId('inbox-detail-fields');dl.replaceChildren();
  dl.append(
    item('Contact',row.contact_name),
    item('Business',row.business_name),
    item('Email',row.email,safeMail(row.email)),
    item('Phone',row.phone,safeTel(row.phone)),
    item('Service',row.service_required),
    item('Country',row.country),
    item('Budget',row.budget),
    item('Timeframe',row.timeframe),
    item('Preferred contact',row.preferred_contact),
    item('Source',row.source_page),
    item('Received',date(row.created_at)),
    item('Status',statusNames[row.status]||row.status)
  );
  byId('inbox-detail-description').textContent=row.project_description||'—';
  byId('inbox-new-status').value=statusNames[row.status]?row.status:'unprocessed';
  byId('inbox-detail').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderList(){
  const wrap=byId('inbox-list');wrap.replaceChildren();
  byId('inbox-count').textContent=String(state.total);
  byId('inbox-shown').textContent=String(state.rows.length);
  byId('inbox-page').textContent='Page '+(state.page+1);
  byId('inbox-prev').disabled=state.page===0;
  byId('inbox-next').disabled=(state.page+1)*PAGE_SIZE>=state.total;
  if(!state.rows.length) {
    const empty=node('p','rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-300','No enquiries match your current filters.');
    wrap.appendChild(empty);return;
  }
  for(const row of state.rows){
    const card=node('article','inbox-row rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5 hover:border-blue-500/50');
    const top=node('div','flex flex-wrap gap-3 justify-between items-start');
    const main=node('div','min-w-0 flex-1');
    main.append(
      node('p','text-blue-300 font-semibold text-xs mb-1',row.lead_reference||'Enquiry'),
      node('h3','text-white font-bold text-lg break-words',row.business_name||row.contact_name||'Enquiry'),
      node('p','text-slate-300 text-sm mt-1 break-words',(row.service_required||'Project')+' · '+(row.contact_name||'Contact unknown'))
    );
    const side=node('div','flex flex-col gap-1 items-end');
    side.append(node('span','rounded-full border border-blue-500/30 text-blue-200 bg-blue-500/10 px-3 py-1 text-xs font-semibold',statusNames[row.status]||row.status),
       node('span','text-slate-400 text-xs',date(row.created_at)));
    top.append(main,side);
    const bottom=node('div','flex flex-wrap gap-3 items-center justify-between mt-4');
    bottom.append(node('p','text-slate-400 text-sm break-words',row.budget?'Budget: '+row.budget:'No budget given'));
    const button=node('button','inbox-btn rounded-lg border border-blue-500/50 text-blue-200 px-4 py-2 font-semibold text-sm','View enquiry');
    button.type='button';button.addEventListener('click',()=>displayDetails(row));
    bottom.appendChild(button);card.append(top,bottom);wrap.appendChild(card);
  }
}
async function verifyStaff(){
  const c=state.client;
  const user=await c.auth.getUser();
  if(user.error||!user.data?.user){state.profile=null;show('inbox-login');notify('Sign in using your DTB staff account.');return;}
  if(state.authFlow==='invite'||state.authFlow==='recovery'){
    show('inbox-password-panel');notify('Please choose a new password to finish account setup.');return;
  }
  const uid=user.data.user.id;
  const {data,error}=await c.from('staff_members').select('id,role,status,email').eq('id',uid).eq('status','active').maybeSingle();
  if(error){state.profile=null;show('inbox-denied');notify('Could not verify staff membership. Please try again.',true);return;}
  if(!data){state.profile=null;show('inbox-denied');notify('This account has not been authorised for DTB staff access.',true);return;}
  state.profile=data;
  byId('inbox-user').textContent=data.email||'DTB Staff';
  show('inbox-dashboard');await loadRows();
}
function searchTerm(){
  // A constrained literal subset prevents PostgREST filter grammar injection.
  return byId('inbox-search').value.replace(/[^a-zA-Z0-9 \-]/g,'').trim().slice(0,60);
}
async function loadRows(){
  if(state.loading||!state.profile)return;
  state.loading=true;notify('Loading private enquiries…');
  try{
    const c=state.client;
    let query=c.from('enquiry_intake').select(
      'id,lead_reference,contact_name,business_name,email,phone,country,service_required,project_description,budget,timeframe,preferred_contact,source_page,status,created_at,processed_at',
      {count:'exact'});
    const status=byId('inbox-filter-status').value;
    if(status && Object.prototype.hasOwnProperty.call(statusNames,status))query=query.eq('status',status);
    const term=searchTerm();
    if(term)query=query.or('lead_reference.ilike.%'+term+'%,contact_name.ilike.%'+term+'%,business_name.ilike.%'+term+'%');
    query=query.order('created_at',{ascending:false}).range(state.page*PAGE_SIZE,(state.page+1)*PAGE_SIZE-1);
    const {data,error,count}=await query;
    if(error)throw error;
    state.rows=data||[];state.total=count||0;
    renderList();notify('Enquiries loaded. Access is restricted to active DTB staff.');
  }catch{
    state.rows=[];state.total=0;renderList();
    notify('Unable to load enquiries. Check your connection and staff access, then try Refresh.',true);
  }finally{state.loading=false;}
}
async function saveStatus(event){
  event.preventDefault();
  if(!state.selected||!state.profile)return;
  const next=byId('inbox-new-status').value;
  if(!Object.prototype.hasOwnProperty.call(statusNames,next))return notify('Invalid status.',true);
  if(next===state.selected.status)return notify('Status unchanged.');
  const button=byId('inbox-status-save');button.disabled=true;
  try{
    const {data,error}=await state.client.from('enquiry_intake')
      .update({status:next})
      .eq('id',state.selected.id)
      .select('id,status,processed_at').single();
    if(error||!data)throw error||new Error('No updated row returned');
    state.selected={...state.selected,status:data.status,processed_at:data.processed_at};
    byId('inbox-detail').hidden=true;
    await loadRows();
    notify('Status saved in Supabase with an audit record.');
  }catch{
    notify('Status was not confirmed as saved. Please retry or contact the administrator.',true);
  }finally{button.disabled=false;}
}
async function signIn(e){
 e.preventDefault();
 const btn=byId('inbox-login-button');btn.disabled=true;
 notify('Checking staff credentials…');
 try{
   const email=byId('inbox-email').value.trim();
   const pw=byId('inbox-password').value;
   const {error}=await state.client.auth.signInWithPassword({email,password:pw});
   byId('inbox-password').value='';
   if(error)throw error;
   await verifyStaff();
 }catch{
   notify('Unable to sign in. Check your credentials or ask the DTB administrator.',true);
 }finally{btn.disabled=false;}
}
async function requestRecovery(){
 const email=byId('inbox-email').value.trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
   notify('Enter your staff email address above, then request a recovery link.',true);return;
 }
 try{
   const {error}=await state.client.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});
   if(error)throw error;
   notify('If this is an authorised account, a recovery email has been requested. Check your inbox.');
 }catch{notify('Recovery could not be requested. Please contact the administrator.',true);}
}
async function saveNewPassword(event){
 event.preventDefault();
 const pw=byId('inbox-new-password').value,confirm=byId('inbox-confirm-password').value;
 if(pw.length<12||pw!==confirm){notify('Passwords must match and contain at least 12 characters.',true);return;}
 const button=byId('inbox-password-save');button.disabled=true;
 try{
   const {error}=await state.client.auth.updateUser({password:pw});
   if(error)throw error;
   byId('inbox-new-password').value='';byId('inbox-confirm-password').value='';
   state.authFlow='';
   window.history.replaceState(null,'',window.location.pathname);
   await verifyStaff();
 }catch{notify('Password could not be updated. Please request a fresh invitation or recovery link.',true);}
 finally{button.disabled=false;}
}
async function signOut(){
 if(!state.client)return;
 const {error}=await state.client.auth.signOut();
 state.profile=null;state.rows=[];state.selected=null;state.page=0;
 byId('inbox-detail').hidden=true;
 show('inbox-login');
 notify(error?'Sign-out confirmation failed. Please refresh before using a shared computer.':'Signed out of the DTB inbox.',!!error);
}
async function start(){
 byId('inbox-login-form').addEventListener('submit',signIn);
 byId('inbox-reset-request').addEventListener('click',requestRecovery);
 byId('inbox-password-form').addEventListener('submit',saveNewPassword);
 byId('inbox-signout').addEventListener('click',signOut);
 byId('inbox-refresh').addEventListener('click',()=>loadRows());
 byId('inbox-filters').addEventListener('submit',(e)=>{e.preventDefault();state.page=0;loadRows()});
 byId('inbox-filter-reset').addEventListener('click',()=>{
   byId('inbox-search').value='';byId('inbox-filter-status').value='';state.page=0;loadRows();
 });
 byId('inbox-prev').addEventListener('click',()=>{if(state.page>0){state.page--;loadRows()}});
 byId('inbox-next').addEventListener('click',()=>{if((state.page+1)*PAGE_SIZE<state.total){state.page++;loadRows()}});
 byId('inbox-detail-close').addEventListener('click',()=>{byId('inbox-detail').hidden=true;state.selected=null});
 byId('inbox-status-form').addEventListener('submit',saveStatus);
 try{
   const incoming=new URLSearchParams(window.location.hash.slice(1));
   const flow=incoming.get('type')||new URLSearchParams(window.location.search).get('type')||'';
   state.authFlow=(flow==='invite'||flow==='recovery')?flow:'';
   const req=await fetch('/api/inbox-config',{cache:'no-store',headers:{Accept:'application/json'}});
   if(!req.ok)throw new Error('config');
   const cfg=await req.json();
   if(cfg.enabled!==true||typeof cfg.url!=='string'||typeof cfg.publishableKey!=='string'){
     show('inbox-disabled');notify('Private inbox is not enabled for this environment.');return;
   }
   if(!window.supabase?.createClient)throw new Error('SDK unavailable');
   state.client=window.supabase.createClient(cfg.url,cfg.publishableKey,{
     auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
   });
   state.client.auth.onAuthStateChange((event)=>{
     if(event==='PASSWORD_RECOVERY'){
       state.authFlow='recovery';show('inbox-password-panel');
       notify('Choose a new password to finish recovery.');
     }
   });
   await verifyStaff();
 }catch{
   show('inbox-disabled');notify('Inbox configuration could not be loaded. Please try again later.',true);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
