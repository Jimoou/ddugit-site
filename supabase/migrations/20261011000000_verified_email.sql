-- Rows belong to an email address, so every policy asks "whose email is this?". Until now the
-- answer was the `email` claim of the caller's JWT, which Supabase issues even for an address that
-- was never confirmed (e.g. a password sign-up with "Confirm email" off). Answer from auth.users
-- instead, and only for a confirmed address, so that no Auth setting in the dashboard can hand
-- someone else's licenses, refunds or the admin reports to whoever signs up with their email.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- The signed-in user's email, lowercased, if it is confirmed; otherwise null (which matches no row).
-- security definer: the API roles can't read auth.users themselves.
create or replace function private.verified_email()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select lower(u.email)
  from auth.users u
  where u.id = auth.uid() and u.email_confirmed_at is not null
$$;
revoke all on function private.verified_email() from public, anon;
grant execute on function private.verified_email() to authenticated;

-- `(select …)` is evaluated once per statement instead of once per row.
alter policy "own licenses" on public.licenses
  using (lower(email) = (select private.verified_email()));

alter policy "own devices" on public.devices
  using (exists (
    select 1 from public.licenses l
    where l.id = license_id and lower(l.email) = (select private.verified_email())
  ));

alter policy "remove own devices" on public.devices
  using (exists (
    select 1 from public.licenses l
    where l.id = license_id and lower(l.email) = (select private.verified_email())
  ));

alter policy "issue for own license" on public.activations
  with check (
    used_at is null
    and expires_at <= now() + interval '10 minutes'
    and exists (
      select 1 from public.licenses l
      where l.id = license_id and lower(l.email) = (select private.verified_email())
    )
  );

alter policy "own admin row" on public.admins
  using (lower(email) = (select private.verified_email()));

alter policy "admins read reports" on public.reports
  using (exists (select 1 from public.admins a where lower(a.email) = (select private.verified_email())));

alter policy "admins triage reports" on public.reports
  using (exists (select 1 from public.admins a where lower(a.email) = (select private.verified_email())))
  with check (exists (select 1 from public.admins a where lower(a.email) = (select private.verified_email())));
