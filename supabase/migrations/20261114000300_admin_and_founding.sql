-- Phase 3 · Admin area + Founding slots counter in the database.

-- ── Lead status pipeline ─────────────────────────────────────────────
alter table public.audit_requests
  add column status text not null default 'new'
    check (status in ('new', 'contacted', 'audit_sent', 'call_booked', 'won', 'lost')),
  add column status_updated_at timestamptz,
  add column notes text check (notes is null or char_length(notes) <= 4000);

alter table public.pack_signups
  add column status text not null default 'new'
    check (status in ('new', 'contacted', 'audit_sent', 'call_booked', 'won', 'lost')),
  add column status_updated_at timestamptz,
  add column notes text check (notes is null or char_length(notes) <= 4000);

-- Admins may change only status/notes (column grants), never the submitted data or `qualified`.
grant update (status, status_updated_at, notes) on public.audit_requests to authenticated;
grant update (status, status_updated_at, notes) on public.pack_signups to authenticated;
create policy "Admins can update audit request status" on public.audit_requests
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update pack signup status" on public.pack_signups
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ── Founding slots (single row, public read) ─────────────────────────
create table public.founding_slots (
  id boolean primary key default true check (id),
  total integer not null default 20 check (total between 0 and 1000),
  remaining integer not null default 20 check (remaining >= 0),
  updated_at timestamptz not null default now(),
  constraint remaining_le_total check (remaining <= total)
);
insert into public.founding_slots (id, total, remaining) values (true, 20, 20);
alter table public.founding_slots enable row level security;
revoke all on public.founding_slots from anon, authenticated;
grant select on public.founding_slots to anon, authenticated;
grant update (total, remaining, updated_at) on public.founding_slots to authenticated;
grant all on public.founding_slots to service_role;
create policy "Anyone can read founding slots" on public.founding_slots
  for select to anon, authenticated using (true);
create policy "Admins can update founding slots" on public.founding_slots
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
