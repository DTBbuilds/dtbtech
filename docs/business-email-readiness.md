# DTB-BIZREADY-006 — Contact Channel Audit & Business Email Readiness (issue #20)

Date: 2026-11-03 · Branch `feat/dtb-bizready-006-email-readiness` · Base `main` @ `17398955`
READ-ONLY audit; no mailbox created, no credentials touched, nothing deployed.

## 1. Contact channel inventory (all verified live)

| Channel | Value | Placements | Behaviour | Status |
|---|---|---|---|---|
| WhatsApp AU | `wa.me/61450275013` | 17 links (incl. service-specific prefilled `?text=`) | Opens WA with optional prefilled brief — no server storage | ✅ working |
| WhatsApp KE | `wa.me/254729983567` | 2 links | Same | ✅ working |
| Phone AU | `tel:+61450275013` | 15 | Native dialler | ✅ working |
| Phone KE | `tel:+254729983567` | 2 | Native dialler | ✅ working |
| Email | `mailto:dtbbuildsoffice@gmail.com` (×5 text placements) | footer, contact page, brief "Open Email Draft" | mailto draft in user's client — no server storage | ✅ working |
| Brief form | `js/project-brief.js` | contact | Prepares WA/email/copy — **correctly claims no persistence** | ✅ honest |
| Secure send | `Send Enquiry Securely` button | contact | `/api/enquiry` → 503 `not_configured` + honest error + fallbacks (PR #8 dormant) | ✅ honest |

No link/UX defects found — every path resolves and behaves as labelled. **No frontend fix PR required.**

## 2. DNS / email capability audit (read-only `nslookup`)

| Record | Value | Implication |
|---|---|---|
| `MX dtbtech.org` | **none** | Domain cannot receive email at all today |
| `TXT dtbtech.org` (SPF) | only `google-site-verification=…` | No SPF — nothing authorises outbound @dtbtech.org |
| `TXT _dmarc.dtbtech.org` | **absent** | No DMARC policy |
| DKIM | n/a — no mail provider selected | Provider-dependent (e.g. `google._domainkey`) |
| NS | Cloudflare (`kianchau.ns.cloudflare.com`) | DNS is manageable in Cloudflare; Email Routing is an option |

**Conclusion:** `hello@dtbtech.org` (or any @dtbtech.org address) **does not exist and cannot receive or send today**. Publishing it without a working mailbox would send prospects into a dead channel — do not publish until §3 tests pass.

## 3. Mailbox options — receive AND send (owner decision)

| Option | Inbound | Outbound as @dtbtech.org | Notes |
|---|---|---|---|
| Google Workspace | ✅ MX | ✅ branded SMTP/DKIM | ~A$8/user/mo; the reliable default; needs DNS records below |
| Microsoft 365 / Zoho | ✅ | ✅ | comparable; Zoho has a free-forever tier (IMAP-only) |
| **Cloudflare Email Routing alone** | ✅ forward to Gmail | ❌ **no outbound SMTP** | Forwarding ≠ mailbox. Gmail "Send mail as" still needs an SMTP server — forwarding alone cannot send branded mail. Suitable only as a temporary inbound alias while a real mailbox is provisioned. |

## 4. Setup & acceptance checklist (owner-driven; no secrets here)

1. Choose mailbox + address (e.g. `hello@dtbtech.org` or keep role-neutral) and provider.
2. Add provider MX records at Cloudflare DNS; add `TXT v=spf1 include:<provider> ~all`.
3. Add provider DKIM records; publish `TXT _dmarc` (`v=DMARC1; p=quarantine; rua=mailto:<addr>`).
4. Inbound test: external sender → mailbox receives within minutes.
5. Outbound test: send as branded address → lands with SPF+DKIM+DMARC all pass.
6. Reply test: reply arrives in branded mailbox, correct From header.
7. Only then: update the site's 5 `dtbbuildsoffice@gmail.com` placements + mailto/OG/JSON-LD in one reviewed PR — **never before tests 4–6 pass**.
8. Rollback: keep gmail alias active during migration; revert is a DNS/PR revert, no data loss.

## 5. Claim-matrix carryovers still OWNER CONFIRMATION REQUIRED

- `Greystanes` locality (about JSON-LD + contact page) — kept; needs owner confirm.
- FB/IG handles (301 login-wall; not evidence of death) — kept; confirm live profiles.
- Reply-SLA wording — meta description softened (PR #19); on-page card still says "usually same business day" — owner decision.

## 6. PASS/FAIL/NOT TESTED

| Item | Result |
|---|---|
| WA/email/phone link validity | PASS |
| Honest no-persistence claims | PASS |
| @dtbtech.org reachable | FAIL (expected — no MX; not published anywhere) |
| Mailbox outbound capability | NOT TESTED (none exists) |
| Inbound/outbound e2e | NOT TESTED (awaiting owner-provisioned mailbox) |

## GO/NO-GO
**GO** to publish this audit doc (draft PR). **NO-GO** on publishing any @dtbtech.org address until §4 tests 4–6 pass. Draft PR only — nothing merged/deployed.
