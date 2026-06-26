-- ════════════════════════════════════════════════════════════
-- مخطط قاعدة بيانات نبتة (Supabase / Postgres)
-- نفّذه في: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════

-- جدول الملفات الشخصية (مرتبط بمستخدمي المصادقة)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  subscription_status text default 'inactive',  -- inactive | active | canceled
  subscription_expires timestamptz,             -- تاريخ انتهاء اشتراك Pro
  ai_uses int not null default 0,               -- عدّاد التحاليل المجانية المستهلكة
  plan text,
  updated_at timestamptz default now()
);

-- للترقية من نسخة سابقة:
alter table public.profiles add column if not exists subscription_expires timestamptz;
alter table public.profiles add column if not exists ai_uses int not null default 0;

-- تفعيل أمان الصفوف
alter table public.profiles enable row level security;

-- سياسات: كل مستخدم يرى/يعدّل ملفه فقط
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- إنشاء ملف شخصي تلقائياً عند تسجيل مستخدم جديد
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════
-- جدول المشاريع المحفوظة (كل مستخدم ومشاريعه)
-- ════════════════════════════════════════════════════════════
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'مشروع بدون اسم',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id, updated_at desc);

alter table public.projects enable row level security;

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);
