# DTB-AUDIT-005 — Site-Wide Quality, Accessibility, SEO & Trust Review

**Date:** 2026-11-03 · **Base:** `main` @ `90c05b3` (includes merged PRs #6, #7, #10, #12)
**Mode:** read-only audit · local server `PORT=3300` · CDP tooling `.shots/audit.js` + `capture.js`
**Scope exclusions:** `components/nav-header.js`, `dashboard.html`, `dashboard/welcome.html`, `dashboard/feedback-admin.html` (PR #14 territory — flagged, untouched); CRM PRs #2/#8 untouched.

## 1. Completed/verified (PASS — no action)

| Area | Evidence |
|---|---|
| Horizontal overflow | `overflow: 0, bad: []` at 320/375/390/768/1440 on /, about, services, contact, projects, help, tech-lab, both location pages; 320+1440 on all 11 service/project detail routes + 404 |
| Console errors | `CONSOLE_ERRORS []` on every audited route |
| Link crawl | zero broken same-origin links crawled from index/about/contact; all 36 sitemap URLs return 200 |
| SEO | unique `<title>` + canonical + single `<h1>` per page; JSON-LD on index/about/contact/projects; robots.txt sane (sitemap ref, dashboard crawlable-for-noindex by design) |
| Images | every `<img>` across root pages has `alt` (0 missing) |
| Asset weight | dist/output.css ~20 KB, largest page script ~4 KB, index ~57 KB |
| Trust infra | `/docs/*` + `/supabase/*` rewritten to 404 (PR #7); contact page shows honest WhatsApp/email/copy fallbacks; no published prices (drafts are `A$__ TBC`); skip link + `aria-current` + focusable `#main-content` (PR #6) |
| Hero proof | owner-approved KEUS + JAT logos, `object-contain`, equal-height cards, correct ownership labels (PR #10) |

## 2. Newly discovered defects

**None at P0.** Candidates at P2 (small, safe):

- **P2 — vague service promise:** `services.html:363` "Quick response times and efficient problem resolution." — softens to avoid implying an SLA. Suggested: "Clear response expectations agreed before work starts." (Smallest safe fix; optional.)
- **P2 — twitter/x markup references:** `index.html` + `contact.html` each reference `twitter` 5× (likely schema `sameAs`/share). Verify whether an X profile actually exists; remove stale `sameAs` entries if not. Owner decision.
- **P2 — 404 canonical:** none present — acceptable since the page should stay `noindex` (verify robots meta is present; currently noindex is not explicitly set — suggest adding `<meta name="robots" content="noindex">`).

## 3. Owner decisions required (claim-matrix carryovers)

| Item | State | Needed |
|---|---|---|
| Social profiles | LinkedIn URL → 200; Facebook + Instagram → 301 (login wall, unverified) | Confirm the FB/IG handles are real/live or remove from footer |
| Greystanes locality | `about.html` JSON-LD `streetAddress: Greystanes` + `contact.html` address line | Confirm address is correct and intended public |
| Payment gateways | Afterpay removed; generic list remains | Confirm which gateways DTB has actually integrated |
| JAT status | "DTB Product" label in hero/portfolio | Confirm beta/live wording for case-study page |
| Response-time phrasing | homepage + contact wording softened in #7 | Confirm any stated reply SLA |
| X/Twitter profile | referenced in markup | Confirm handle exists or remove |

## 4. PR #14 overlap (flagged, untouched)

Legacy public-dashboard auth wording is handled by PR #14 (draft, QA passed). `dashboard.html`, `dashboard/welcome.html`, `dashboard/feedback-admin.html`, `components/nav-header.js` excluded from this audit's fix scope per coordination rules.

## 5. Reproduction commands

```
PORT=3300 node server.js
cd .shots && node audit.js "http://localhost:3300/<route>" "320,375,390,768,1440"
curl -s http://localhost:3300/<sitemap-url>  # all 36 → 200
```

## 6. Recommendation

Marketing surface is in strong shape post-#6/#7/#10/#12. No P0; two small P2 copy/SEO refinements available as a separate fix PR if owner confirms. **Audit complete — report only; no merges, no deploys.**
