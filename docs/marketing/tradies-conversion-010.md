# TRADIES-CONVERT-010 — acquisition and conversion acceptance

**Scope:** Honest DTB Australian tradie-specific landing page, homepage and navigation discovery, manual quote/website project brief enhancements. No CRM, server-side lead storage, automated form send, tracking cookies, new prices or testimonials.

## Release checklist
- [ ] Direct `/services/tradies` resolves HTTP 200 on Vercel Preview (also after clean URL path).
- [ ] Hero CTA opens `/contact?service=Tradie%20website%20and%20quote%20flow#project-brief`; correct service preselected and conditional trade fields visible.
- [ ] Trade links for Plumbing, Electrical, Roofing, Landscaping and Painting preselect valid values; unknown query values are ignored.
- [ ] Existing standard service choices hide and disable trade inputs; no trade-specific details leak into unrelated outgoing briefs.
- [ ] Australia WhatsApp route `wa.me/61450275013` remains unchanged and generated text includes only entered fields; email draft and copy paths do likewise. Form is NOT auto-submitted.
- [ ] JS syntax, site build, JSON-LD parse, sitemap XML, route link integrity and no accidental private data/credentials.
- [ ] Mobile visual QA 320/375/768/1440px; keyboard/menu readability, no horizontal overflow, conditional field accessible labels.
- [ ] Technical SEO canonical and indexability; no fake tradie client case studies, promise of increased leads, ranking guarantees or unapproved prices.
- [ ] Production merge requires owner review. Manual enquiry channels must remain operational.

## What is actually captured?
Prospect must explicitly send prepared WhatsApp/email draft to DTB. This phase **does not** persist leads and does not automatically receive submissions. Scope for a consent-compliant server submission system is a separate release, contingent on security and mailbox readiness. Do not market this as a functioning CRM.
