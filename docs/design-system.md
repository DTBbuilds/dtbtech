# DTB Technologies — Design System (DTB-CONVERT-001A)

A small, documented visual system for the marketing site. The goal is one
coherent navy/blue interface, not a redesign: all values below describe the
**existing** brand and are enforced through `css/tokens.css` plus the Tailwind
utility classes already in use.

## Stylesheet inventory

Every page loads stylesheets in this order (root pages use `./`, sub-directory
pages use `../`, `404.html` uses absolute `/` paths because it can be served at
any depth):

| Order | File | Purpose |
| --- | --- | --- |
| 1 | `dist/output.css` | Compiled Tailwind (`npm run build` → `src/input.css`) |
| 2 | Font Awesome 6.6.0 (jsDelivr CDN) | Icons only |
| 3 | `css/tokens.css` | Design tokens (`--dtb-*` custom properties) |
| 4 | `css/common.css` | Hand-written layout/card/button classes (legacy dashboards) |
| 5 | `css/animations.css` | Keyframes (`blob`, `float`, `orbit`) |
| 6 | `css/mobile-optimizations.css` | Reduced-motion, focus-visible, safe-area, small-screen fixes |

**Legacy / not loaded by any current page** (kept for reference, do not extend):
`styles/main.css`, `styles.css`, `styles/auth-modal.css`,
`components/auth-buttons.js`, `components/auth-modal.js`.
`js/auth/*` and `dashboard/*.html` are the old client-side demo area — not part
of the marketing design system.

## Tokens (`css/tokens.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--dtb-bg` | slate-950 `#020617` | page background |
| `--dtb-surface` | slate-900 `#0f172a` | raised sections, nav backdrop |
| `--dtb-surface-2` | slate-800 `#1e293b` | cards, chips, secondary buttons |
| `--dtb-border` / `--dtb-border-soft` | slate-700 at 50% / 30% | card & section borders |
| `--dtb-accent-strong` | blue-600 `#2563eb` | primary CTA background |
| `--dtb-accent-strong-hover` | blue-700 `#1d4ed8` | primary CTA hover |
| `--dtb-accent` | blue-500 `#3b82f6` | focus rings, active states |
| `--dtb-accent-soft` | blue-400 `#60a5fa` | links & icons on dark |
| `--dtb-accent-text` | blue-300 `#93c5fd` | badge text |
| `--dtb-text` | gray-300 `#d1d5db` | body copy on dark |
| `--dtb-text-strong` | white | headings |
| `--dtb-text-muted` | slate-400 `#94a3b8` | supporting copy |
| `--dtb-text-faint` | slate-500 `#64748b` | captions |
| `--dtb-success` | green-400 `#4ade80` | "Live" badges |
| `--dtb-radius-sm…xl` | 0.5–1.5rem | sm: inputs · md: buttons · lg: cards · xl: panels |
| `--dtb-header-height` | 4rem | fixed nav clearance (`scroll-mt-24` on anchors) |
| `--dtb-container-max` | 80rem | content max width (`max-w-7xl`) |
| `--dtb-tap-target` | 44px | minimum interactive size (`min-h-[44px]`) |

## Component conventions

- **Primary CTA**: `bg-blue-600 hover:bg-blue-700`, `rounded-xl`,
  `px-6 py-3 min-h-[44px]`, `text-white font-semibold text-sm`.
- **Secondary CTA**: `bg-slate-800 hover:bg-slate-700`,
  `border border-slate-700 hover:border-slate-600`, same sizing.
- **Cards**: `bg-slate-800/60 rounded-2xl border border-slate-700/30`;
  hover `border-blue-500/40`.
- **Badges/pills**: `rounded-full`, accent wash `bg-blue-600/10` +
  `border-blue-500/20`, text `text-blue-300 text-xs`.
- **Headings**: page `<h1>` once per page; section `h2` =
  `text-2xl sm:text-3xl font-bold text-white`; card titles `text-lg font-bold`.
- **Nav**: fixed `h-16`, `bg-slate-900/60 backdrop-blur-md`; active link gets
  `border-b-2 border-blue-500` (desktop) / `bg-blue-600/30` (mobile) and
  `aria-current="page"`.
- **Anchors under the fixed nav** need `scroll-mt-24` (or more).

## Breakpoints & motion

Tailwind defaults: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280.
QA widths: **320 / 375 / 390 / 768 / 1440 px** — zero horizontal overflow is a
release gate. `prefers-reduced-motion` disables all animation globally
(`css/mobile-optimizations.css`); keep any new animation transform/opacity-only.

## Accessibility states

- Skip link ("Skip to main content") is rendered by `components/nav-header.js`
  and targets `#main-content` — every page using `<nav-header>` must expose a
  `main`/landmark with `id="main-content"`.
- Interactive elements: ≥44px tap targets, visible `:focus-visible` ring
  (blue-500), `aria-current="page"` on the active nav item, `aria-expanded` on
  the mobile menu toggle (with Escape-to-close and focus trap).
- Minimum body-text contrast pairs: `slate-400` on `slate-950` (AA large+body),
  `blue-400`/`blue-300` on `slate-900` (AA). Do not place slate-500 text below
  `text-xs` on `slate-950`.
