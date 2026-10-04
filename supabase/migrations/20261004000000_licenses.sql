-- Commercial licenses: one row per license, kept current by the store webhook
-- (Lemon Squeezy) and read by the license-refresh function and the account page.

create table public.licenses (
  id text primary key,                         -- lic_…, also inside the signed license text
  email text not null,                         -- the buyer; the account page matches it to the login
  name text not null,
  kind text not null default 'commercial' check (kind in ('commercial', 'site')),
  plan text check (plan in ('monthly', 'yearly')),   -- null for a site license
  seats integer not null default 1 check (seats > 0),
  status text not null default 'active',       -- the store's subscription status (active, cancelled, expired, past_due, …)
  paid_through date,                           -- end of the period paid for; null for a site license
  text text not null,                          -- the latest signed license text
  store_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index licenses_email on public.licenses (lower(email));

alter table public.licenses enable row level security;

-- Signed-in users read the licenses bought with their email; nobody writes through the API
-- (the webhook and refresh functions use the service role).
create policy "own licenses" on public.licenses
  for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));
