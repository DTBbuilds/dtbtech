# DTB-CONVERT-001D — Release Readiness Report

Date: 2026-11-02 · Scope: PRs #2, #6, #7, #8 · **Nothing merged or deployed.**

## 1. PR & commit inventory

| PR | Branch | Base | Head | Status |
|----|--------|------|------|--------|
| #6 Design system | `feat/dtb-convert-001a-design-system` | `main` @0466a45 | `191997f` | open, review fixes applied |
| #7 Trust copy | `feat/dtb-convert-001c-trust-copy` | `feat/dtb-convert-001a-design-system` (retargets to main on merge) | `e4e2364` | open, merged latest #6 cleanly |
| #2 CRM (pre-existing draft) | `feat/dtb-leads-002-crm` | `main` | `25bd06b` | draft, hosted gate pending |
| #8 Enquiry intake | `feat/dtb-convert-001b-lead-intake` | `feat/dtb-leads-002-crm` | `51f701d` | open, review fixes applied |

Merge order: **#6 → #7 → #2 → #8** (B depends on CRM tables/migrations).

## 2. Review findings → resolutions (Phase 1)

PR #6 (11 findings):
- ✅ FIXED: skip-link target not focusable → `tabindex="-1"` on all `#main-content`.
- ✅ FIXED: tech-lab/skills/* (7 pages) missing tokens.css + main-content.
- ✅ FIXED: dashboard/welcome landmark div → `<main>`.
- ✅ FIXED: `aria-current` matched section parents on detail routes → exact-page match.
- ✅ FIXED: 404 text contrast 3.6:1 → slate-400 (≥4.5:1).
- ✅ FIXED: desktop nav links 40px → min-h-44px.
- ➖ FALSE POSITIVE: mobile-menu `aria-controls`/`aria-expanded` — present and verified live in DOM; updates on toggle.
- ➖ FALSE POSITIVE: `innerHTML` XSS flags — template contains only developer-controlled constants; no user data.

PR #7 (2 findings):
- ✅ FIXED: `docs/*` + `supabase/*` publicly served → `vercel.json` rewrites both to `/404.html` (repo itself remains public; site no longer serves internal docs).
- ✅ FIXED: Afterpay advertised unverified → removed; generic gateway list. `pricing-draft.md` figures → `A$__ (TBC)` placeholders.

PR #8 (12 findings):
- ✅ FIXED: pre-parsed JSON `null` hung the handler; byte cap bypassed for pre-parsed bodies → immediate return + Content-Length/serialized checks (413).
- ✅ FIXED: caller-controlled first XFF spoofed rate limits → `x-real-ip` → last XFF → socket.
- ✅ FIXED: whatsapp preference didn't require a phone (server + client now enforce; test added).
- ✅ FIXED: unapplied migration 007 → misleading 502 → now `503 store_not_ready` on PGRST204.
- ✅ FIXED: conflict-lookup test ignored URL → asserts idempotency-key in query; unreachable test asserts `store_unreachable`; +3 new cases (null, oversized, whatsapp) → **22/22 green**.
- ✅ FIXED: intake SQL test log-row lost in rollback; name-only index/policy checks → uniqueness + `is_active_staff` predicate assertions; registered in `run-local-tests.sh`.
- 📝 DOCUMENTED: sequence lpad minimum — format is `DTB-YYYYMMDD-<4+ digits>` (unique, not truncated).

## 3. Automated test results

- `npm ci` ✅ · `npm run build` ✅ (Tailwind + CRM config placeholder mode)
- `node api/enquiry.test.mjs` ✅ **22/22** (405, 503 not_configured, 9×400 validation, 201+ref, 409→200 same ref + key-URL assert, 502×2, 429, null-body, oversized, whatsapp±phone)
- Live Express: `POST /api/enquiry` w/o env → `{"ok":false,"error":"not_configured"}` ✅ honest
- `node --check` all new/edited JS ✅
- Responsive: **0 horizontal overflow, 0 console errors** at 320/375/390/768/1440 on index, about, services, projects, contact, help, tech-lab(+skills), services/websites, projects/keus-logistics, locations/sydney, dashboard/welcome; all internal links 200; no Sydney/Nairobi imagery.

## 4. Hosted verification (Phase 3) — BLOCKED

No Supabase test project credentials or Vercel Preview env vars exist locally.
All hosted checks (CRM auth matrix, RLS denial, real reference persistence,
duplicate handling, staff triage, notification delivery) are marked
**BLOCKED — owner must provision**; protocol: `docs/crm-verification.md` +
`supabase/test/enquiry-intake-test.sql` + `docs/enquiry-intake.md`.
Mocked tests were NOT substituted for hosted verification.

## 5. Outstanding blockers

1. Supabase test project + `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` (server-only) + Vercel Preview env.
2. `RESEND_API_KEY` + `DTB_NOTIFY_EMAIL` for enquiry notification (dormant otherwise).
3. Owner confirmations: claim-matrix items (gateways, reply SLA, Greystanes, socials, JAT status, card classification, team phrasing) and `pricing-draft.md` sign-off.
4. CRM triage view for `enquiry_intake` rows (follow-on; RLS ready).

## 6. Integration review (Phase 2)

- #7 cleanly merged updated #6 (auto-merge, 0 manual conflicts).
- #8 vs CRM branch: 0 conflicts; `contact.html` edits land in different regions vs #6/#7 (stylesheet block + main id vs brief section) — expected clean; `dist/output.css` is a generated artifact — if it ever conflicts, **rebuild** (`npm run build`), don't hand-merge.
- Migrations run in filename order; 007 is additive only; CRM functionality untouched (no duplicated tables).
- Safe fallback verified: without env, endpoint 503s honestly and WhatsApp/email/copy paths still work.

## 7. Owner decisions required

Approve merge order; provide Supabase test + Vercel env credentials (via env UI, never chat/git); approve pricing draft or keep TBC; resolve claim-matrix VERIFY items; choose notification provider.

## 8. Rollback strategy

- #6/#7: revert merge commits; static site only — no data risk.
- #2: drop migrations 001–006 (test env); #8: `revert api/enquiry.js` mount + drop 007 objects — intake inert without env vars regardless.
- Site-level instant rollback: Vercel "promote previous deployment".

## 9. Recommendation

**NO-GO for production** until: owner provisions the Supabase test project + env vars and hosted verification passes (§4), claim-matrix VERIFY items are answered, and pricing draft is signed off. **GO for merge review** of #6 and #7 now — they are self-contained, tested, and carry no service dependencies.
