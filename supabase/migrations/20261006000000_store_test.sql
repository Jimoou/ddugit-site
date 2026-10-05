-- Orders placed in the store's test mode (Lemon Squeezy `meta.test_mode`) still make a
-- license, so the whole purchase can be tried end to end; this marks them so they can be
-- told apart (and cleaned up: delete from public.licenses where store_test).

alter table public.licenses add column store_test boolean not null default false;
