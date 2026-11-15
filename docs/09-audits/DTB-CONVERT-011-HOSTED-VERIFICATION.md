# DTB-CONVERT-011 — Hosted Supabase Verification (10 Nov 2026 AEDT)

## Project and environment
- Connected Supabase account: **Dtb2**, organisation **DTB2**
- Project **dtb-crm-test** `lpvngjkaavvtierwejvi`, `ap-southeast-1`, status **ACTIVE_HEALTHY**
- No new Supabase project was created. **No JAT or KEUS project touched**.
- Existing migrations 001–006 and prepared `public.enquiry_intake` discovered, initially zero rows.
- Applied **prospective CRM-compatible migration** from `supabase/migrations/20261110000007_enquiry_intake_activation.sql`, using Supabase's `apply_migration` (returned `success:true`).
- Supabase registered its own migration history version **`20261109222557`** named `dtb_enquiry_intake_activation`. The repository filename is `20261110000007_enquiry_intake_activation.sql`. **Reconcile migration-history numbering before running CLI db push or merging the older PR #8 migration 007**, otherwise it could attempt to create duplicate trigger/constraints. Do not reapply either migration blindly.

## Hosted DB verification (actual connected project)

| Gate | Result |
| --- | --- |
| Project health | PASS: ACTIVE_HEALTHY |
| Prepared `enquiry_intake` reused; no duplicate `dtb_enquiries` table | PASS |
| New `lead_reference`, `idempotency_key`, `preferred_contact` columns | PASS |
| DB generates `DTB-YYYYMMDD-NNNN` reference | PASS |
| Unique `idempotency_key` index installed | PASS |
| RLS enabled and forced | PASS |
| Public RLS policies absent (intended deny) | PASS, 0 policies |
| Anon SELECT and INSERT grants | DENIED, PASS |
| Authenticated SELECT and INSERT grants | DENIED, PASS |
| `service_role` SELECT + INSERT grants | PASS |
| Actual synthetic write using `SET LOCAL ROLE service_role` | PASS |
| Synthetic duplicate key rejected by unique index | PASS |
| Synthetic transaction `ROLLBACK`, row count after test | PASS, 0 rows |
| Existing CRM `leads` rows | 0 |
| Real server-to-Supabase REST insert with secret key | NOT RUN |
| Cloudflare Turnstile site verification / browser / production canary | NOT RUN |

The synthetic test produced an internal `DTB-20261109-0001` reference using **UTC date**, correct for the SQL. It is not evidence of a customer enquiry and was never retained.

## Security advisors
Supabase Security Advisor still reports:
- INFO `rls_enabled_no_policy` for `enquiry_intake`, intentional fail-closed at this stage. https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- WARN `function_search_path_mutable` on `set_updated_at`. https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
- WARN public `SECURITY DEFINER` executable helpers `is_active_staff()`, `is_owner()`. https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- WARN authenticated `SECURITY DEFINER` executable helpers, including `change_lead_status()`. https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

These advisories require a separate careful permission review for CRM workflows; no unrelated staff/RPC changes were made in this migration.

## Activation still blocked
1. Provision a **server-only** DTB2 project `sb_secret_...` key in Vercel; never copy key into source, chat or browser, and restrict to authorized server runtime.
2. Create a real Cloudflare Turnstile site key and secret for the intended hostnames; verify token/action/hostname checks in Preview.
3. Confirm privacy collection notice/retention, staff lead review channel (Supabase Dashboard initially), operational monitoring/notification plan, and reliable failure/retry behavior.
4. Run actual Preview-to-hosted PostgREST POST, retry, and anon-denial tests. Confirm the right project URL and no customer data leaked into logs.
5. Manual mobile-browser validation, one consented owner-controlled canary, then separate explicit production release/activation authorization.
6. Reconcile older PR #8's migration 007 with the existing hosted version; never run both without migration reconciliation.

**Engineering state:** hosted **database storage schema and permission tests PASS**; **end-to-end website capture NO-GO** until server keys, anti-bot, browser, and release gates are verified. PR #33 remains draft and `DTB_INTAKE_ENABLED` has not been activated.
