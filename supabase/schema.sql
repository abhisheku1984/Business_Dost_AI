-- =====================================================================
--  Business Dost — Supabase schema (v1)
--  Paste this whole file into Supabase → SQL Editor → Run.
--
--  One row per shop. The row holds the shop's JSON document, which is the
--  same document the app already keeps on the device. That keeps this
--  migration small and reversible: no data model rewrite, no lost history.
--
--  If you later want per-table SQL (invoices, lines, customers as real
--  tables), that is a separate, bigger migration. This one is deliberately
--  boring so it can ship.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- the shop ----------
create table if not exists public.shops (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null unique default auth.uid()
                references auth.users (id) on delete cascade,
  shop_name   text,
  doc         jsonb not null,
  revision    bigint not null default 0,
  updated_at  timestamptz not null default now()
);

comment on table public.shops is
  'One row per shopkeeper. doc = the app''s whole JSON document (sales, items, customers, settings).';

-- ---------- row level security: you can only ever touch your own row ----------
alter table public.shops enable row level security;

drop policy if exists "own shop - read"   on public.shops;
drop policy if exists "own shop - insert" on public.shops;
drop policy if exists "own shop - update" on public.shops;
drop policy if exists "own shop - delete" on public.shops;

create policy "own shop - read"   on public.shops for select using (owner = auth.uid());
create policy "own shop - insert" on public.shops for insert with check (owner = auth.uid());
create policy "own shop - update" on public.shops for update using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own shop - delete" on public.shops for delete using (owner = auth.uid());

-- ---------- keep updated_at honest, and bump the revision ----------
create or replace function public.touch_shop()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.revision := coalesce(old.revision, 0) + 1;
  return new;
end;
$$;

drop trigger if exists shops_touch on public.shops;
create trigger shops_touch
  before update on public.shops
  for each row execute function public.touch_shop();

-- ---------- optional: a view that never exposes the document ----------
create or replace view public.shop_status as
  select owner, shop_name, revision, updated_at, pg_column_size(doc) as doc_bytes
  from public.shops;

-- =====================================================================
--  After running this:
--   1. Authentication → Providers → Email: keep "Confirm email" OFF for a
--      friendlier first run (or ON if you want verified emails).
--   2. Project Settings → API: copy the Project URL and the anon public key
--      into design/js/cloud-config.js.
--   3. The service_role key never goes in the app. Ever.
-- =====================================================================
