-- ════════════════════════════════════════════════════════════
-- مخطط قاعدة بيانات نبتة (Supabase / Postgres)
-- نفّذه في: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════

-- جدول الملفات الشخصية (مرتبط بمستخدمي المصادقة)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  stripe_customer_id text unique,
  subscription_status text default 'inactive',  -- inactive | active | trialing | canceled
  plan text,
  updated_at timestamptz default now()
);

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
