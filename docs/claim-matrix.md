# DTB-CONVERT-001C — Content claim-verification matrix

Audit date: 2026-11-02 · Branch: `feat/dtb-convert-001c-trust-copy`
Scope: `index.html`, `about.html`, `services.html`, `services/*`, `projects.html`,
`projects/*`, `contact.html`, `locations/*`, `tech-lab.html`, `help.html`, `404.html`,
`components/site-footer.js`, JSON-LD blocks.

Legend: **OK** = supported on-page / verified · **VERIFY** = plausible but needs owner
confirmation · **FIXED** = claim softened/rewritten in this PR · **FLAG** = needs a
business decision.

## 1. Claims audited

| # | Page | Current claim | Evidence | Action in this PR |
|---|------|---------------|----------|-------------------|
| 1 | index.html (service card) | "Fast on every device, ranks on Google" | None — implies ranking outcome | **FIXED** → "built to be found on Google" (technical SEO capability, not a rank promise) |
| 2 | index.html ("Found by Real Customers") | "SEO-ready websites that show up on Google" | Partial — SEO-ready is technical; "show up" is soft | **FIXED** → "clean markup, metadata and performance so search engines can index you properly" |
| 3 | index.html ("Get Paid, Sell Online") | "Stripe, PayPal, M-Pesa, Afterpay, cards and bank transfers" | SmartDuka documents M-Pesa; Stripe/PayPal plausible for e-commerce work; **Afterpay unverified** | Kept (deliverable capability) — **VERIFY** which gateways DTB has actually integrated; remove Afterpay if unconfirmed |
| 4 | services/e-commerce.html | "Product pages built to rank" | None | **FIXED** → "built to be indexed and found" |
| 5 | services/web-app-dev.html | "fast loads, high Lighthouse scores" | No published scores | **FIXED** → "performance-first builds measured against Core Web Vitals" (no invented scores) |
| 6 | index.html footer CTA strip | "Free consultation · No commitment" | Consistent with brief flow | OK — kept |
| 7 | contact.html (WhatsApp card) | "Replies usually within a few hours during business hours" | Unverified service-level promise | **FIXED** → "we reply during business hours"; **VERIFY** actual response SLA with owner |
| 8 | about.html + contact.html + JSON-LD | "Greystanes, Sydney NSW 2145" / `streetAddress: Greystanes` / "operating out of Greystanes" | Specific suburb + postcode | **VERIFY** — confirm genuine operating base; if it is not a client-visit premise, wording stays suburb-level only (no street/office). Kept as-is |
| 9 | site-footer.js | Social links: fb/dtbtechnologies, linkedin/company/dtbtechnologies, ig/dtb_technologies, github/DTBbuilds | GitHub verified (repo host); FB/LI/IG unverified | **VERIFY** — confirm profiles exist & are maintained, else remove icons |
| 10 | about.html | "began as a small IT consultancy in Nairobi… today based in Sydney" | Consistent across site (foundingLocation Nairobi in JSON-LD) | OK — honest Sydney-present / Nairobi-history positioning |
| 11 | projects.html + index.html | KEUS Logistics = client website, live at keuslogistics.com | URL verified live (HTTP 200, 2026-11-02); page states Client: KEUS Logistics Ltd | OK — tagged "Client website" on cards |
| 12 | projects.html | SmartDuka = DTB's own free/open-source product, live at smartduka.org | URL verified live; page states built by DTB | OK — tagged "DTB product" on cards |
| 13 | projects.html + detail | Jack of All Trades "Private Beta", "our latest build" | DTB-owned product; beta status plausible | OK — tagged "DTB product · beta"; **VERIFY** beta status is still accurate |
| 14 | projects.html | Linda's Nut Butter, Mopatience Organisation, Fix Place Kenya — "Live Website" | All URLs verified live (HTTP 200) on *.vercel.app | **VERIFY/FLAG** — classify as client work vs DTB showcase builds. Tagged neutrally "Built by DTB" until owner confirms |
| 15 | index.html / about.html | "No account managers", "talk to the people building your software", "small team" | Studio-size claim | **VERIFY** — confirm team structure stays accurate |
| 16 | index.html ("We Stick Around"), about values | Ongoing support/maintenance claims | Support is offered (hosting & IT services exist) | OK — support now scoped explicitly in new process step 5 ("quoted separately, no lock-in") |
| 17 | dashboard.html + `js/auth/*` | Client-side demo login (`localStorage` flags, placeholder API key) | Demo, not security; PR #2 builds the real CRM | **FLAG** — public site should not imply a working client portal; CRM PR #2 supersedes. No change here |
| 18 | services/* pages | "SEO-ready" technical claims, WCAG/accessibility mentions | Markup/technical capability | OK |
| 19 | tech-lab.html | Own tooling/experiments page | In-house content | OK — reviewed, no claims requiring change |
| 20 | All pages | `dtbbuildsoffice@gmail.com` contact email | Consistent everywhere | OK |
| 21 | index.html | Payment icons/stat "2 Countries · AU & KE" | Consistent with positioning | OK |
| 22 | contact.html brief | "This page does not automatically submit or save your information" | True today (prepare-and-send) | OK — issue #4 (001B) owns real submission; keep honest until then |

## 2. Positioning consistency check

- Sydney-present / Nairobi-history is consistent: hero badge "Australia & Kenya",
  About "began in Nairobi, today based in Sydney", `foundingLocation: Nairobi`,
  footer Sydney contact block. No conflicting "Nairobi-based" current-positioning
  found. `locations/software-development-nairobi.html` correctly frames Kenya as a
  served market, not the HQ.
- No physical office/street address claimed beyond suburb+postcode (item 8 VERIFY).
- No testimonials, star ratings, client counts, revenue/traffic metrics or
  guaranteed-SEO language found anywhere — nothing fabricated to remove.
- No unused shop/cart UI found; the only cart reference is an e-commerce
  capability icon on the homepage.

## 3. Owner confirmations requested

1. Item 3 — confirm which payment gateways DTB has actually delivered (Afterpay?).
2. Item 7 — confirm real reply-time promise for WhatsApp/email/phone.
3. Item 8 — confirm Greystanes base may be stated (suburb-level only).
4. Item 9 — confirm FB/LI/IG profile URLs exist and are maintained.
5. Item 13 — confirm JAT "Private Beta" is still the correct status.
6. Item 14 — classify Linda's Nut Butter / Mopatience / Fix Place (client vs showcase).
7. Item 15 — confirm "small team / direct access" phrasing matches reality.
8. `docs/pricing-draft.md` — approve/revise the draft scope & price matrix before
   any figures appear on the site.
