-- Phase 2 · Lead capture hardening.
-- 1. Submissions are written only by the server (service role). The browser can no longer insert
--    directly through the Data API, so validation, spam checks and the `qualified` flag cannot be bypassed.
-- 2. Rate-limit counters, pack download log and server-side submission error log.
-- No data is dropped.

-- ── 1. Close direct public inserts ───────────────────────────────────
drop policy if exists "Anyone can submit an audit request" on public.audit_requests;
drop policy if exists "Anyone can sign up for the pack" on public.pack_signups;
drop policy if exists "Visitors can submit contact messages" on public.contact_submissions;

-- Grants observed live on Lovable Cloud were broader than the migration intent; make them explicit.
revoke all on public.audit_requests, public.pack_signups, public.contact_submissions, public.user_roles
  from anon, authenticated;
grant select on public.audit_requests, public.pack_signups, public.contact_submissions to authenticated;
grant select on public.user_roles to authenticated;
grant all on public.audit_requests, public.pack_signups, public.contact_submissions, public.user_roles
  to service_role;

-- ── 2. Rate limiting (fixed window, keyed by a hashed IP or e-mail) ──
create table public.rate_limits (
  bucket text not null,
  key_hash text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, key_hash, window_start)
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;
grant all on public.rate_limits to service_role;

-- Returns true when the call is allowed, false when the limit is exceeded. Old windows are pruned.
create or replace function public.rate_limit_hit(
  _bucket text, _key_hash text, _max integer, _window_seconds integer
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  _start timestamptz := to_timestamp(floor(extract(epoch from now()) / _window_seconds) * _window_seconds);
  _hits integer;
begin
  insert into public.rate_limits as r (bucket, key_hash, window_start, hits)
  values (_bucket, _key_hash, _start, 1)
  on conflict (bucket, key_hash, window_start) do update set hits = r.hits + 1
  returning hits into _hits;

  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return _hits <= _max;
end;
$$;
revoke all on function public.rate_limit_hit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, text, integer, integer) to service_role;

-- ── 3. Free pack download log ────────────────────────────────────────
create table public.pack_downloads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  signup_id uuid references public.pack_signups(id) on delete set null,
  object_key text not null check (char_length(object_key) <= 300),
  ip_hash text check (ip_hash is null or char_length(ip_hash) <= 128),
  user_agent text check (user_agent is null or char_length(user_agent) <= 300),
  country text check (country is null or char_length(country) <= 8)
);
create index pack_downloads_signup_idx on public.pack_downloads (signup_id);
alter table public.pack_downloads enable row level security;
revoke all on public.pack_downloads from anon, authenticated;
grant select on public.pack_downloads to authenticated;
grant all on public.pack_downloads to service_role;
create policy "Admins can read pack downloads" on public.pack_downloads
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ── 4. Server-side submission error log (no form contents, only context) ──
create table public.submission_errors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  form text not null check (char_length(form) <= 40),
  stage text not null check (char_length(stage) <= 40),
  message text not null check (char_length(message) <= 1000),
  locale text check (locale is null or char_length(locale) <= 5)
);
alter table public.submission_errors enable row level security;
revoke all on public.submission_errors from anon, authenticated;
grant select on public.submission_errors to authenticated;
grant all on public.submission_errors to service_role;
create policy "Admins can read submission errors" on public.submission_errors
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create index audit_requests_created_idx on public.audit_requests (created_at desc);
create index pack_signups_created_idx on public.pack_signups (created_at desc);
