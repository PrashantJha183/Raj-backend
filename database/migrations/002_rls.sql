-- =========================
-- ENABLE RLS
-- =========================
alter table public.users enable row level security;

alter table public.user_otps enable row level security;

alter table public.refresh_tokens enable row level security;

-- =========================
-- USERS TABLE POLICIES
-- =========================
-- Block all client access by default
create policy "users_deny_all_clients" on public.users for all to anon,
authenticated using (false);

-- =========================
-- USER_OTPS TABLE POLICIES
-- =========================
-- Block all client access by default
create policy "otps_deny_all_clients" on public.user_otps for all to anon,
authenticated using (false);

create policy "refresh_tokens_deny_all_clients" on public.refresh_tokens for all to anon,
authenticated using (false);