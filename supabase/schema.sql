-- KRYOZEN STUDIO / SUPABASE
-- Run this in the Supabase SQL editor after creating your project.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  thumbnail text not null default '',
  video text not null default '',
  description text not null default '',
  software jsonb not null default '[]'::jsonb,
  date date not null default current_date,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;

-- Public visitors can read only published projects.
drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects"
on public.projects for select
to anon, authenticated
using (published = true);

-- Only explicitly allowlisted admins can read/write project rows.
drop policy if exists "admins read all projects" on public.projects;
create policy "admins read all projects"
on public.projects for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid() and a.active = true));

drop policy if exists "admins insert projects" on public.projects;
create policy "admins insert projects"
on public.projects for insert
to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid() and a.active = true));

drop policy if exists "admins update projects" on public.projects;
create policy "admins update projects"
on public.projects for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid() and a.active = true))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid() and a.active = true));

drop policy if exists "admins delete projects" on public.projects;
create policy "admins delete projects"
on public.projects for delete
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid() and a.active = true));

-- Admins may check only their own allowlist record.
drop policy if exists "admins read own access row" on public.admin_users;
create policy "admins read own access row"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

-- STORAGE:
-- Create a bucket named "portfolio" in Supabase Storage and make it public
-- for portfolio delivery. Do NOT expose service-role credentials in the site.
-- If you later make the bucket private, replace public URLs with signed URLs
-- and add matching authenticated-admin storage policies.
