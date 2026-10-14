-- Making an offline activation code ends the self-service refund: a computer that never goes
-- online keeps Pro after a refund, so the code is the point of no return. license-offline stamps
-- the first code here (after the buyer agrees on the account page) and license-refund refuses a
-- stamped license. Readable like the other columns.

alter table public.licenses add column offline_issued_at timestamptz;
