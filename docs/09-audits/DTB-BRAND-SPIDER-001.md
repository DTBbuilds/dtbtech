# DTB-BRAND-SPIDER-001 — Image 2 brand adoption

Date: 16 November 2026 (Sydney)  
Scope: DTB Technologies public site favicon, browser icons, installed web-app icon, header/footer and structured brand identity

## Approved direction

The owner selected the **second premium logo design**: an original charcoal spider inside a geometric hexagon with a subtle champagne-gold web over ivory. The recognisable hexagon/spider is used as the **standalone symbol** at favicon, app icon and navbar sizes; the full lockup remains available at `/assets/brand/dtb-full-lockup.svg`.

The `favicon.svg` and full lockup are carefully traced from the selected second original image. The brand vectors preserve the source silhouette and palette, with small pixel-rounding simplifications. Their intended visual identity is the owner's selected original, not a replacement concept.

## Implementation

- `favicon.svg`, `assets/brand/dtb-spider.svg`, `assets/images/default-logo.svg` — spider and web icon.
- `assets/brand/dtb-full-lockup.svg` — full emblem and DTB Technologies wordmark, including original gold divider lines.
- `scripts/build-brand-icons.cjs` — generates browser and app raster assets deterministically from `favicon.svg` with Node built-ins (no external CDN or new dependencies).
- Generated files: `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`, `favicon.ico` (16/32/48/256), `apple-touch-icon.png` (180), `assets/dtb-logo.png` (192), `assets/brand/spider-192.png`, `assets/brand/spider-512.png` and `assets/brand/spider-maskable-512.png`.
- Generated `site.webmanifest`: standalone website identity and appropriate icon types/sizes, including a safe-inset maskable 512px variant. This does **not** create an offline service worker or native app; it is the icon for visitors who install/shortcut the website.
- All **44 HTML pages** now declare the same favicons, Apple icon, manifest and dark browser theme colour; old per-page favicon markup is removed.
- Header, footer and dashboard branding now use the hexagon symbol with subtle rounded-square treatment. The logo URLs in the public Organisation structured data reference the updated 512px image.
- Existing public output packaging remains allowlisted, so internal files cannot leak when brand assets are generated.

## Verification

- [x] Vercel Preview build READY and mandatory build/status SUCCESS.
- [x] New brand tests run after icon generation; sizes, ICO entries, manifest schema, all HTML heads, header/footer identity, structured-data logo reference checked.
- [x] HTTP 200 Preview: homepage, /tradies, /estimate, /dashboard/enquiries, favicon.svg, favicon.ico, png icons, manifest, full SVG lockup, navbar/footer JS and SmartQuote config.
- [x] Internal /docs path remains genuine HTTP 404.
- [ ] Production deployment READY, correct SHA, public icon URLs and manifest HTTP 200.
- [ ] Visual check on Android Chrome, Brave, iOS home-screen icon and desktop browsers.
- [ ] Check Google Search favicon rendering once Google has recrawled the site (not instant or guaranteed by deployment).

## Caching and branding notes

Google ultimately chooses whether and when a changed favicon appears in results, often after re-crawling. Browser caches can also retain the previous icon temporarily. The generated 48px square favicon, root ICO and declared SVG cover common discovery/browser paths.

`assets/dtb-logo.png` in the repository is a legacy **source** file; the Vercel public build explicitly overwrites it with the new generated spider mark. The website's current navbar/footer source points directly at `assets/brand/spider-192.png` so the old source is not used by those components.

Do not confuse this rollout with a redesign of every existing OG/social-sharing photograph or a native app branding release; those are separate surfaces if needed.
