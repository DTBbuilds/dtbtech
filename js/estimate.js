/* DTB-ESTIMATE-012: LOCAL scope planner, no AI calls, storage or automatic submission.
   Price anchors come ONLY from currently published tradie offers; other prices unapproved. */
(function(){
'use strict';
function init(){
 const q=id=>document.getElementById(id);
 const form=q('dtb-estimate-form');if(!form)return;
 const TYPES={
  tradie:{label:'Tradie website & quote flow',from:1500,service:'Business website'},
  repair:{label:'Website repair / rescue',from:450,service:'Website redesign or repair'},
  business:{label:'Business website',from:null,service:'Business website'},
  store:{label:'Online store',from:null,service:'Online store or booking website'},
  app:{label:'Web / mobile app',from:null,service:'Custom web or mobile application'},
  system:{label:'POS / business system',from:null,service:'POS or business software'}
 };
 const LABELS={gallery:'Project / product gallery',quotes:'Quote enquiry form',booking:'Booking and appointments',
   payments:'Online payments',accounts:'Customer accounts',inventory:'Products and inventory',
   reports:'Admin dashboard and reports',multistore:'Multi-location / team management'};
 const KEYWORDS=[
  [/photo|portfolio|gallery|before.and.after/i,'gallery'],
  [/quote|estimate|enquir|lead/i,'quotes'],
  [/book|appoint|schedul|calendar/i,'booking'],
  [/payment|stripe|checkout|pay online/i,'payments'],
  [/login|account|member|user profile/i,'accounts'],
  [/stock|inventory|catalogue|products/i,'inventory'],
  [/report|analytics|dashboard/i,'reports'],
  [/branch|multi.store|team|multi.location/i,'multistore']
 ];
 const current=()=>TYPES[q('estimate-type').value]||TYPES.business;
 const features=()=>Array.from(document.querySelectorAll('#estimate-feature-list input:checked')).map(x=>x.value);
 function outline(){
  const t=current(),f=features();
  return [
   'Hello DTB Technologies, I would like a formal project proposal.',
   '',
   'Project: '+t.label,
   'Pages/screens: '+q('estimate-pages').value,
   'Features: '+(f.length?f.map(x=>LABELS[x]).join(', '):'To discuss'),
   'Business / area: '+(q('estimate-area').value.trim()||'Not specified'),
   'Budget (AUD): '+(q('estimate-budget').value||'To discuss'),
   'Timeframe: '+q('estimate-timeline').value,
   '',
   'Project goals:',
   q('estimate-goal').value.trim()||'To discuss',
   '',
   'Source: dtbtech.org/estimate',
   'This is an initial scope idea; final written pricing is subject to review.'
  ].join('\n');
 }
 function update(){
  const t=current(),f=features(),pages=Number(q('estimate-pages').value);
  q('estimate-result-type').textContent=t.label;
  q('estimate-page-count').textContent=String(pages);
  q('estimate-price').textContent=t.from===null?'Custom quote after review':'From A$'+t.from.toLocaleString('en-AU');
  q('estimate-price-note').textContent=t.from===null?
    'The scope needs discovery; no approved automatic price is available for this project type.' :
    'This is only DTB’s existing published starting price for the base offer, not a calculated total. Features and page count can change the final price.';
  const ul=q('estimate-scope');ul.replaceChildren();
  ['Project: '+t.label,'Approx. '+pages+' pages/screens',...f.map(x=>LABELS[x])].forEach(s=>{const li=document.createElement('li');li.textContent=s;ul.appendChild(li)});
  const budgetValue=q('estimate-budget').value, budget=Number(budgetValue);
  let hint='Enter a budget to explore which features could be prioritised.';
  if(budgetValue && budget>=0){
    if(t.from!==null && budget<t.from) hint='Your budget is below the published starting price for this service. Ask about narrowing the scope or a phased delivery. No price is guaranteed.';
    else if(f.length>=4||pages>=10) hint='Your plan includes several features or screens. A smaller first release could prioritise your most essential features. Final cost needs a scope review.';
    else hint='Your budget is noted, but this planner cannot confirm affordability. DTB will review the full scope and quote in writing.';
  }
  q('estimate-budget-hint').textContent=hint;
  q('estimate-whatsapp').href='https://wa.me/61450275013?text='+encodeURIComponent(outline());
 }
 q('estimate-suggest').addEventListener('click',()=>{
  const description=q('estimate-goal').value.trim();
  if(!description){q('estimate-suggest-status').textContent='Describe your project first to get feature suggestions.';return;}
  const choices=KEYWORDS.filter(([re])=>re.test(description)).map(([,k])=>k);
  for(const k of choices){const el=document.querySelector('#estimate-feature-list input[value="'+k+'"]');if(el)el.checked=true;}
  q('estimate-suggest-status').textContent=choices.length?
   'Suggested '+choices.length+' feature(s) based on your description. Please review these choices. This is a local rule-based preview, not live AI.' :
   'No matching features found. Please select what you need manually.';
  update();
 });
 form.addEventListener('input',update);form.addEventListener('change',update);
 q('estimate-copy').addEventListener('click',async()=>{
  try{
   if(!navigator.clipboard?.writeText)throw Error('no_clipboard');
   await navigator.clipboard.writeText(outline());
   q('estimate-action-status').textContent='Project outline copied. Paste into an email or message to DTB.';
  }catch{q('estimate-action-status').textContent='Clipboard unavailable. Use WhatsApp to share the outline or contact DTB for a proposal.';}
 });
 update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
