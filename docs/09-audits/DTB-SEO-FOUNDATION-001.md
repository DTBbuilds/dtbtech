# DTB-SEO-FOUNDATION-001 — technical search foundation

**Prepared:** 2026-11-16 (Sydney)  
**Scope:** SEO canonical signals, valid HTTP 404, staff noindex, public-output privacy  
**Project:** DTB Technologies (`dtbtech.org` / `www.dtbtech.org`)

## Verified baseline

- Search Console domain property `sc-domain:dtbtech.org` connected; site owner verified.
- Index inspection: Google has indexed the apex homepage, selected service URLs and a historical `www.dtbtech.org/dashboard` URL. Tradies and Sydney software-development URLs were unknown to Google at the time checked (a report of existing index state, **not** a live crawl).
- Vercel project domain configuration: `dtbtech.org` redirects to `www.dtbtech.org`; `www` serves production.
- Prior live routing returned HTTP 200 homepage for nonexistent URLs and missing /docs paths (soft-404 risk).
- Prior Vercel `outputDirectory: "."` published existing internal docs and `supabase/migrations/*.sql` as static files. Rewrites were insufficient because existing static resources were resolved before the rewrite.

## Changes

1. **Canonical consistency:** all 38 public HTML files replace apex absolute DTB URLs with `https://www.dtbtech.org` for HTML canonical, OpenGraph and relevant JSON-LD references. Existing `noindex` on SmartQuote remains unchanged pending a verified real enquiry journey.
2. **Sitemap and crawler signals:** 37 sitemap locations and `robots.txt` now refer to the `www` canonical host. Meaningful modified dates updated on the revised homepage, services listing, projects listing and tradie page. Internal areas remain excluded from the sitemap.
3. **Real 404:** final Vercel rewrite routes filesystem misses and /docs/ /supabase/ paths to `api/not-found.js`, which returns HTTP 404 and `noindex, nofollow`. Existing APIs and website paths retain precedence.
4. **Private-path indexing:** `X-Robots-Tag: noindex, nofollow, noarchive` sent on staff dashboard and auth paths. Staff pages remain crawlable to allow engines to observe noindex. This is not a replacement for authentication.
5. **Public-only deployment output:** Vercel now publishes `site/` produced from an explicit allowlist of public HTML, assets, CSS, JS and other website resources. Repo-only `docs/`, `supabase/`, `src/`, `lib/`, `tests/`, `reports/`, `server.js`, `package.json` and other source files are excluded. Node serverless API functions still deploy and work separately.
6. **Build gate:** `tests/seo-foundation.test.cjs` validates public-file inclusion, internal exclusions, sitemap targets, canonical consistency, HTTP 404 handler and dashboard headers. Runs as part of Vercel's build after public-output assembly.

## Preview verification

Preview branch `feat/dtb-seo-foundation-001` built READY on Vercel. Checked:

- HTTP 200: root, /about, /contact, /services, /tradies, Sydney software page, software/websites/web-app service pages, portfolio pages, /estimate, /dashboard/enquiries, /api/inbox-config, /api/enquiry, /api/smartquote, /api/smartquote-submit, CSS/JS, favicon and portfolio image.
- HTTP 404: nonexistent public URL, existing internal `docs/09-audits/DTB-HOME-REDESIGN-001.md`, existing `supabase/migrations/20261110000007_enquiry_intake_activation.sql`, /README.md, /server.js, /package.json and /reports/test.html.
- Staff inbox response: `X-Robots-Tag: noindex, nofollow, noarchive`.
- Public HTML metadata now self-nominates `https://www.dtbtech.org`.
- Sitemap: 37 entries, now consistently on the `www` host.
- **Note:** Vercel Preview adds a global `X-Robots-Tag: noindex` for preview deployments. Public indexing must be assessed on the custom production domain, not Preview.

## Post-release checks

- [ ] Vercel Production status READY, matching merged commit, all API and internal/static route smoke checks pass.
- [ ] Public production pages are **not** carrying Preview's global `X-Robots-Tag: noindex`; staff paths **are** noindex.
- [ ] `www.dtbtech.org/sitemap.xml` returns 200 with 37 www canonical URLs; robots.txt references it.
- [ ] Submit updated sitemap via Google Search Console and inspect `www` /tradies and /locations/software-development-sydney. Indexing/recrawl can take time and is not guaranteed.
- [ ] Monitor /dashboard removal from Google index over time; don't block dashboard in robots.txt before Google reads noindex.
- [ ] Keep SmartQuote `noindex` until a real customer quote/consent/Turnstile/post/inbox journey is validated. Then assess indexing.
- [ ] Baseline Google traffic with the verified OpenSEO/GSC property and compare after recrawl.

**Safety:** This release doesn't modify DB policies, authentication, AI credentials, submission flags, price estimator logic or customer records. It changes the static output packaging; any post-release 404 on a legitimate public asset requires immediate inspection and a targeted fix or deployment rollback.
