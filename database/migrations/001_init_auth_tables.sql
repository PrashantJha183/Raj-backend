-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "pgcrypto";

-- =========================
-- USERS TABLE
-- =========================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  email text unique,
  phone text unique,

  is_verified boolean default false,
  is_active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- At least one identifier must exist
  constraint email_or_phone_required
    check (email is not null or phone is not null)
);

-- =========================
-- USER OTPs TABLE
-- =========================
create table if not exists public.user_otps (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  otp_hash text not null,
  expires_at timestamptz not null,
  verified boolean default false,
  attempts int default 0,

  created_at timestamptz default now()
);

-- =========================
-- REFRESH TOKENS TABLE
-- =========================
create table if not exists public.refresh_tokens (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  token text not null,
  expires_at timestamptz not null,
  revoked boolean default false,

  created_at timestamptz default now()
);

-- =========================
-- INDEXES (PERFORMANCE)
-- =========================

-- User lookup
create index if not exists idx_users_email
  on public.users(email);

create index if not exists idx_users_phone
  on public.users(phone);

-- OTP lookup (active & fast verification)
create index if not exists idx_user_otps_active
  on public.user_otps(user_id, verified, expires_at);

-- Refresh token lookup
create index if not exists idx_refresh_tokens_user
  on public.refresh_tokens(user_id);

create index if not exists idx_refresh_tokens_token
  on public.refresh_tokens(token);

-- =========================
-- UPDATED_AT TRIGGER
-- =========================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated on public.users;

create trigger trg_users_updated
before update on public.users
for each row
execute procedure update_updated_at();
