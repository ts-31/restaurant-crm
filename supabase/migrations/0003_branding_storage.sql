-- Migration 0003: restaurant branding columns + Supabase Storage bucket
-- Run in Supabase SQL Editor after 0001_init.sql and 0002_seed_admin.sql

-- 1. Add branding columns to restaurants
alter table public.restaurants
  add column if not exists logo_url   text,
  add column if not exists accent_color text;

-- 2. Update currency default to EUR and set existing row to EUR
alter table public.restaurants
  alter column currency set default 'EUR';

update public.restaurants
set currency = 'EUR'
where slug = 'lamber';

-- 3. Create the menu-images storage bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  5242880,  -- 5 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- 4. Storage RLS: authenticated users can upload/update/delete
create policy "menu_images_auth_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'menu-images');

create policy "menu_images_auth_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'menu-images');

create policy "menu_images_auth_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'menu-images');

-- Public read (anyone can view images)
create policy "menu_images_public_select" on storage.objects
  for select to public
  using (bucket_id = 'menu-images');
