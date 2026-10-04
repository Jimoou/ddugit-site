-- Sign-in activation: ddugit.com/activate hands the app a one-time code (only its
-- hash is kept here); the app trades it for the license through the license-activate
-- function within a few minutes, once.

create table public.activations (
  code_hash text primary key,                  -- SHA-256 (hex) of the code
  license_id text not null references public.licenses (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '5 minutes',
  used_at timestamptz
);

alter table public.activations enable row level security;

-- Signed-in users issue codes for their own licenses only, short-lived and unused;
-- nobody reads them through the API (the license-activate function uses the service role).
create policy "issue for own license" on public.activations
  for insert to authenticated
  with check (
    used_at is null
    and expires_at <= now() + interval '10 minutes'
    and exists (
      select 1 from public.licenses l
      where l.id = license_id and lower(l.email) = lower(auth.jwt() ->> 'email')
    )
  );
