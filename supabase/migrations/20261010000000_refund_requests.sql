-- Buyers can ask for a refund themselves on the account page, within the refund period:
-- license-refund asks Paddle for a full refund and stamps the license here, so the request
-- is made once and the page can say it is on its way. The license turns `refunded` when
-- Paddle approves it (paddle-webhook, adjustment.updated). Readable like the other columns.

alter table public.licenses add column refund_requested_at timestamptz;
