-- Supabase pauses a Free project after 7 days without activity, and a paused project takes the
-- downloads, updates, Pro activation and the store webhook down with it. The keepalive workflow
-- (.github/workflows/keepalive.yml) calls this twice a week with the public anon key: one request
-- through the API that runs a query. It reads nothing and can't be pointed at anything else.

create or replace function public.keepalive()
returns integer
language sql
stable
set search_path = ''
as $$ select 1 $$;
revoke all on function public.keepalive() from public, authenticated;
grant execute on function public.keepalive() to anon;
