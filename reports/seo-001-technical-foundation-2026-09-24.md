# DTB-SEO-001 — Technical SEO Foundation Report

Date: 2026-09-24
Baseline: `main` @ a3c53c6
Branch: main

## Canonical strategy

Standardised on **extensionless (clean) URLs** — `vercel.json` sets
`cleanUrls: true`, so Vercel already issues permanent (308) redirects from
`/page.html` → `/page`. `server.js` now mirrors this locally (308 for `.html`,
extensionless paths serve the `.html` file, trailing slashes normalise).

canonical / og:url / twitter:url / sitemap / internal links now all use the
clean URL.

## Fixed mismatches

- `contact.html` declared **two** canonicals (`.html` + clean) — now one.
- `about.html` canonical was `.html` while og:url was clean — unified.
- `index.html`, `projects.html`, `projects/jack-of-all-trades.html`, most
  `services/*.html` used `.html` canonicals — now clean.
- 16 pages had **no canonical at all** (minor service pages, tech-lab skill
  pages) — added.
- All internal `href="*.html"` links rewritten to clean form (40 files).

## Meta cleanup

- Removed every `<meta name="keywords">` (Google ignores it).
- Removed `geo.region`, `geo.placename`, `geo.position`, `ICBM` site-wide.
- Removed fabricated street-level address + geo coordinates from the homepage
  `ProfessionalService` schema → replaced with a single canonical
  `Organization` (`#organization`) + `WebSite` entity. `PostalAddress` blocks in
  `services.html`, `about.html`, `contact.html` reduced to locality/country.
- Dashboard (`dashboard.html`, `dashboard/*`) and `404.html` now carry
  `noindex, nofollow`; matching `robots.txt` Disallows removed so crawlers can
  actually see the noindex.

## Page → search-intent map

| Page | Primary intent | Title |
|---|---|---|
| `/` | custom software development Sydney | Custom Software Development Sydney \| Web & App Developers |
| `/services/software-development` | custom software development | Custom Software Development \| Business Software & Integrations |
| `/services/web-app-dev` | web application development | Web Application Development \| Portals, Dashboards & Marketplaces |
| `/services/websites` | website development | Custom Website Development \| Business Websites |
| `/services/mobile-apps` | mobile app development | Mobile App Development \| Android & iOS Apps |
| `/services/e-commerce` | ecommerce development | Ecommerce Website Development \| Custom Online Stores |
| `/services/hosting-domains` | managed web hosting / domains | Managed Web Hosting & Domain Registration |
| `/services/it-support` | IT support (remote AU/KE, on-site Nairobi) | IT Support Services \| Remote & On-Site Tech Help |
| `/locations/software-development-sydney` | software development Sydney | Software Development Sydney |
| `/locations/software-development-nairobi` | software development Nairobi | Software Development Nairobi |
| `/projects/jack-of-all-trades` | community job marketplace (brand) | Jack of All Trades \| Community Job Marketplace |
| `/projects/smartduka` | POS/inventory platform (brand) | SmartDuka \| Retail POS & Inventory Platform |

## Cannibalisation resolved

`services/web-app-dev` previously targeted generic "Web Development Kenya",
competing with `services/websites`. Repositioned to web application
development: customer portals, dashboards, internal tools, booking systems,
marketplaces, integrations — with JAT / SmartDuka / Fix Place as proof and a
cross-link back to `websites` for brochure sites.

## New pages

- `locations/software-development-sydney.html` — AU service context, local
  phone, JAT as local proof.
- `locations/software-development-nairobi.html` — Kenya context, M-Pesa,
  SmartDuka / Fix Place / Mopatience as proof, on-site IT support.
- `projects/smartduka.html` — POS/inventory case study (pre-existing untracked
  work; normalised canonical, OG image, breadcrumbs, service links).

## Social/OG assets

Created real 1200×630 branded cards in `assets/og/`: `home.jpg`,
`services.jpg`, `projects.jpg`, `jack-of-all-trades.jpg`, `default.jpg`,
`smartduka.jpg` (SmartDuka uses existing `assets/projects/smartduka-og.png`).
No page references a missing image anymore.

## Structured data

- Homepage: Organization + WebSite (name, alternateName, url, logo,
  contactPoint AU/KE, areaServed AU+KE, sameAs incl. GitHub).
- BreadcrumbList + visible breadcrumbs on all `services/*` (16) and
  `projects/*` (2) and both location pages.
- Service schemas' `url`/`areaServed` corrected; `.html` URLs in JSON-LD
  normalised.
- All JSON-LD validated as parseable JSON; FAQPage schemas match visible FAQs.

## Sitemap / robots

- `sitemap.xml` rebuilt: 34 clean URLs, `lastmod` 2026-09-24 (this change),
  `priority`/`changefreq` removed, dashboard/404 excluded.
- `robots.txt`: dashboard Disallows removed (noindex needs to be readable);
  `/node_modules/`, `/reports/`, `/src/` remain disallowed.

## Verified locally (npm run build + node server.js :3001)

- All 34 sitemap URLs → 200, canonical matches URL, no noindex.
- `*.html` → 308 to clean URL; `/tech-lab`, `/dashboard` edge cases handled.
- All og:image/twitter:image URLs resolve (200).
- Zero `meta keywords`, geo meta, or missing-image references remain.
- All titles & meta descriptions unique across indexable pages.

---

## Search Console release checklist (owner, post-deploy)

1. Verify ownership of `dtbtech.org` in Google Search Console (and Bing WMT).
2. Submit `https://dtbtech.org/sitemap.xml`.
3. URL Inspection → request indexing for: `/`, `/services/software-development`,
   `/services/web-app-dev`, `/projects`, `/projects/smartduka`,
   `/locations/software-development-sydney`,
   `/locations/software-development-nairobi`.
4. Confirm dashboard pages report "Excluded — noindex" (not "Blocked by
   robots.txt").
5. Monitor Coverage + Page Experience weekly for the first month.
6. Record baseline queries / impressions / clicks / position (Performance →
   Search results, last 28 days) on day 1 and day 28.

## SEO-002 content map (proposed — not built in this phase)

| Query cluster | Preferred page | Notes / risk |
|---|---|---|
| custom software development Sydney | `/` (primary) + `/locations/software-development-sydney` | Keep homepage as main target; location page supports local pack intent |
| software development Sydney | `/locations/software-development-sydney` | |
| software development Nairobi / Kenya | `/locations/software-development-nairobi` | |
| custom software development | `/services/software-development` | |
| web application development | `/services/web-app-dev` | newly repositioned; watch vs `/services/websites` |
| website development | `/services/websites` | |
| mobile app development | `/services/mobile-apps` | |
| ecommerce development | `/services/e-commerce` | |
| managed web hosting / domains | `/services/hosting-domains` | |
| marketplace development | **new** `/services/marketplace-development` | Strong evidence: JAT + Fix Place. Recommended #1 for SEO-002 |
| POS / inventory software | **new** `/services/pos-inventory-software` or expand `/projects/smartduka` | SmartDuka is direct proof; a service page could cannibalise the product page — prefer one service page that links to SmartDuka |
| business automation / internal tools | section of `/services/software-development` now; dedicated page later | Evidence exists (internal tools language) but thin — expand service page first |
| API / system integrations | section of `/services/web-app-dev` | Supported (M-Pesa/Stripe/API copy); dedicated page only with more proof |
| MVP development | **new** `/services/mvp-development` | Moderate evidence (JAT private beta is an MVP); viable SEO-002 page |
| SaaS development | defer | Limited proof; fold into web-app-dev for now |
| AI development / integration | defer | SmartDuka mentions AI-assisted analytics only — too thin for a page |
| software modernisation / project rescue | defer | No evidence in current work |
| customer portals | covered under `/services/web-app-dev` | |

Cannibalisation watch-list: `web-app-dev` vs `websites` (resolved);
`tech-lab/skills/web-development` is thin and topically overlaps
`services/websites` — consider consolidating or noindexing in SEO-002;
SmartDuka service-page vs product-page risk noted above.
