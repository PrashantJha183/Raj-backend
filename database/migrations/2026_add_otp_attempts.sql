alter table public.user_otps
add column if not exists attempts int default 0;