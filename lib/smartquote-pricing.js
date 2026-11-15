'use strict';
// DTB SmartQuote v1: deterministic, versioned AU estimate bands.
// AI may classify requirements; it NEVER sets prices. All figures are planning
// assumptions, not market averages, firm quotes, or a contractual offer.
const PRICING_VERSION = '2026-11-15-AU-1';
const FEATURES = Object.freeze({
  gallery:'Gallery / project examples',
  quote:'Quote request form',
  booking:'Online bookings',
  payments:'Payment collection',
  customer_accounts:'Customer accounts',
  staff_workspace:'Existing staff job-management tool setup',
  custom_staff_portal:'Custom staff portal',
  inventory:'Products and inventory',
  integration:'External system integration',
  multi_location:'Multiple locations',
  seo:'Local SEO content',
  reports:'Admin reporting'
});
const CATEGORY_LABELS=Object.freeze({
  repair:'Website Rescue',
  site:'Business website',
  store:'Online store',
  crew:'Website + existing crew software',
  portal:'Custom staff portal',
  custom:'Custom web application'
});
const VALID_CATEGORIES=new Set(Object.keys(CATEGORY_LABELS));
const VALID_FEATURES=new Set(Object.keys(FEATURES));
const clamp=(x,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(x))?Math.floor(Number(x)):min));
const round100=n=>Math.ceil(n/100)*100;
const cleanText=(x,max=900)=>typeof x==='string'?x.trim().replace(/[<>]/g,'').slice(0,max):'';
function normalize(input){
  const b=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
  let category=VALID_CATEGORIES.has(b.category)?b.category:'site';
  const features=Array.from(new Set((Array.isArray(b.features)?b.features:[])
    .filter(x=>typeof x==='string'&&VALID_FEATURES.has(x)))).slice(0,12);
  if(features.includes('custom_staff_portal'))category='portal';
  else if(category==='site'&&features.includes('staff_workspace'))category='crew';
  return {
    category,features,pages:clamp(b.pages,1,25),
    staff:clamp(b.staff,0,50),
    region:['Australia','Kenya','Other'].includes(b.region)?b.region:'Australia',
    description:cleanText(b.description,1000),
    timeframe:['flexible','soon','1-3-months'].includes(b.timeframe)?b.timeframe:'flexible'
  };
}
function infer(description){
  const s=cleanText(description,1000).toLowerCase();
  const f=[];
  const match=(re,name)=>{if(re.test(s))f.push(name)};
  match(/photo|gallery|portfolio|before.after|work samples/,'gallery');
  match(/quote|enquir|lead|contact form|request a price/,'quote');
  match(/book|appointment|schedul|calendar|reservation/,'booking');
  match(/checkout|online payment|stripe|pay online/,'payments');
  match(/customer account|members|customer login/,'customer_accounts');
  match(/staff|employee|plumber|technician|crew|assign jobs|roster/,'staff_workspace');
  match(/custom staff portal|own portal|bespoke employee dashboard/,'custom_staff_portal');
  match(/product|inventory|stock|catalogue/,'inventory');
  match(/sync|api|accounting|xero|crm integration/,'integration');
  match(/multiple location|multi.branch|several locations/,'multi_location');
  match(/local seo|google maps|google business|search ranking/,'seo');
  match(/report|analytics|dashboard/,'reports');
  let category='site';
  if(/fix my website|repair|broken website|website rescue/.test(s))category='repair';
  else if(/custom staff portal|own portal|bespoke employee dashboard/.test(s))category='portal';
  else if(/software platform|web app|mobile app|saas|pos system|custom system/.test(s))category='custom';
  else if(/online store|e-commerce|ecommerce|sell products online/.test(s))category='store';
  else if(f.includes('staff_workspace'))category='crew';
  const numbers=s.match(/\b(\d{1,2})\s*(staff|employees|plumbers|technicians|workers)\b/);
  return {category,features:Array.from(new Set(f)),staff:numbers?clamp(Number(numbers[1]),0,50):0};
}
function estimate(input){
  const b=normalize(input);
  const assumptions=[
    'This is an indicative planning range, not a fixed or binding quote.',
    'Customer supplies approved branding, copy and images unless writing is separately quoted.',
    'Domain, hosting, software subscriptions, payment processing and ongoing support are separate unless included in writing.',
    'GST treatment is confirmed in the written proposal; do not assume it is included or excluded.',
    'Australian market references were reviewed on 15 November 2026; these are not live competitor quotes.'
  ];
  const scope=[
    CATEGORY_LABELS[b.category],
    b.pages+' estimated '+(b.pages===1?'page or screen':'pages or screens')
  ].concat(b.features.map(k=>FEATURES[k]));
  if(b.region!=='Australia'){
    return {currency:'AUD',pricingVersion:PRICING_VERSION,priced:false,low:null,high:null,
      category:b.category,categoryLabel:CATEGORY_LABELS[b.category],scope,
      summary:'A tailored regional quote is required before pricing this project.',
      questions:['Where is the project primarily delivered and which currency should be used?','Do you have an existing website or software platform?'],
      assumptions,discovery:true,featureNotes:[],confidence:'requires_review'};
  }
  let low,high,packageName;
  if(b.category==='repair'){low=450;high=1300;packageName='Website Rescue'}
  else if(b.category==='site'){
    if(b.pages===1){low=990;high=1900;packageName='Get Online'}
    else if(b.pages<=5){low=2490;high=4800;packageName='Win More Enquiries'}
    else{low=4200+(b.pages-5)*300;high=7500+(b.pages-5)*600;packageName='Expanded Business Website'}
  }else if(b.category==='crew'){low=4990;high=8500;packageName='Run Your Crew'}
  else if(b.category==='store'){low=5900;high=14000;packageName='Online Store / E-commerce'}
  else if(b.category==='portal'){low=7900;high=18000;packageName='DTB Crew Portal — custom MVP'}
  else{low=12000;high=30000;packageName='Custom Software Discovery'}
  const increments={
    gallery:[0,500],quote:[0,500],booking:[800,2600],payments:[900,3000],
    customer_accounts:[1500,4200],staff_workspace:[800,2200],
    custom_staff_portal:[0,0],inventory:[1400,4400],integration:[1800,5500],
    multi_location:[900,3000],seo:[0,800],reports:[1000,3000]
  };
  const notes=[];
  for(const f of b.features){
    // A staff platform is already included in the Run Your Crew starting scope.
    if((f==='staff_workspace'&&b.category==='crew')||
       (f==='quote'&&b.category==='site'&&b.pages>1)||
       (f==='booking'&&b.category==='crew'))continue;
    const [l,h]=increments[f]||[0,0];low+=l;high+=h;
    if(h)notes.push(FEATURES[f]+' may change implementation scope.');
  }
  if(b.staff>6&&['crew','portal'].includes(b.category)){
    low+=1000;high+=3000;
    notes.push('Larger staff teams may require extra onboarding, roles and licensing.');
  }
  if(b.timeframe==='soon' && b.category!=='repair'){
    // Don't automatically promise or charge for urgency; request a human review.
    notes.push('Requested rapid start requires availability confirmation; no rush fee included.');
  }
  const discovery=b.category==='custom'||b.category==='portal'||
    b.features.includes('integration')||b.features.length>=5||b.pages>15;
  const questions=[];
  if(!b.description)questions.push('What should visitors or staff be able to do first?');
  if(b.features.includes('staff_workspace')||b.category==='portal')questions.push('Would an existing job-management platform work, or do you need a custom staff portal?');
  if(b.features.includes('booking'))questions.push('Do bookings need calendar availability or just a request form?');
  if(b.features.includes('payments'))questions.push('Will customers pay deposits, full balances, or subscriptions?');
  if(b.features.includes('integration'))questions.push('Which external software must exchange data with this project?');
  if(b.category==='store')questions.push('Roughly how many products and shipping/payment rules?');
  if(!questions.length)questions.push('Do you already have branding, copy and photographs ready?');
  // Preserve published DTB starting-price anchors (A$990 / A$2,490 / A$4,990).
  const lowRounded=Math.max(450,low);
  const highRounded=round100(Math.max(high,lowRounded*1.4));
  return {currency:'AUD',pricingVersion:PRICING_VERSION,priced:true,
    low:lowRounded,high:highRounded,category:b.category,
    categoryLabel:packageName,scope,summary:packageName+' is a possible starting route.',
    questions:questions.slice(0,3),assumptions,discovery,featureNotes:notes,
    confidence:discovery?'requires_review':'indicative'};
}
module.exports={PRICING_VERSION,FEATURES,CATEGORY_LABELS,normalize,infer,estimate};