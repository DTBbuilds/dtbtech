'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const pricing=require('../lib/smartquote-pricing');
const estimateApi=require('../api/smartquote');
const submitApi=require('../api/smartquote-submit');
function mockRes(){
  return {headers:{},statusCode:null,data:null,
    setHeader(k,v){this.headers[k]=v;return this;},
    status(n){this.statusCode=n;return this;},
    json(obj){this.data=obj;return this;}
  };
}
function request(method,body,headers={}){
  return {method,body,
    headers:{host:'dtbtech.org',origin:'https://dtbtech.org','content-type':'application/json',...headers},
    socket:{remoteAddress:'127.0.0.1'}};
}
test('price anchors reflect proposed package tiers exactly',()=>{
  assert.equal(pricing.estimate({category:'site',pages:1}).low,990);
  assert.equal(pricing.estimate({category:'site',pages:5}).low,2490);
  assert.equal(pricing.estimate({category:'crew',pages:5,staff:4}).low,4990);
  assert.equal(pricing.estimate({category:'repair',pages:1}).low,450);
  assert.equal(pricing.estimate({category:'portal',pages:5}).low,7900);
});
test('custom staff portal is not mispriced as existing software setup',()=>{
  const quote=pricing.estimate({category:'site',pages:5,features:['custom_staff_portal']});
  assert.equal(quote.category,'portal');
  assert.ok(quote.low>=7900);
  assert.equal(quote.discovery,true);
});
test('out-of-region project requires a human quote and no converted number',()=>{
  const quote=pricing.estimate({category:'site',region:'Kenya',pages:3});
  assert.equal(quote.priced,false);assert.equal(quote.low,null);assert.equal(quote.high,null);
});
test('input sanitisation ignores unknown price modifiers and clamps scale',()=>{
  const quote=pricing.estimate({category:'site',pages:100000,staff:9000,features:['fake_discount','integration','integration']});
  assert.ok(quote.low>=0);assert.ok(quote.high>=quote.low);
  assert.ok(quote.scope.every(x=>!x.includes('fake_discount')));
  assert.ok(quote.scope.some(x=>x.includes('25')));
});
test('guided natural-language interpretation finds job workflow',()=>{
  const data=pricing.infer('My plumbing firm has 4 plumbers who need assigned jobs, bookings and quote requests.');
  assert.equal(data.category,'crew');
  assert.equal(data.staff,4);
  assert.ok(data.features.includes('staff_workspace'));
  assert.ok(data.features.includes('booking'));
});
test('estimate GET exposes only safe public configuration in any environment',async()=>{
  const res=mockRes();await estimateApi(request('GET'),res);
  assert.equal(res.statusCode,200);
  assert.equal(res.data.ok,true);
  assert.equal(typeof res.data.aiAvailable,'boolean');
  // AI may be enabled in Production; the public config must accurately reflect it.
  const config=estimateApi._test.settings();
  assert.equal(res.data.aiAvailable,config.enabled);
  assert.equal(res.data.siteKey,config.enabled?config.sitekey:null);
  assert.ok(!Object.prototype.hasOwnProperty.call(res.data,'token'));
  assert.ok(!Object.prototype.hasOwnProperty.call(res.data,'secret'));
  assert.ok(!JSON.stringify(res.data).includes('TEST_ONLY_FAKE_SECRET'));
});
test('guided estimate uses server-controlled pricing and never needs paid AI',async()=>{
  const res=mockRes();
  await estimateApi(request('POST',{
    description:'Plumbing business needs quote requests and staff job assignments.',
    category:'auto',pages:5,staff:4,features:[],region:'Australia',
    aiConsent:false,suggestFeatures:true
  }),res);
  assert.equal(res.statusCode,200);
  assert.equal(res.data.mode,'guided');
  assert.equal(res.data.quote.category,'crew');
  assert.ok(res.data.quote.low>=4990);
  assert.ok(!JSON.stringify(res.data).includes('apikey'));
});
test('visitor can remove suggested features before recalculating',async()=>{
  const res=mockRes();
  await estimateApi(request('POST',{
    description:'Want bookings and staff access for a plumbing company.',
    category:'site',pages:5,features:['gallery'],region:'Australia',
    aiConsent:false,suggestFeatures:false
  }),res);
  assert.equal(res.statusCode,200);
  assert.deepEqual(res.data.requirements.features,['gallery']);
});
test('cross-origin browser access is denied',async()=>{
  const res=mockRes();
  await estimateApi(request('POST',{description:'Test project with contact form.',features:[]},
    {origin:'https://malicious.example'}),res);
  assert.equal(res.statusCode,403);
  assert.equal(res.data.error,'origin_rejected');
});
test('submission disabled flag always fails closed regardless of build environment',async()=>{
  const name='DTB_SMARTQUOTE_SUBMIT_ENABLED',before=process.env[name];
  try {
    process.env[name]='false';
    const res=mockRes();
    await submitApi(request('GET'),res);
    assert.equal(res.data.enabled,false);assert.equal(res.data.siteKey,null);
    const post=mockRes();
    await submitApi(request('POST',{name:'Example',description:'A proper project description.'}),post);
    assert.equal(post.statusCode,503);
    assert.equal(post.data.error,'not_configured');
  } finally {
    if(before===undefined)delete process.env[name];
    else process.env[name]=before;
  }
});
test('submission enabled flag reports available only with complete server config',async()=>{
  const names=['DTB_SMARTQUOTE_SUBMIT_ENABLED','DTB_INTAKE_SUPABASE_URL',
    'DTB_INTAKE_SERVICE_KEY','DTB_SMARTQUOTE_TURNSTILE_SITE_KEY',
    'DTB_TURNSTILE_SITE_KEY','DTB_TURNSTILE_SECRET_KEY',
    'DTB_SMARTQUOTE_TURNSTILE_SECRET_KEY','DTB_SMARTQUOTE_HOSTNAMES'];
  const saved=Object.fromEntries(names.map(k=>[k,process.env[k]]));
  try {
    Object.assign(process.env,{
      DTB_SMARTQUOTE_SUBMIT_ENABLED:'true',
      DTB_INTAKE_SUPABASE_URL:'https://dtbtest.supabase.co',
      DTB_INTAKE_SERVICE_KEY:'sb_secret_LOCAL_TEST_ONLY',
      DTB_SMARTQUOTE_TURNSTILE_SITE_KEY:'0x4AAA_TEST_SHARED_WIDGET',
      DTB_TURNSTILE_SITE_KEY:'0x4AAA_TEST_SHARED_WIDGET',
      DTB_TURNSTILE_SECRET_KEY:'TEST_ONLY_FAKE_SECRET',
      DTB_SMARTQUOTE_HOSTNAMES:'dtbtech.org'
    });
    delete process.env.DTB_SMARTQUOTE_TURNSTILE_SECRET_KEY;
    const res=mockRes();
    await submitApi(request('GET'),res);
    assert.equal(res.statusCode,200);
    assert.equal(res.data.enabled,true);
    assert.equal(res.data.siteKey,'0x4AAA_TEST_SHARED_WIDGET');
    assert.ok(!JSON.stringify(res.data).includes('TEST_ONLY_FAKE_SECRET'));
  } finally {
    for(const name of names){
      if(saved[name]===undefined)delete process.env[name];
      else process.env[name]=saved[name];
    }
  }
});
test('submission validation rejects consent, spam and missing fields',()=>{
  const result=submitApi._test.validate({
    name:'',description:'',region:'Australia',preferredContact:'email',
    consentGiven:false,idempotencyKey:'fake',turnstileToken:'',elapsedMs:0,
    website:'spam'
  });
  assert.equal(result.errors.consent,'required');
  assert.ok(result.errors.bot);
  assert.equal(result.errors.idempotency,'invalid');
  assert.equal(result.errors.turnstile,'missing');
});
test('submission origin must match an explicitly configured hostname',()=>{
  const c={hostnames:['dtbtech.org','dtbtech-example.vercel.app']};
  assert.equal(submitApi._test.originAllowed(request('POST',{}),c),true);
  assert.equal(submitApi._test.originAllowed(request('POST',{},
    {origin:'https://evil.example'}),c),false);
});

test('preview fetch keeps Vercel SSO cookie on same-origin API calls',()=>{
  const fs=require('node:fs');
  const path=require('node:path');
  const browser=fs.readFileSync(path.join(__dirname,'../js/smartquote.js'),'utf8');
  assert.ok(browser.includes("credentials:'same-origin'"),'same-origin credentials are required on protected Preview POST requests');
  assert.ok(!browser.includes("credentials:'omit'"),'do not strip SSO session cookies from same-origin POST requests');
  assert.ok(browser.includes("Calculate My Estimate"),'AI-disabled mode must be labelled as guided price calculation');
});

test('reuses existing Turnstile secret only for identical site keys',()=>{
  const names=[
    'DTB_SMARTQUOTE_TURNSTILE_SITE_KEY','DTB_SMARTQUOTE_TURNSTILE_SECRET_KEY',
    'DTB_TURNSTILE_SITE_KEY','DTB_TURNSTILE_SECRET_KEY'
  ];
  const before=Object.fromEntries(names.map(k=>[k,process.env[k]]));
  try {
    process.env.DTB_SMARTQUOTE_TURNSTILE_SITE_KEY='0x4AAA_TEST_SAME_WIDGET';
    delete process.env.DTB_SMARTQUOTE_TURNSTILE_SECRET_KEY;
    process.env.DTB_TURNSTILE_SITE_KEY='0x4AAA_TEST_SAME_WIDGET';
    process.env.DTB_TURNSTILE_SECRET_KEY='local_test_shared_secret';
    assert.equal(submitApi._test.settings().secret,'local_test_shared_secret');
    assert.equal(estimateApi._test.settings().secret,'local_test_shared_secret');

    // A different widget must not inherit the primary widget's secret.
    process.env.DTB_SMARTQUOTE_TURNSTILE_SITE_KEY='0x4AAA_TEST_OTHER_WIDGET';
    assert.equal(submitApi._test.settings().secret,'');
    assert.equal(estimateApi._test.settings().secret,'');

    // Explicit separate secrets remain supported.
    process.env.DTB_SMARTQUOTE_TURNSTILE_SECRET_KEY='local_test_dedicated_secret';
    assert.equal(submitApi._test.settings().secret,'local_test_dedicated_secret');
    assert.equal(estimateApi._test.settings().secret,'local_test_dedicated_secret');
  } finally {
    for(const name of names){
      if(before[name]===undefined)delete process.env[name];
      else process.env[name]=before[name];
    }
  }
});
test('Vercel function runtime OIDC header enables opt-in model without exposing credentials',async()=>{
  const names=[
    'AI_GATEWAY_API_KEY','VERCEL_OIDC_TOKEN','DTB_SMARTQUOTE_AI_ENABLED',
    'DTB_SMARTQUOTE_MODEL','DTB_SMARTQUOTE_TURNSTILE_SITE_KEY',
    'DTB_SMARTQUOTE_TURNSTILE_SECRET_KEY','DTB_TURNSTILE_SITE_KEY',
    'DTB_TURNSTILE_SECRET_KEY','DTB_SMARTQUOTE_HOSTNAMES'
  ];
  const before=Object.fromEntries(names.map(k=>[k,process.env[k]]));
  try{
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.VERCEL_OIDC_TOKEN;
    Object.assign(process.env,{
      DTB_SMARTQUOTE_AI_ENABLED:'true',
      DTB_SMARTQUOTE_MODEL:'google/gemini-2.5-flash-lite',
      DTB_SMARTQUOTE_TURNSTILE_SITE_KEY:'0x4AAAA_FAKE_TEST_WIDGET',
      DTB_TURNSTILE_SITE_KEY:'0x4AAAA_FAKE_TEST_WIDGET',
      DTB_TURNSTILE_SECRET_KEY:'LOCAL_TEST_SECRET',
      DTB_SMARTQUOTE_HOSTNAMES:'dtbtech.org'
    });
    delete process.env.DTB_SMARTQUOTE_TURNSTILE_SECRET_KEY;
    const token='FAKE_TEST_RUNTIME_OIDC_TOKEN_DO_NOT_USE';
    const authorized=request('GET',undefined,{'x-vercel-oidc-token':token});
    const config=estimateApi._test.settings(authorized);
    assert.equal(config.enabled,true);
    assert.equal(config.token,token);
    assert.equal(estimateApi._test.settings({headers:{}}).enabled,false);
    const res=mockRes();
    await estimateApi(authorized,res);
    assert.equal(res.statusCode,200);
    assert.equal(res.data.aiAvailable,true);
    assert.ok(!JSON.stringify(res.data).includes(token));
    assert.ok(!JSON.stringify(res.data).includes('LOCAL_TEST_SECRET'));
  } finally{
    for(const name of names){
      if(before[name]===undefined)delete process.env[name];
      else process.env[name]=before[name];
    }
  }
});

test('homepage primary quote CTA opens public SmartQuote, while the estimator remains wired',()=>{
  const fs=require('node:fs');
  const path=require('node:path');
  const home=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const page=fs.readFileSync(path.join(__dirname,'../estimate.html'),'utf8');
  const script=fs.readFileSync(path.join(__dirname,'../js/smartquote.js'),'utf8');
  const hero=home.split('<!-- Hero Section')[1]?.split('<!-- Services Section')[0];
  assert.ok(hero,'homepage hero is present');
  assert.match(hero,/<a href="\/estimate"[^>]*>[\s\S]*?Estimate Your Project[\s\S]*?<\/a>/);
  assert.doesNotMatch(hero,/Get a Project Quote/);
  assert.match(hero,/Free indicative SmartQuote estimate/);
  assert.match(page,/id="dtb-estimate-form"/);
  assert.match(page,/id="estimate-submit-form"/);
  assert.match(page,/src="\/js\/smartquote\.js"/);
  assert.ok(script.includes("postJson('/api/smartquote'"));
  assert.ok(script.includes("postJson('/api/smartquote-submit'"));
  assert.ok(home.includes('href="/projects"'),'secondary portfolio CTA remains intact');
});

test('homepage presents six sections once, in the intended buying journey',()=>{
  const fs=require('node:fs');
  const path=require('node:path');
  const home=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const expected=[
    'home-hero','what-we-build','selected-work',
    'why-dtb','how-it-works','start-project'
  ];
  const positions=expected.map(id=>{
    const match=new RegExp('<section[^>]*id="'+id+'"').exec(home);
    assert.ok(match,'missing homepage section '+id);
    return match.index;
  });
  assert.equal((home.match(/<main\b/g)||[]).length,1);
  assert.equal((home.match(/<h1\b/g)||[]).length,1);
  assert.ok(positions.every((pos,i)=>i===0||pos>positions[i-1]),'homepage section order');
  assert.equal((home.match(/<section\b/g)||[]).length,6,'only six homepage sections');
  assert.ok(home.includes('<site-footer hide-project-cta></site-footer>'),'no repeated footer promotional card');
  assert.equal((home.match(/href="\/estimate"/g)||[]).length,2,'hero and closing SmartQuote CTAs');
  assert.ok(home.includes('href="/contact#project-brief"'),'direct contact alternative remains available');
  assert.ok(home.includes('href="/tradies"'),'dedicated tradie landing page remains discoverable');
  assert.ok(home.includes('href="/services"'),'full service catalogue remains discoverable');
  assert.ok(!home.includes('At a Glance Section'),'nonessential stat cards removed');
  assert.ok(!home.includes('Featured Projects Section'),'duplicated portfolio gallery removed');
  assert.ok(!home.includes('New Build, Fix or Maintain Section'),'duplicated lifecycle section removed');
  assert.ok(!home.includes('Quick Contact Section'),'duplicated contact block removed');
});
test('homepage uses real approved portfolio assets and factual project labels',()=>{
  const fs=require('node:fs');
  const path=require('node:path');
  const home=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  for(const file of ['keus-logistics-screen.jpg','jat-wordmark.png']){
    assert.ok(fs.existsSync(path.join(__dirname,'../assets/projects',file)),'missing approved project asset '+file);
    assert.ok(home.includes('/assets/projects/'+file),'project image not used '+file);
  }
  assert.ok(home.includes('Client website'));
  assert.ok(home.includes('DTB-owned product'));
  assert.ok(home.includes('href="/projects/keus-logistics"'));
  assert.ok(home.includes('href="/projects/jack-of-all-trades"'));
  assert.ok(!home.includes('guaranteed leads'),'no unsubstantiated commercial claim');
});
