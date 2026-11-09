# DTB-CONVERT-011 — Database verification evidence (10 Nov 2026)

## Provenance and isolation
- PR #33 branch commit at verification: `5004894d7`.
- Migration source: `supabase/standalone-intake.sql`, deployed to a **disposable local PostgreSQL 18.6 instance only** in an isolated Vercel development sandbox.
- Environment: transient database `dtb_intake_qa`; synthetic contact `qa@example.test`.
- **No connected Supabase database migration, data write, key access, Vercel Production env modification or site deployment occurred.**
- Supabase connector currently lists only `jat-staging` (active) and `keus-prod` (inactive) under the single accessible organisation. Neither is an approved DTB lead store.
- Supabase's read-only **get_cost(project)** quoted **0 per month** for the sole accessible organisation **DTBbuilds's Org** as of this check. Project not created: owner organisation selection/confirmation still required by connector instructions.

## Independent PostgreSQL checks

| Check | Result |
| --- | --- |
| Apply exact `supabase/standalone-intake.sql` against clean PG18 database | PASS |
| `public.dtb_enquiries` created with required columns/indexes | PASS |
| RLS enabled | PASS (`relrowsecurity = true`) |
| No public policies | PASS (0 policies) |
| `anon` and `authenticated` lack SELECT/INSERT grants | PASS |
| `service_role` has SELECT/INSERT table privileges | PASS |
| Insert synthetic record with Supabase-style `service_role BYPASSRLS` | PASS |
| Created `DTB-YYYYMMDD-XXXXXXXXXXXX` reference | PASS |
| Duplicate `idempotency_key` rejected by unique constraint | PASS |
| Anonymous SELECT actually denied | PASS |

**Test-harness correction:** the first local insert failed because the synthetic `service_role` was missing `BYPASSRLS`. The actual Supabase service role has RLS bypass privileges. After matching that property in the isolated test role, the insert and all permission checks passed. This was **not** a change to any deployed role.

## Still NOT RUN / required for activation
- No dedicated DTB Supabase project exists and no hosted migration has been applied.
- No genuine REST POST/GET test using a dedicated DTB secret key; no hosted migration/Advisor check.
- No actual Cloudflare Turnstile credentials/siteverify test, nor any distributed rate limit beyond the in-memory and anti-bot checks.
- No Vercel live config or customer canary submission.
- No verified owner notification/inbox; a persisted lead alone would be invisible to the business without checking a private dashboard, so ensure an operational triage procedure.

## Next controlled gates
1. Owner selects Supabase organisation and authorises dedicated **`dtb-leads-prod`** project (quoted 0 monthly at read-only check; costs can change).
2. Create only in that organisation, inspect project health, apply reviewed migration.
3. Query table/schema/RLS/policies/grants and Supabase Advisor; test synthetic write/read via the approved project and confirm cleanup.
4. Configure a production Cloudflare Turnstile widget; protect secret server-side; configure only project-specific URL/key in Vercel and allowlisted hostnames.
5. Verify staff workflow to read, triage and respond to submissions (at minimum Supabase dashboard), privacy/retention disclosures, real browser and delivery tests.
6. Only after full gate PASS, release PR #33 and set activation flag. Preserve current WhatsApp/email fallback and keep CRM PRs #2/#8 deferred.

**GO** for local SQL structural and permission checks. **NO-GO** for live Submit Enquiry activation pending hosted verification and owner-approved infrastructure.
