-- DTB-CONVERT-001B — enquiry_intake structural checks
-- Run AFTER all migrations (supabase/test/run-local-tests.sh or hosted verify).
-- Asserts: table still closed to anon/auth writes, staff triage grants,
-- reference trigger and idempotency index exist.

create temp table if not exists intake_log (name text, pass boolean, detail text);

insert into intake_log values
('anon has no INSERT on enquiry_intake',
 not has_table_privilege('anon', 'public.enquiry_intake', 'INSERT'), ''),
('anon has no SELECT on enquiry_intake',
 not has_table_privilege('anon', 'public.enquiry_intake', 'SELECT'), ''),
('authenticated has no INSERT on enquiry_intake',
 not has_table_privilege('authenticated', 'public.enquiry_intake', 'INSERT'), ''),
('authenticated has no DELETE on enquiry_intake',
 not has_table_privilege('authenticated', 'public.enquiry_intake', 'DELETE'), ''),
('authenticated can SELECT enquiry_intake',
 has_table_privilege('authenticated', 'public.enquiry_intake', 'SELECT'), ''),
('authenticated can UPDATE status column only',
 has_column_privilege('authenticated', 'public.enquiry_intake', 'status', 'UPDATE')
 and has_column_privilege('authenticated', 'public.enquiry_intake', 'processed_at', 'UPDATE')
 and not has_column_privilege('authenticated', 'public.enquiry_intake', 'email', 'UPDATE'), ''),
('new columns exist',
 exists(select 1 from information_schema.columns where table_name='enquiry_intake' and column_name='lead_reference')
 and exists(select 1 from information_schema.columns where table_name='enquiry_intake' and column_name='idempotency_key')
 and exists(select 1 from information_schema.columns where table_name='enquiry_intake' and column_name='preferred_contact')
 and exists(select 1 from information_schema.columns where table_name='enquiry_intake' and column_name='email_consent')
 and exists(select 1 from information_schema.columns where table_name='enquiry_intake' and column_name='utm'), ''),
('idempotency unique index exists',
 exists(select 1 from pg_indexes where tablename='enquiry_intake' and indexname='enquiry_intake_idempotency_uq'), ''),
('reference unique index exists',
 exists(select 1 from pg_indexes where tablename='enquiry_intake' and indexname='enquiry_intake_reference_uq'), ''),
('staff triage policies exist',
 exists(select 1 from pg_policies where tablename='enquiry_intake' and policyname='enquiry_intake_staff_read')
 and exists(select 1 from pg_policies where tablename='enquiry_intake' and policyname='enquiry_intake_staff_triage'), ''),
('RLS still forced',
 (select relforcerowsecurity from pg_class where relname='enquiry_intake'), '');

-- Reference trigger format check (as superuser; rolled back)
begin;
insert into public.enquiry_intake
    (contact_name, email, service_required, project_description, consent_given)
values ('T', 't@e.com', 'Business website', 'synthetic check row 1234', true)
returning lead_reference \gset
insert into intake_log values
    ('lead_reference format DTB-YYYYMMDD-NNNN',
     :'lead_reference' ~ '^DTB-[0-9]{8}-[0-9]{4}$', :'lead_reference');
rollback;

select name, pass, detail from intake_log order by name;
select count(*) filter (where not pass) as failed from intake_log;
