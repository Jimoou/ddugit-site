-- Narrow what the API roles may do with the license tables, as 20261007000000_reports.sql
-- does for reports. Supabase grants anon and authenticated everything on new tables; RLS
-- then guards rows, but not TRUNCATE, REFERENCES or TRIGGER, and a future policy mistake
-- would reach further than it should. What the site does with the signed-in user's client:
--   licenses:    select (account page, /activate)
--   devices:     select, delete (account page, /activate; "Remove")
--   activations: insert code_hash, license_id, device_hash, device_name (/activate)
-- Everything else goes through the Edge Functions as the service role, which keeps full access.
-- (Dated after 20261007000000: migrations must sort after the ones already applied.)

revoke all on public.licenses, public.devices, public.activations from anon, authenticated;
grant select on public.licenses to authenticated;
grant select, delete on public.devices to authenticated;
grant insert (code_hash, license_id, device_hash, device_name) on public.activations to authenticated;

-- `(select auth.jwt() ->> 'email')` is evaluated once per statement instead of once per row.
alter policy "own licenses" on public.licenses
  using (lower(email) = lower((select auth.jwt() ->> 'email')));

alter policy "own devices" on public.devices
  using (exists (
    select 1 from public.licenses l
    where l.id = license_id and lower(l.email) = lower((select auth.jwt() ->> 'email'))
  ));

alter policy "remove own devices" on public.devices
  using (exists (
    select 1 from public.licenses l
    where l.id = license_id and lower(l.email) = lower((select auth.jwt() ->> 'email'))
  ));

alter policy "issue for own license" on public.activations
  with check (
    used_at is null
    and expires_at <= now() + interval '10 minutes'
    and exists (
      select 1 from public.licenses l
      where l.id = license_id and lower(l.email) = lower((select auth.jwt() ->> 'email'))
    )
  );

alter policy "own admin row" on public.admins
  using (lower(email) = lower((select auth.jwt() ->> 'email')));

alter policy "admins read reports" on public.reports
  using (exists (select 1 from public.admins a where lower(a.email) = lower((select auth.jwt() ->> 'email'))));

alter policy "admins triage reports" on public.reports
  using (exists (select 1 from public.admins a where lower(a.email) = lower((select auth.jwt() ->> 'email'))))
  with check (exists (select 1 from public.admins a where lower(a.email) = lower((select auth.jwt() ->> 'email'))));
