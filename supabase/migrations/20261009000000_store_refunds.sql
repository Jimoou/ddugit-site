-- The store moves to Paddle. A refund notification carries only the transaction id, and Paddle
-- may deliver it before (a retry of) the transaction's own notification, so refunds are kept
-- here too: paddle-webhook marks the license refunded when the transaction's row already exists,
-- and checks this table after inserting one. Service role only (no API access, no policies).

create table public.store_refunds (
  store_order_id text primary key,
  created_at timestamptz not null default now()
);

alter table public.store_refunds enable row level security;
revoke all on public.store_refunds from anon, authenticated;
