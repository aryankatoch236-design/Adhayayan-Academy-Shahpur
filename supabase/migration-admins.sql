-- Run once in Supabase SQL Editor. Safe to re-run.
create table if not exists public.admin_emails (
  email text primary key check (email = lower(email)),
  notify boolean not null default true,
  added_by text,
  created_at timestamptz not null default now()
);
alter table public.admin_emails enable row level security;

create or replace function public.is_site_admin() returns boolean
language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.site_admins where user_id=auth.uid())
   or exists(select 1 from public.admin_emails where email=lower(coalesce(auth.jwt()->>'email',''))) $$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

drop policy if exists "admin emails manage" on public.admin_emails;
create policy "admin emails manage" on public.admin_emails for all to authenticated
  using (public.is_site_admin()) with check (public.is_site_admin());
grant select, insert, update, delete on public.admin_emails to authenticated;

-- IMPORTANT: add the first admin (replace with your Gmail):
insert into public.admin_emails(email,notify,added_by) values ('aryankatoch236@gmail.com',true,'setup'),('ssarthak558@gmail.com',true,'setup') on conflict (email) do update set notify=true;
