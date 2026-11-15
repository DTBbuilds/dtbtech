-- DTB-CONVERT-011: reuse DTB2's prepared enquiry_intake table, not a duplicate.
-- Adapted from prepared PR #8 007. This prospective file supersedes the
-- original PR #8 activation migration; do not run both without reconciliation.
-- DTB Technologies — Lead Management System
-- Migration 007: public enquiry intake activation support (DTB-CONVERT-001B)
--
-- Prepares enquiry_intake for the /api/enquiry server-side endpoint.
-- The table stays closed to anon and authenticated writes: ONLY the service
-- role (used inside the Vercel function, never shipped to the browser) can
-- insert. Staff get read + triage-update access through RLS.
--
-- Adds: lead reference generation, idempotency key for safe retries,
-- preferred-contact channel, optional acknowledgement-email consent, UTM
-- attribution (captured only with consent).

-- 1. New columns --------------------------------------------------------

alter table public.enquiry_intake
    add column if not exists lead_reference   text,
    add column if not exists idempotency_key  text,
    add column if not exists preferred_contact text,
    add column if not exists email_consent    boolean not null default false,
    add column if not exists utm              jsonb;

alter table public.enquiry_intake
    alter column email drop not null;

comment on column public.enquiry_intake.lead_reference is
    'Human-readable unique reference shown to the visitor, e.g. DTB-20261102-0042.';
comment on column public.enquiry_intake.idempotency_key is
    'Client-generated key; duplicate submissions return the original reference.';
comment on column public.enquiry_intake.email_consent is
    'Explicit opt-in to receive an acknowledgement email (Spam Act 2003).';
comment on column public.enquiry_intake.utm is
    'UTM/source attribution captured only when consent_given is true.';

-- 2. Lead reference ------------------------------------------------------

create sequence if not exists public.enquiry_reference_seq;

create or replace function public.set_enquiry_reference()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.lead_reference is null then
        new.lead_reference := 'DTB-'
            || to_char(now() at time zone 'UTC', 'YYYYMMDD')
            || '-'
            || lpad(nextval('public.enquiry_reference_seq')::text, 4, '0');
    end if;
    return new;
end;
$$;

create trigger enquiry_intake_set_reference
    before insert on public.enquiry_intake
    for each row execute function public.set_enquiry_reference();

create unique index if not exists enquiry_intake_reference_uq
    on public.enquiry_intake (lead_reference)
    where lead_reference is not null;

create unique index if not exists enquiry_intake_idempotency_uq
    on public.enquiry_intake (idempotency_key)
    where idempotency_key is not null;

-- 3. Strict public access: owner currently manages intake via Supabase Dashboard.
-- Do not introduce authenticated staff read/update policies until the CRM
-- hosted auth/RLS matrix is separately tested. Keep forced RLS in place.
revoke all on public.enquiry_intake from public, anon, authenticated;
grant select, insert on public.enquiry_intake to service_role;
grant usage, select on sequence public.enquiry_reference_seq to service_role;

-- Validate server-only collection input at the database boundary as well.
alter table public.enquiry_intake
    add constraint enquiry_intake_has_contact
    check (email is not null or nullif(btrim(phone), '') is not null);
alter table public.enquiry_intake
    add constraint enquiry_intake_consent_required
    check (consent_given = true);

-- Trigger functions are not a public API; prevent direct execution.
revoke execute on function public.set_enquiry_reference() from public, anon, authenticated;
