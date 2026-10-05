-- Lifetime licenses: one payment, every future update, up to `max_devices` devices.
-- Rows bought this way are kind 'personal', plan 'lifetime', with no paid_through;
-- the old kinds and plans stay valid for existing rows. A lifetime license is signed
-- per device at activation (license-activate), so its row needs no stored text.

alter table public.licenses drop constraint if exists licenses_kind_check;
alter table public.licenses
  add constraint licenses_kind_check check (kind in ('personal', 'commercial', 'site'));
alter table public.licenses alter column kind set default 'personal';

alter table public.licenses drop constraint if exists licenses_plan_check;
alter table public.licenses
  add constraint licenses_plan_check check (plan in ('lifetime', 'monthly', 'yearly'));

alter table public.licenses add column max_devices integer not null default 3 check (max_devices > 0);
alter table public.licenses alter column text drop not null;
-- The store's order for a one-time purchase (subscriptions use store_subscription_id).
alter table public.licenses add column store_order_id text unique;

-- The devices a license is activated on: only a hash of the app's device id is kept.
create table public.devices (
  license_id text not null references public.licenses (id) on delete cascade,
  device_hash text not null check (device_hash ~ '^[0-9a-f]{64}$'),  -- SHA-256 (hex) of the device id
  name text not null default 'This computer' check (char_length(name) between 1 and 64),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (license_id, device_hash)
);

alter table public.devices enable row level security;

-- Signed-in owners see and remove their licenses' devices; only license-activate
-- (service role) adds them.
create policy "own devices" on public.devices
  for select to authenticated
  using (exists (
    select 1 from public.licenses l
    where l.id = license_id and lower(l.email) = lower(auth.jwt() ->> 'email')
  ));

create policy "remove own devices" on public.devices
  for delete to authenticated
  using (exists (
    select 1 from public.licenses l
    where l.id = license_id and lower(l.email) = lower(auth.jwt() ->> 'email')
  ));

-- No new device past the license's max_devices, even when two sign-ins race
-- (the license row is locked while counting). A device already there may be updated.
create function public.devices_within_limit() returns trigger
  language plpgsql
  set search_path = ''
as $$
declare
  allowed integer;
begin
  select l.max_devices into allowed from public.licenses l where l.id = new.license_id for update;
  if exists (
    select 1 from public.devices d where d.license_id = new.license_id and d.device_hash = new.device_hash
  ) then
    return new;
  end if;
  if (select count(*) from public.devices d where d.license_id = new.license_id) >= allowed then
    raise exception 'license % is already on % devices', new.license_id, allowed using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger devices_within_limit
  before insert on public.devices
  for each row execute function public.devices_within_limit();

-- Each one-time code now says which device it was issued for (null: a site license).
alter table public.activations
  add column device_hash text check (device_hash ~ '^[0-9a-f]{64}$'),
  add column device_name text check (char_length(device_name) between 1 and 64);
