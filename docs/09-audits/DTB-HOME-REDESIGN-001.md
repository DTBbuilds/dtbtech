# DTB-HOME-REDESIGN-001 — Homepage conversion-first information architecture

Status: **Reviewable Vercel Preview, not production**  
Date: 16 November 2026, Sydney

## Why

The previous homepage rendered around 60 KB of HTML, several duplicated value propositions, two portfolio showcases, seven individual service cards, a six-item value proposition grid, three lifecycle cards, a five-step process, large tradie and contact promos, four vanity stats and a repeated footer CTA. On narrow mobile screens visitors faced a long, competing sequence without a clear next action.

## Six-section homepage

1. **Hero:** Specific business-facing offer; SmartQuote as primary CTA; portfolio as secondary. Desktop-only illustrative workflow card, no invented customer metrics.
2. **Three services:** Websites & online stores; bookings & workflows; custom software & apps. Links to existing deep service pages, with compact discoverable links to Tradies and full Services.
3. **One selected-work area:** KEUS Logistics identified as **client website** and Jack of All Trades as **DTB-owned product**, using repository-approved images and links to factual case studies.
4. **Why DTB:** Workflow fit, mobile usability and scoped delivery—three concise points, without unverifiable guarantees.
5. **How it works:** Share needs → Agree scope → Build/review/launch; ongoing support is an optional agreement, not implicitly included.
6. **Final conversion:** SmartQuote estimate or direct contact, with nonbinding-estimate disclosure.

Homepage opts out of the shared footer project-promo card using the existing supported `hide-project-cta` attribute; ordinary footer navigation still renders.

### Navigation

Desktop: Services, Our Work, About, Contact, prominent SmartQuote button.  
Mobile: Home, Services, Our Work, About, Contact, prominent Estimate Your Project button.  
Tech Lab remains discoverable in the footer. Existing menu keyboard/focus handling preserved.

### Scope and rollout safety

- Files changed: `index.html`, `components/nav-header.js`, `tests/smartquote.test.cjs`, this audit note.
- No Supabase changes, AI keys, submission flags, API route changes, third-party dependencies or tracking of customer details.
- Existing SEO metadata, Organization/WebSite JSON-LD, deep services pages, case-study URLs and approved project assets retained.
- Existing Vercel production remains unchanged until a separate release decision.

## Verification

- [x] 20 SmartQuote tests run during Vercel Preview build; intake and inbox test suites also run.
- [x] Vercel Preview READY, combined check SUCCESS.
- [x] Six section IDs in correct order; one H1; both SmartQuote links present; direct contact remains.
- [x] Duplicate featured-project gallery, secondary lifecycle and stat grids, and footer promo removed.
- [x] Preview URL returns HTTP 200 for home, SmartQuote, service landing pages, Tradies, both case studies, both project image assets and generated Tailwind CSS.
- [x] Both existing structured-data scripts parse as JSON.
- [x] Header script parses successfully and includes mobile and desktop estimate links.
- [ ] **Human visual review:** 320/360/390/430px phones, tablet, desktop; inspect menu, image crops, motion-reduced preferences, scroll rhythm and touch target spacing in a real browser.
- [ ] **Real customer journey:** homepage → estimator → guided result → consented Turnstile submission → saved lead reference → authorised CRM read. Public API GET checks alone do not prove this.
- [ ] **Analytics:** establish baseline homepage-to-estimate clicks, completed estimates, submissions and case-study visits with privacy-safe event names; the new `data-cta` labels are hooks, not a configured analytics destination.
- [ ] Confirm owner copy/design review and SEO/structured data consistency before production merge.

## Design guidance

Keep the homepage as a concise buying guide. Avoid bringing back a second project gallery or service-detail brochure. New proofs should live on /projects and specific services on /services unless a measured business objective supports expanding the homepage.
