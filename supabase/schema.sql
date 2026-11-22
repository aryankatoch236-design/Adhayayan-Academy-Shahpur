create extension if not exists pgcrypto;

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create or replace function public.is_site_admin() returns boolean
language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.site_admins where user_id=auth.uid()) $$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

create table if not exists public.site_settings (
 id integer primary key check(id=1), value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
create table if not exists public.courses (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, category text not null default '', short_description text not null default '', full_description text not null default '', duration text not null default '', fee text, batch_timings text not null default '', image_url text, image_alt text, display_order integer not null default 0, published boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.videos (
 id uuid primary key default gen_random_uuid(), title text not null, youtube_url text not null, display_order integer not null default 0, published boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.gallery (
 id uuid primary key default gen_random_uuid(), image_url text not null, caption text not null default '', image_alt text not null default '', category text not null default '', display_order integer not null default 0, published boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.faculty (
 id uuid primary key default gen_random_uuid(), name text not null, role text not null default '', bio text not null default '', image_url text, image_alt text not null default '', display_order integer not null default 0, published boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.toppers (
 id uuid primary key default gen_random_uuid(), name text not null, result text not null default '', caption text not null default '', image_url text, image_alt text not null default '', display_order integer not null default 0, published boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.reviews (
 id uuid primary key default gen_random_uuid(), name text not null, review text not null default '', course text not null default '', display_order integer not null default 0, published boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.faqs (
 id uuid primary key default gen_random_uuid(), question text not null, answer text not null default '', display_order integer not null default 0, published boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.enquiries (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 2 and 100), phone text not null check(length(phone) between 7 and 20), course text check(length(course)<=150), message text check(length(message)<=1500), status text not null default 'new' check(status in ('new','contacted','admitted')), notes text not null default '', created_at timestamptz not null default now()
);

alter table public.site_admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.courses enable row level security;
alter table public.videos enable row level security;
alter table public.gallery enable row level security;
alter table public.faculty enable row level security;
alter table public.toppers enable row level security;
alter table public.reviews enable row level security;
alter table public.faqs enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "admin list self" on public.site_admins;
drop policy if exists "public settings read" on public.site_settings;
drop policy if exists "admin settings manage" on public.site_settings;
alter table public.enquiries add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists enquiries_user_idx on public.enquiries(user_id);
drop policy if exists "own enquiries read" on public.enquiries;
drop policy if exists "public enquiry submit" on public.enquiries;
drop policy if exists "admin enquiries read" on public.enquiries;
drop policy if exists "admin enquiries update" on public.enquiries;
drop policy if exists "admin enquiries delete" on public.enquiries;
drop policy if exists "public media read" on storage.objects;
drop policy if exists "admin media upload" on storage.objects;
drop policy if exists "admin media update" on storage.objects;
drop policy if exists "admin media delete" on storage.objects;
do $$ declare t text; begin foreach t in array array['courses','videos','gallery','faculty','toppers','reviews','faqs'] loop execute format('drop policy if exists "public published read" on public.%I',t); execute format('drop policy if exists "admin content manage" on public.%I',t); end loop; end $$;

create policy "admin list self" on public.site_admins for select to authenticated using(user_id=auth.uid());
create policy "public settings read" on public.site_settings for select to anon,authenticated using(true);
create policy "admin settings manage" on public.site_settings for all to authenticated using(public.is_site_admin()) with check(public.is_site_admin());

do $$ declare t text; begin foreach t in array array['courses','videos','gallery','faculty','toppers','reviews','faqs'] loop
 execute format('create policy "public published read" on public.%I for select to anon,authenticated using(published=true)',t);
 execute format('create policy "admin content manage" on public.%I for all to authenticated using(public.is_site_admin()) with check(public.is_site_admin())',t);
end loop; end $$;
create policy "public enquiry submit" on public.enquiries for insert to anon,authenticated with check(status='new' and notes='' and (user_id is null or user_id=auth.uid()));
create policy "own enquiries read" on public.enquiries for select to authenticated using(user_id=auth.uid());
create policy "admin enquiries read" on public.enquiries for select to authenticated using(public.is_site_admin());
create policy "admin enquiries update" on public.enquiries for update to authenticated using(public.is_site_admin()) with check(public.is_site_admin());
create policy "admin enquiries delete" on public.enquiries for delete to authenticated using(public.is_site_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('academy-media','academy-media',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create policy "public media read" on storage.objects for select to anon,authenticated using(bucket_id='academy-media');
create policy "admin media upload" on storage.objects for insert to authenticated with check(bucket_id='academy-media' and public.is_site_admin());
create policy "admin media update" on storage.objects for update to authenticated using(bucket_id='academy-media' and public.is_site_admin()) with check(bucket_id='academy-media' and public.is_site_admin());
create policy "admin media delete" on storage.objects for delete to authenticated using(bucket_id='academy-media' and public.is_site_admin());

grant select on public.site_admins to authenticated;
grant select on public.site_settings to anon,authenticated;
grant insert,update,delete on public.site_settings to authenticated;
grant select on public.courses,public.videos,public.gallery,public.faculty,public.toppers,public.reviews,public.faqs to anon,authenticated;
grant insert,update,delete on public.courses,public.videos,public.gallery,public.faculty,public.toppers,public.reviews,public.faqs to authenticated;
grant insert on public.enquiries to anon,authenticated;
grant select,update,delete on public.enquiries to authenticated;

insert into public.site_settings(id,value) values(1,'{"academy_name":"Adhyayan Academy","tagline":"ज्ञान से सफलता तक · Your Success, Our Mission","hero_title":"Delhi and Chandigarh level coaching, now in Shahpur","hero_description":"Focused preparation, clear guidance and supportive teaching for students and aspirants across Himachal Pradesh.","phone_main":"8971806043","phones":["8971806043","6230171716","7973835671"],"whatsapp":"6230171716","email":"official.adhyayan.shahpur@gmail.com","address":"3rd Floor, above PNB Bank building, Akshay Urja Sadan, NH154, Shahpur, Kangra, Himachal Pradesh 176206","hours":"Open until 6:00 PM","map_url":"","youtube_url":"","social_links":{},"why_title":"A clear path to your next milestone","why_items":[{"title":"Experienced faculty","body":"Learn with focused guidance and structured support."},{"title":"Smart strategy","body":"Build strong fundamentals with purposeful preparation."},{"title":"Learning for every stage","body":"Courses for competitive exams and school students from Class 6 to 12."}],"logo_url":"","hero_image_url":"","search_console_verification":"","ga_id":""}'::jsonb) on conflict(id) do nothing;
insert into public.courses(title,slug,category,short_description,full_description,display_order,published) values
('HPPSC, Police & Patwari','hppsc-police-patwari','State exams','Preparation for Patwari, Panchayat Inspector and Himachal state competitive exams.','Preparation for Patwari, Panchayat Inspector and state competitive examinations available in Himachal Pradesh.',1,true),
('Administrative Courses','administrative-courses','State exams','Allied, Naib Tehsildar, Sub Inspector and JOA-IT preparation.','Focused preparation for Allied Services, Naib Tehsildar, Sub Inspector and JOA-IT examinations.',2,true),
('Academic Exams','academic-exams','Teaching exams','TGT Commission, HP-TET, CTET and EMRS preparation.','Preparation and guided study for TGT Commission, HP-TET, CTET and EMRS examinations.',3,true),
('Agniveer, SSC-GD & Clerk','agniveer-ssc-gd-clerk','Defence & central','Build your preparation for Agniveer, SSC-GD and clerk exams.','Structured preparation for Agniveer, SSC-GD and clerk examinations.',4,true),
('NEET, JEE, NDA & CDSE','neet-jee-nda-cdse','Entrance exams','Special preparation for medical, engineering and defence entrances.','Special courses for NEET, JEE, NDA and CDSE aspirants.',5,true),
('RIMC, RIMS, Sainik & JNVST','rimc-rims-sainik-jnvst','School entrance','Guidance for RIMC, RIMS, Sainik School and Navodaya entrance exams.','Preparation for RIMC, RIMS, Sainik School and JNVST (Navodaya) admissions.',6,true),
('Tuition · Class 6 to 12','tuition-class-6-to-12','School tuition','CBSE tuition across Medical, Non-Medical and Commerce streams.','School tuition for Classes 6 to 12 under the CBSE curriculum, with Medical, Non-Medical and Commerce streams.',7,true)
on conflict(slug) do nothing;
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
insert into public.admin_emails(email,notify,added_by) values ('aryankatoch236@gmail.com',false,'setup'),('ssarthak558@gmail.com',false,'setup') on conflict (email) do update set notify=false;
