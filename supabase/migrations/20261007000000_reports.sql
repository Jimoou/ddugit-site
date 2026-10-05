-- Problem reports and inquiries from the app and the site's /contact form. Only the
-- `report` Edge Function (service role) adds them; the owner reads and triages them on
-- ddugit.com/admin, signed in, as an admin listed in `admins`.

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('bug', 'question')),
  message text not null check (char_length(message) between 1 and 5000),
  email text check (char_length(email) <= 254),               -- optional reply address
  diagnostics text check (char_length(diagnostics) <= 20000), -- redacted by the app, shown to the sender first
  source text not null check (source in ('app', 'web')),
  app_version text check (char_length(app_version) <= 32),
  os text check (char_length(os) <= 64),
  status text not null default 'new' check (status in ('new', 'read', 'done')),
  note text check (char_length(note) <= 5000),                -- the admin's private note
  sender_hash text check (sender_hash ~ '^[0-9a-f]{64}$'),    -- SHA-256 of REPORT_SALT and the IP; never the IP
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_status_created on public.reports (status, created_at desc);
create index reports_created on public.reports (created_at desc);
create index reports_sender_created on public.reports (sender_hash, created_at desc);

-- Who may read reports: matched to the login's email, case-insensitively.
-- Add one with: insert into public.admins (email) values ('someone@example.com');
create table public.admins (
  email text primary key
);

insert into public.admins (email) values ('kfromh0136@gmail.com') on conflict do nothing;

alter table public.admins enable row level security;
alter table public.reports enable row level security;

-- An admin sees only their own row (that is how the site tells an admin); nobody writes through the API.
create policy "own admin row" on public.admins
  for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy "admins read reports" on public.reports
  for select to authenticated
  using (exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email')));

create policy "admins triage reports" on public.reports
  for update to authenticated
  using (exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email')))
  with check (exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email')));

-- Supabase grants every API role everything on new tables; narrow that down. Through the API,
-- signed-in users may read (RLS then keeps it to admins) and change only status and note.
-- No inserts or deletes for anon or authenticated; the service role keeps full access.
revoke all on public.reports from anon, authenticated;
revoke all on public.admins from anon, authenticated;
grant select on public.reports to authenticated;
grant update (status, note) on public.reports to authenticated;
grant select on public.admins to authenticated;

create function public.reports_touch() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger reports_touch
  before update on public.reports
  for each row execute function public.reports_touch();
