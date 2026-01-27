-- Fast lookup
create index if not exists idx_otps_expires_at
on public.user_otps(expires_at);

-- Cleanup function
create or replace function cleanup_expired_otps()
returns void
security definer
as $$
begin
  delete from public.user_otps
  where expires_at < now();
end;
$$ language plpgsql;
