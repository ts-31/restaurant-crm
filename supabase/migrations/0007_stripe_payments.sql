-- Migration 0007: Stripe Payments Integration
-- Adds payment tracking columns and enums to the orders table

-- 1. Create payment status and payment method enums if they do not exist
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('unpaid', 'pending', 'paid', 'failed', 'refunded');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('cash', 'stripe');
  end if;
end $$;

-- 2. Alter orders table to add payment tracking
alter table public.orders
  add column if not exists payment_status public.payment_status not null default 'unpaid',
  add column if not exists payment_method public.payment_method not null default 'cash',
  add column if not exists stripe_session_id text unique,
  add column if not exists stripe_payment_intent_id text;

-- 3. Create index for fast webhook session reconciliation
create index if not exists orders_stripe_session_idx on public.orders (stripe_session_id);
create index if not exists orders_payment_status_idx on public.orders (payment_status);

-- 4. Ensure schema permissions
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
