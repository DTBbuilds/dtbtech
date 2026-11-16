# DTB-SEO-CONTENT-002 — Audit-to-action report

Prepared: 16 November 2026 (Sydney). Baseline: completed OpenSEO crawl exports supplied by the project owner.

## Source inventory
- `audit-pages.csv`: 44 crawled URL rows; all HTTP 200, every page one H1, zero reported image-alt omissions. Six rows are query-string variants of the canonical /contact page.
- `audit-issues.csv`: 75 findings: 26 long titles, 20 long descriptions, 13 potential orphans, 8 thin-content warnings, 6 expected /contact canonical variants, 1 heading-level skip, 1 deliberate /estimate noindex.

## Diagnostic distinctions
- Long titles/descriptions are display and quality recommendations, not hard Google ranking limits. Avoid making keywords repetitive merely to satisfy a character counter.
- /contact query variants are intentionally canonicalised to the canonical contact page.
- /estimate noindex is a deliberate hold while real browser/Turnstile/CRM submission acceptance remains unverified. Don't remove it as an automatic audit fix.
- Orphan findings need verification. Primary navigation is rendered by a JS custom element, which some HTML-only crawlers won't execute. This release adds *static contextual links* on high-value commercial paths rather than assuming every flag is a real orphan.
- Eight thin-content warnings primarily target Help, Kenya-specific hardware/network pages and Tech Lab skill pages. Padding them with generic content is not warranted. Their usefulness, service coverage and indexability need separate review.

## Intent mapping (not verified keyword volumes)
- Home: Sydney business websites & software studio, broad discovery.
- `/locations/software-development-sydney`: specifically Sydney custom software service and local scoping.
- `/services/software-development`: custom business software, staff workflows, APIs/integrations in AU/KE.
- `/services/web-app-dev`: customer/staff portals, dashboards and booking web apps.
- `/services/websites`: small business website design.
- `/tradies`: Australian tradie website packages, quotes and job-workflow options.
- `/services/website-repairs`: existing website repair and redesign.
- Portfolio pages: factual KEUS (client), JAT (DTB-owned) and SmartDuka (product) case studies.

## Implemented
1. Added specific business-software use cases and visible answers covering build-versus-buy, cost drivers and working in Sydney/Nairobi; links to real project and service pages.
2. Expanded the Sydney service page with practical scope, process and budget answers; softened an automatic “fixed quote” promise into a written-proposal commitment.
3. Added crawlable contextual Sydney software links to home, services and web-app pages.
4. Refined unique metadata (titles, meta descriptions and matching OG/Twitter tags) across 22 priority pages; kept SmartQuote noindex.
5. Reconciled website maintenance wording: ongoing care is available under an agreed plan, not automatically included.
6. Repaired Tech Lab's H1 → H2 → H3 heading hierarchy.
7. Updated sitemap lastmod only on the four pages with material on-page content changes.
8. Added automated SEO content regression coverage to the mandatory Vercel build.

## Deferred & measurement
- Review orphan/low-content group individually; preserve real information and avoid boilerplate.
- Verify GSC index status for /tradies, Sydney location and web-app pages after Google recrawl.
- Obtain real GSC non-branded queries before making claims about search volume or ranking gains.
- Test a consented live SmartQuote estimate → submission → staff inbox journey before changing noindex.
- Use the previously connected OpenSEO project to track clicks, impressions and qualified enquiries after release.
- This report does not claim Google rankings or AI citations improve immediately; indexing is at Google's discretion.
