-- DTB-LEADS-INBOX-013: close legacy anonymous execution of staff helpers.
-- Data access continues to require authenticated active staff via RLS.
begin;
revoke execute on function public.is_active_staff() from public, anon;
revoke execute on function public.is_owner() from public, anon;
grant execute on function public.is_active_staff() to authenticated, service_role;
grant execute on function public.is_owner() to authenticated, service_role;
commit;
