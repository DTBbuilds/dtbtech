# DTB-CONVERT-011 — verified DTB2 project activation plan

The initially planned standalone table **`public.dtb_enquiries` has been abandoned**.
The approved project already has `public.enquiry_intake`, created by CRM migration 005.
The API and client now use `enquiry_intake`, `lead_reference` with numeric sequence,
and `idempotency_key` as a UUID-formatted text value. The new prospective
migration is `supabase/migrations/20261110000007_enquiry_intake_activation.sql`.

**Never apply the abandoned `supabase/standalone-intake.sql` to any project.**
Do not run legacy PR #8's competing 007 migration without reconciliation.

Production activation still requires: verified DTB-only Supabase hosted schema, proper
server-only key, Turnstile challenge, rate limiting, privacy notices, manual lead
triage, end-to-end synthetic submissions, and owner-approved merge. The feature flag
`DTB_INTAKE_ENABLED` must remain unset until these gates pass.

Vercel server variables:
- `DTB_INTAKE_SUPABASE_URL`: `https://lpvngjkaavvtierwejvi.supabase.co` (approved DTB2 project).
- `DTB_INTAKE_SERVICE_KEY`: server-only Supabase `sb_secret_` key.
- `DTB_TURNSTILE_SITE_KEY`, `DTB_TURNSTILE_SECRET_KEY`: user-managed Cloudflare Turnstile keys.
- `DTB_TURNSTILE_HOSTNAMES`: exact Preview/prod allowlisted hostnames.
- `DTB_INTAKE_ENABLED=true` **only after** hosted E2E approval.

No secrets may enter GitHub, browser JavaScript, documentation, logs, or client bundles.
Avoid turning on a real public Submit control until the consent text and operational
workflow are approved. The manual WhatsApp/email options must remain usable.

Local PostgreSQL tests previously passed for the *abandoned* standalone table;
this is not verification of the adapted schema. Retest and record separate evidence.
