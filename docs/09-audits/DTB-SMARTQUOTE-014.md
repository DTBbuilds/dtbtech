# DTB-SMARTQUOTE-014 — AI-assisted scoping, controlled estimates, secure enquiry handoff

**Status: Reviewable Preview; NOT production** — 15 November 2026 (Sydney)

## Product definition

DTB SmartQuote is a project discovery assistant, not a live-market pricing oracle. Visitors describe their website or software project in everyday language, refine the scope, receive a **nonbinding dated estimate band in AUD**, and may request a formal written quote.

Earlier PR #34 was a rules-only planner with obsolete A$1,500 price guidance and no backend. This implementation succeeds that draft, is stacked on package-refresh PR #39, and must not be independently merged. Do not merge PR #34 in parallel.

## Delivered in code

- New /estimate page with free-text project brief, page count, staff count, features, region, budget, timing, accessible status messages and mobile-first layout.
- Public /api/smartquote calculates a **guided** estimate from server-owned pricing rules even without AI credentials.
- Optional AI uses Vercel AI Gateway Chat Completions structured output to extract a project category, features, estimated screens, staff count and clarifying questions. A model NEVER decides the price or creates a customer quote.
- Price engine version **2026-11-15-AU-1**, with explicit scope allowances and market baseline disclosures.
- User can adjust suggested features and recalculate; content is not automatically stored.
- Optional /api/smartquote-submit verifies form validation, consent, origin, Turnstile, request identity, applies limits, recomputes pricing server-side, and only confirms submission if the existing DTB2 enquiry table responds with a durable reference.
- Manual copy, WhatsApp and email paths prepare a draft for a user to review and send; they are never claimed as delivered.
- Homepage, Services, Tradies and footer provide entry points.
- No new database schema, external email sending, notifications, paid AI activation, or production merge.

## Indicative planning anchors (Australia only)

These are proposed DTB one-off **starting** fees, not independently calculated market averages or fixed quotes:

| Project | Base starting amount | Limit |
| --- | ---: | --- |
| Website Rescue | A$450 | A small scoped repair, not a redesign |
| Get Online | A$990 | Single-page site |
| Win More Enquiries | A$2,490 | Two to five pages and basic quote pathway |
| Run Your Crew | A$4,990 | Website plus setup of compatible existing job software, licences extra |
| DTB Crew Portal | A$7,900 | Narrow bespoke staff-portal MVP, separately quoted |
| Small online store | A$5,900 | Product catalogue and checkout baseline, before complex options |
| Custom software | A$12,000 | Discovery-heavy MVP planning starting point |

Additional features such as bookings, payment integrations, accounts, stock, reporting and multiple locations increase the band. Large custom app scopes can exceed these illustrative ranges significantly. Kenya and Other regions receive a tailored quote rather than a blind Australian-dollar conversion.

The estimates use a manually maintained snapshot reviewed **15 November 2026**. They are not real-time competitor prices. A written DTB quote must confirm delivery costs, scope, taxes, hosting, software fees and terms. Never guarantee new business, search ranking or the quoted band.

Benchmarks used for research:
- https://jbweb.solutions/pricing/
- https://www.yourstuff.com.au/blog/website-cost-small-business-australia/
- https://bfj.digital/insights/how-much-does-a-website-cost-in-australia/
- https://www.servicem8.com/au/pricing
- https://www.tradifyhq.com/au/pricing

## AI setup (OFF by default)

Configure in Vercel, not Git or client JS:

- DTB_SMARTQUOTE_AI_ENABLED=true, only after testing/approval
- DTB_SMARTQUOTE_MODEL = exact provider/model ID listed in the currently live https://ai-gateway.vercel.sh/v1/models and suitable for structured JSON output
- AI_GATEWAY_API_KEY (secret), or Vercel-injected VERCEL_OIDC_TOKEN
- DTB_SMARTQUOTE_TURNSTILE_SITE_KEY (public)
- DTB_SMARTQUOTE_TURNSTILE_SECRET_KEY (server secret)
- DTB_SMARTQUOTE_HOSTNAMES = comma-separated exact approved hostnames

AI requires explicit visitor opt-in and verified Turnstile token. User text may be processed by external models; visitors are warned not to include sensitive data.

**Security note:** In-memory IP throttling of 3 calls per 15 min per function instance is NOT a global rate limit. Enable Vercel WAF/edge bot protections, paid-model spend limits and monitoring before allowing public AI traffic. Check live model compatibility, provider data-retention terms and costs.

## Secure submission (OFF by default)

Enable only after real DTB2 owner login, staff inbox, and intake monitoring are verified:

- DTB_SMARTQUOTE_SUBMIT_ENABLED=true
- DTB_INTAKE_SUPABASE_URL = confirmed isolated DTB2 project API URL
- DTB_INTAKE_SERVICE_KEY = server-only key
- The same Turnstile site/secret and exact hostname allowlist above

The new handler reuses public.enquiry_intake and does not expose server credentials in frontend code. It requires explicit contact consent and an idempotent request; successful storage must return a real lead_reference. A request is not a fixed quote or a marketing opt-in. Do not enable until the owner can access incoming enquiries and handle privacy/retention concerns.

## Verification and release gates

- [x] Deterministic server pricing separate from optional AI interpretation.
- [x] Package starting anchors preserved as A$990/A$2,490/A$4,990 and custom staff portal separately scoped.
- [x] Node regression suite included and wired into Vercel build script.
- [x] Submission fails closed when not configured.
- [x] No client-side AI key or database secret.
- [ ] Real browser visual QA on mobile, tablet and desktop.
- [ ] End-to-end Preview GET/POST verification (build passing does not prove browser/API routing).
- [ ] Test optional AI with approved model/Turnstile and managed spending.
- [ ] Resolve PR #33 / PR #35, first staff owner login, real read permissions.
- [ ] Send one authorised synthetic enquiry after activation, verify reference, storage, idempotency, and inbox access.
- [ ] Price/GST and scope owner approval; update privacy notice and data-retention handling.
- [ ] Review all text and noindex status before production; merge parent PR #39 first.
- [ ] Do not claim notifications or email delivery without separate confirmation.

## Operational limitations

This preview does not fetch live market prices per request, does not continuously retrain the pricing engine, and does not provide a legally binding automatic quote. Real AI inference and secure persistence are coded but not activated. No production records were changed.
