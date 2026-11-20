-- Migration 0008: Restaurant Location & Google Maps
-- Adds address, latitude, and longitude columns to restaurants

alter table public.restaurants
  add column if not exists address text default '15 Place Vendôme, 75001 Paris, France',
  add column if not exists latitude double precision default 48.8675,
  add column if not exists longitude double precision default 2.3294;

-- Update existing seeded restaurant row if values are null
update public.restaurants
set
  address = coalesce(address, '15 Place Vendôme, 75001 Paris, France'),
  latitude = coalesce(latitude, 48.8675),
  longitude = coalesce(longitude, 2.3294)
where slug = 'lamber';

-- Ensure schema permissions
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
