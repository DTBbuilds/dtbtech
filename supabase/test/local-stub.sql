-- TEST-ONLY fixture: minimal Supabase-compatible stubs so the migrations and
-- RLS policies can be exercised against a plain local PostgreSQL instance.
-- NEVER run this file on a real Supabase project — it would overwrite nothing
-- (idempotent guards), but real Supabase already provides all of this.

create schema if not exists auth;

-- Roles Supabase provides.
do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then
        create role anon nologin;
    end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then
        create role authenticated nologin;
    end if;
    if not exists (select 1 from pg_roles where rolname = 'service_role') then
        create role service_role nologin bypassrls;
    end if;
end $$;

-- Minimal auth.users mirror (only the columns the schema references).
create table if not exists auth.users (
    id            uuid primary key,
    email         text unique,
    created_at    timestamptz not null default now()
);

-- JWT claim helpers backed by session settings, mirroring Supabase behaviour:
-- set_config('request.jwt.claim.sub', '<user-uuid>', true) before impersonating.
create or replace function auth.uid() returns uuid
language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function auth.role() returns text
language sql stable as $$
    select nullif(current_setting('request.jwt.claim.role', true), '')
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
grant execute on function auth.role() to anon, authenticated, service_role;

-- Supabase grants USAGE on the public schema to the JWT roles.
grant usage on schema public to anon, authenticated, service_role;
