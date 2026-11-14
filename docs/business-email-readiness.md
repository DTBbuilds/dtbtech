# DTB-BIZREADY-006 — Contact Channel Audit & Business Email Readiness (issue #20)

Date: 2026-11-03 · Branch `feat/dtb-bizready-006-email-readiness` · Base `main` @ `17398955`
READ-ONLY audit; no mailbox created, no credentials touched, nothing deployed.

## 1. Contact channel inventory (Devin audit against main)

| Channel | Value | Placements | Behaviour | Status |
|---|---|---|---|---|
| WhatsApp AU | `wa.me/61450275013` | 17 links (incl. service-specific prefilled `?text=`) | Opens WA with optional prefilled brief — no server storage | ✅ working |
| WhatsApp KE | `wa.me/254729983567` | 2 links | Same | ✅ working |
| Phone AU | `tel:+61450275013` | 15 | Native dialler | ✅ working |
| Phone KE | `tel:+254729983567` | 2 | Native dialler | ✅ working |
| Email | `mailto:dtbbuildsoffice@gmail.com` (×5 text placements) | footer, contact page, brief "Open Email Draft" | mailto draft in user's client — no server storage | ✅ working |
| Brief form | `js/project-brief.js` | contact | Prepares WA/email/copy — **correctly claims no persistence** | ✅ honest |
| Secure enquiry intake | Not present on current production `main` | PR #8 only | The secured `/api/enquiry` endpoint and submission UI are on an **unmerged** dependent branch, not deployed | **Deferred — NOT LIVE** |

Devin reported no link/UX defects in the audited manual paths. These counts reflect occurrences, not necessarily distinct pages or unique contacts; do not interpret them as new backend submissions. **No frontend fix PR required.**

## 2. DNS / email capability audit (read-only `nslookup`)

| Record | Value | Implication |
|---|---|---|
| `MX dtbtech.org` | **none** | Domain cannot receive email at all today |
| `TXT dtbtech.org` (SPF) | only `google-site-verification=…` | No SPF — nothing authorises outbound @dtbtech.org |
| `TXT _dmarc.dtbtech.org` | **absent** | No DMARC policy |
| DKIM | n/a — no mail provider selected | Provider-dependent (e.g. `google._domainkey`) |
| NS | Cloudflare (`kianchau.ns.cloudflare.com`) | DNS is manageable in Cloudflare; Email Routing is an option |

**Conclusion at audit time:** no working `@dtbtech.org` mailbox or authenticated sending service was confirmed, and no domain MX records were found. Do not publish a branded address until real inbound, outbound, and reply tests pass. DNS may change after this audit; verify live records again immediately before provider setup.

## 3. Mailbox options — receive AND send (owner decision)

| Option | Inbound | Outbound as @dtbtech.org | Notes |
|---|---|---|---|
| Google Workspace | ✅ with setup | ✅ with setup | Paid subscription; verify current Australian pricing and billing terms before choosing |
| Microsoft 365 / Zoho | ✅ with setup | ✅ with setup | Verify current plans, regional eligibility and outbound/inbox limitations before selecting a tier |
| **Cloudflare Email Routing alone** | ✅ forward to Gmail | ❌ **no outbound SMTP** | Forwarding ≠ mailbox. Gmail "Send mail as" still needs an SMTP server — forwarding alone cannot send branded mail. Suitable only as a temporary inbound alias while a real mailbox is provisioned. |

## 4. Setup & acceptance checklist (owner-driven; no secrets here)

1. Choose mailbox + address (e.g. `hello@dtbtech.org` or keep role-neutral) and provider.
2. Add **exact provider-supplied** MX and SPF records at Cloudflare DNS. Do not install a literal placeholder `include:<provider>` value, and avoid conflicting multiple SPF policies.
3. Add the provider-issued DKIM records. For DMARC, start with a reviewed monitoring policy (typically `p=none`) and a real reporting address where appropriate; move to `quarantine`/`reject` only after authentication and alignment are verified.
4. Inbound test: external sender → mailbox receives within minutes.
5. Outbound test: send as branded address → lands with SPF+DKIM+DMARC all pass.
6. Reply test: reply arrives in branded mailbox, correct From header.
7. Only then: update the site's 5 `dtbbuildsoffice@gmail.com` placements + mailto/OG/JSON-LD in one reviewed PR — **never before tests 4–6 pass**.
8. Rollback plan: keep the existing Gmail channel usable during migration; document DNS TTLs and recheck mail flow after any switch or rollback. DNS changes may affect delivery; do **not** promise zero data loss.

## 5. Claim-matrix carryovers still OWNER CONFIRMATION REQUIRED

- `Greystanes` locality (about JSON-LD + contact page) — kept; needs owner confirm.
- FB/IG handles (301 login-wall; not evidence of death) — kept; confirm live profiles.
- Reply-SLA wording — PR #19 already softened the meta description and replaced visible WhatsApp/email response-time labels. No "usually same business day" promise remains on the current `contact.html`; future explicit SLAs still need owner approval.

## 6. PASS/FAIL/NOT TESTED

| Item | Result |
|---|---|
| WA/email/phone link validity | PASS |
| Honest no-persistence claims on **current manual project brief** | PASS |
| @dtbtech.org reachable | FAIL (expected — no MX; not published anywhere) |
| Mailbox outbound capability | NOT TESTED (none exists) |
| Inbound/outbound e2e | NOT TESTED (awaiting owner-provisioned mailbox) |

## GO/NO-GO
**GO** to publish this audit doc (draft PR). **NO-GO** on publishing any @dtbtech.org address until §4 tests 4–6 pass. Draft PR only — nothing merged/deployed.
