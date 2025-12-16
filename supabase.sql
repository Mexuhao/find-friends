-- Enable uuid generation if not already
create extension if not exists "pgcrypto";

-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  age int not null check (age >= 18 and age <= 50),
  gender text not null check (gender in ('male', 'female')),
  wechat text not null,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_users_gender on public.users (gender);

-- Match logs (rate limit + auditing)
create table if not exists public.match_logs (
  id bigserial primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  matched_user_id uuid not null references public.users (id) on delete cascade,
  ip_hash text,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_match_logs_user_created_at on public.match_logs (user_id, created_at desc);

-- Suggested RLS (optional, for future multi-role setup). Kept disabled for service role usage only.
-- alter table public.users enable row level security;
-- alter table public.match_logs enable row level security;

