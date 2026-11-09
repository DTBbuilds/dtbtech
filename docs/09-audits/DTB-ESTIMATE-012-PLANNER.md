# DTB-ESTIMATE-012 — estimator preflight (preview only)

Status: **Owner-review scope planner only, NOT AI and NOT a cost calculator.** No price book/GST signoff or AI provider configured. Must not be described as fully AI-powered or able to generate binding quotes.

## What works now
- Visitors select project type, optional goals, page/screen count, features, service area, timeline and their own budget.
- On-device rule-based suggestion scans a short description for explicit keywords and proposes matching features. This is deterministic code, not model inference or a privileged backend.
- Summary updates instantly, never stores PII or makes API calls, and can be copied or sent explicitly through a prepared WhatsApp message.
- Only numeric figures: **previously published DTB starting prices** for Website Rescue A$450 and Tradie Lead Website A$1,500. No invented add-on amounts, implied price range, final contract or GST assertion.
- Other project types show 'custom quote after review'. Budget guidance suggests reviewing scope rather than promising a build at the visitor's specified amount.
- /estimate has `noindex` until policy/pricing is approved.

## Next engineering gates
1. Approve owner pricing matrix (package inclusions, feature add-ons, delivery assumptions, hosting/support, Australian GST treatment, AUD currency, Kenya policy). Draft versioned `pricebook` with signed release ID.
2. Implement deterministic **server-calculated** estimate range and bounded adjustments. Never let a model make up cost values or promise delivery.
3. Optional server-side AI Gateway scope-extraction endpoint with user-visible privacy notice, safe structured schema, token budgets, rate limits, model availability and fallback. No LLM invoked in current preview.
4. Integrate a captured estimate snapshot with PR #33's gated secure /api/enquiry, after a dedicated DTB DB and storage retention policy are verified. Require explicit contact method and consent. No automatic lead collection in this prototype.
5. Mobile QA, full budget-cases and security tests; later owner approval to publish/index.

This PR can be reviewed as a UX prototype. It is not equivalent to DTB-CONVERT-011 or a verified production AI quote system.
