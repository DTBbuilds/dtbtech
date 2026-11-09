-- REVIEW ONLY. DO NOT APPLY TO JAT OR KEUS DATABASES.
-- This standalone intake migration must run only on an owner-confirmed DTB database.
-- No CRM dependency. Private by default; no anon or authenticated API access.
begin;
do $$ begin
  if to_regclass('public.dtb_enquiries') is not null then
    raise exception 'public.dtb_enquiries already exists — inspect before migration';
  end if;
end $$;
create table public.dtb_enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('DTB-' || to_char(now() at time zone 'UTC','YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  idempotency_key uuid not null unique,
  contact_name varchar(120) not null,
  business_name varchar(80),
  email varchar(254),
  phone varchar(40),
  service_required varchar(80) not null,
  country varchar(40) not null,
  project_description text not null,
  budget varchar(60),
  timeframe varchar(60),
  preferred_contact varchar(20) not null,
  source_page varchar(100) not null,
  consent_given boolean not null check (consent_given),
  consent_text varchar(300) not null,
  status text not null default 'unprocessed' check(status in ('unprocessed','reviewing','quoted','closed')),
  created_at timestamptz not null default now(),
  constraint dtb_enquiries_contact check (email is not null or phone is not null)
);
create index dtb_enquiries_created_idx on public.dtb_enquiries(created_at desc);
create index dtb_enquiries_status_idx on public.dtb_enquiries(status);
alter table public.dtb_enquiries enable row level security;
revoke all on table public.dtb_enquiries from public, anon, authenticated;
grant select,insert,update on table public.dtb_enquiries to service_role;
-- No client-facing policy is created: even with Data API enabled, anon and
-- authenticated users cannot read/insert/update/delete anyone's enquiries.
commit;
