-- Baseline: exact reproduction of the Lovable Cloud schema (drizzle/migrations/0000 + 0001).
-- Source of truth for the new self-owned Supabase project. Do not edit; add new migrations instead.

create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users can read their own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.audit_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  locale text not null default 'en' check (locale in ('en','vi')),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 255),
  company text not null check (char_length(company) between 1 and 160),
  role text not null check (char_length(role) <= 80),
  listen_to text not null check (char_length(listen_to) <= 40),
  link text not null check (char_length(link) <= 500),
  team_size text not null check (char_length(team_size) <= 20),
  launch text check (launch is null or launch ~ '^\d{4}-\d{2}$'),
  budget text not null check (char_length(budget) <= 40),
  pain text check (pain is null or char_length(pain) <= 2000),
  heard_from text check (heard_from is null or char_length(heard_from) <= 60),
  app_status text check (app_status is null or char_length(app_status) <= 40),
  qualified boolean not null default false,
  utm_source text check (utm_source is null or char_length(utm_source) <= 200),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 200),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 200),
  utm_content text check (utm_content is null or char_length(utm_content) <= 200),
  referrer text check (referrer is null or char_length(referrer) <= 500),
  landing_page text check (landing_page is null or char_length(landing_page) <= 500)
);
grant insert on public.audit_requests to anon, authenticated;
grant select on public.audit_requests to authenticated;
grant all on public.audit_requests to service_role;
alter table public.audit_requests enable row level security;
create policy "Anyone can submit an audit request" on public.audit_requests
  for insert to anon, authenticated with check (true);
create policy "Admins can read audit requests" on public.audit_requests
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.pack_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  locale text not null default 'en' check (locale in ('en','vi')),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 255),
  making text not null check (char_length(making) <= 40),
  utm_source text check (utm_source is null or char_length(utm_source) <= 200),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 200),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 200),
  utm_content text check (utm_content is null or char_length(utm_content) <= 200),
  referrer text check (referrer is null or char_length(referrer) <= 500),
  landing_page text check (landing_page is null or char_length(landing_page) <= 500)
);
grant insert on public.pack_signups to anon, authenticated;
grant select on public.pack_signups to authenticated;
grant all on public.pack_signups to service_role;
alter table public.pack_signups enable row level security;
create policy "Anyone can sign up for the pack" on public.pack_signups
  for insert to anon, authenticated with check (true);
create policy "Admins can read pack signups" on public.pack_signups
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.contact_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 locale text NOT NULL CHECK (locale IN ('en', 'vi')),
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
 email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
 company text NOT NULL DEFAULT '' CHECK (char_length(company) <= 160),
 message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000)
);
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can submit contact messages" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read contact messages" ON public.contact_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
