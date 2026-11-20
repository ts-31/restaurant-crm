-- =============================================
-- FILE: supabase\migrations\0001_init.sql
-- =============================================

-- L'Ambre TableFlow — initial schema, RLS, Realtime, seed

create extension if not exists "pgcrypto";

-- Fixed IDs for deterministic seed / docs
-- restaurant: a0000000-0000-4000-8000-000000000001
-- table 14:   a0000000-0000-4000-8000-000000000014

create type public.order_status as enum ('new', 'preparing', 'ready', 'served', 'cancelled');
create type public.service_pacing as enum ('Together', 'Drinks First', 'Coursed');
create type public.staff_role as enum ('staff', 'owner');

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tax_rate numeric(5,4) not null default 0.08,
  default_tip_rate numeric(5,4) not null default 0.18,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  full_name text not null default 'Staff',
  role public.staff_role not null default 'staff',
  created_at timestamptz not null default now()
);

create table public.tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  label text not null,
  section text,
  qr_slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  sort_order int not null default 0
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  subtitle text,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  badge text,
  meta text,
  is_signature boolean not null default false,
  is_available boolean not null default true,
  tags text[] default '{}',
  sort_order int not null default 0
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  table_id uuid not null references public.tables (id) on delete restrict,
  order_number text not null,
  status public.order_status not null default 'new',
  pacing public.service_pacing not null default 'Together',
  chef_notes text,
  subtotal numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  tip numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  placed_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  name_snapshot text not null,
  price_snapshot numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  note text,
  image_url text
);

create index orders_restaurant_status_idx on public.orders (restaurant_id, status, placed_at desc);
create index orders_table_idx on public.orders (table_id);
create index menu_items_restaurant_idx on public.menu_items (restaurant_id, is_available);
create index tables_restaurant_idx on public.tables (restaurant_id);

-- Staff restaurant helper
create or replace function public.get_staff_restaurant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select restaurant_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid())
$$;

-- Auto-create profile for new auth users (attach to seeded restaurant)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rid uuid;
begin
  select id into rid from public.restaurants where slug = 'lamber' limit 1;
  if rid is null then
    return new;
  end if;
  insert into public.profiles (id, restaurant_id, full_name, role)
  values (
    new.id,
    rid,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Staff'),
    'staff'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Order number sequence helper
create or replace function public.next_order_number(p_restaurant_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  select count(*) + 1000 into n from public.orders where restaurant_id = p_restaurant_id;
  return '#' || n::text;
end;
$$;

-- RLS
alter table public.restaurants enable row level security;
alter table public.profiles enable row level security;
alter table public.tables enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- restaurants
create policy "restaurants_public_select" on public.restaurants
  for select using (true);

create policy "restaurants_staff_update" on public.restaurants
  for update using (id = public.get_staff_restaurant_id());

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or restaurant_id = public.get_staff_restaurant_id());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- tables
create policy "tables_public_select_active" on public.tables
  for select using (is_active = true or restaurant_id = public.get_staff_restaurant_id());

create policy "tables_staff_insert" on public.tables
  for insert with check (restaurant_id = public.get_staff_restaurant_id());

create policy "tables_staff_update" on public.tables
  for update using (restaurant_id = public.get_staff_restaurant_id());

create policy "tables_staff_delete" on public.tables
  for delete using (restaurant_id = public.get_staff_restaurant_id());

-- categories
create policy "categories_public_select" on public.categories
  for select using (true);

create policy "categories_staff_insert" on public.categories
  for insert with check (restaurant_id = public.get_staff_restaurant_id());

create policy "categories_staff_update" on public.categories
  for update using (restaurant_id = public.get_staff_restaurant_id());

create policy "categories_staff_delete" on public.categories
  for delete using (restaurant_id = public.get_staff_restaurant_id());

-- menu_items
create policy "menu_items_public_select" on public.menu_items
  for select using (
    is_available = true
    or restaurant_id = public.get_staff_restaurant_id()
  );

create policy "menu_items_staff_insert" on public.menu_items
  for insert with check (restaurant_id = public.get_staff_restaurant_id());

create policy "menu_items_staff_update" on public.menu_items
  for update using (restaurant_id = public.get_staff_restaurant_id());

create policy "menu_items_staff_delete" on public.menu_items
  for delete using (restaurant_id = public.get_staff_restaurant_id());

-- orders: guests can insert for active tables; select by id; staff full access
create policy "orders_public_insert" on public.orders
  for insert with check (
    exists (
      select 1 from public.tables t
      where t.id = table_id and t.is_active = true and t.restaurant_id = restaurant_id
    )
  );

create policy "orders_public_select" on public.orders
  for select using (
    true
    or restaurant_id = public.get_staff_restaurant_id()
  );

create policy "orders_staff_update" on public.orders
  for update using (restaurant_id = public.get_staff_restaurant_id());

-- order_items
create policy "order_items_public_insert" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id)
  );

create policy "order_items_public_select" on public.order_items
  for select using (true);

create policy "order_items_staff_update" on public.order_items
  for update using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.restaurant_id = public.get_staff_restaurant_id()
    )
  );

-- Realtime
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
alter publication supabase_realtime add table public.menu_items;

-- Seed restaurant, tables, categories, menu
insert into public.restaurants (id, name, slug, tax_rate, default_tip_rate, currency)
values (
  'a0000000-0000-4000-8000-000000000001',
  'L''Ambre',
  'lamber',
  0.08,
  0.18,
  'USD'
);

insert into public.tables (id, restaurant_id, label, section, qr_slug, is_active) values
  ('a0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000001', 'Table 14', 'Indoor Terrace · Section A', 'table-14', true),
  ('a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'Table 8', 'Main Dining', 'table-8', true),
  ('a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Table 4', 'Main Dining', 'table-4', true),
  ('a0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'Table 7', 'Patio', 'table-7', true);

insert into public.categories (id, restaurant_id, name, sort_order) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Starters', 1),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Handmade Pasta', 2),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Pizza', 3),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Drinks', 4);

insert into public.menu_items (
  id, restaurant_id, category_id, name, subtitle, description, price, image_url, badge, meta, is_signature, is_available, tags, sort_order
) values
(
  'c0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000002',
  'Tagliatelle al Tartufo Nero',
  'Umbrian Black Winter Truffle · 24-Mo. Parmigiano',
  'Hand-cut ribbon pasta tossed in mountain butter, topped with generous shavings of Norcia winter truffle, chives, and aerated organic parmesan cream foam.',
  28.00,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAb4BcpUgrg5uuPVJIXJATtA-xfWx8oyV0ZMPAPCi0SKobsNv0olD9HXwUmkXwFzlq87fB2_cMGnePhfyzZz3Fhbs0vhk1JMHF232cDtugW0VTGVY5wGFD2a1h8BuD6uoi75cJx4uZUZ_lnymU3tbjO5bm6ViVAroUnZSvi5UoMwgOzQFv8n223arltTmfGcs94i1oDVQ_l6rsy3j_DDwYO6FQ4f5KoCP2WosY8NSC9mlFhqW-PE2xN',
  null,
  null,
  true,
  true,
  array['Fresh Daily', 'Vegetarian'],
  1
),
(
  'c0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000003',
  'Burrata & San Marzano Pizza',
  null,
  'Fermented 72-hour sourdough, scorched San Marzano D.O.P., pugliese torn burrata, cold-pressed Sicilian olive oil, sweet mountain basil.',
  24.00,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAtwUuZhCtV4Zu-awFFHHygnM-1YmjXz0ZQ6DpkFv3wRucYcO4_RbpYgspcpybkEDk59ijN4MeYzWYu3d4v_12LtbzEqVZ3ht-t-tkvXW0hL1FsTS59AttcMDFQ7qEtBhwjbC3DVS595fNAKfmFrF5s_nMcvK1RzlrjV-w_Nwbg1NV6gRTHwWkGJleSkRN5NDsDBpLkLeALb2EAFs27PCeSdh6MI6eTertnKFqusdJqBNCNZCJnpIFS',
  'Wood Fired',
  '12 min bake',
  false,
  true,
  array['Veg'],
  2
),
(
  'c0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000004',
  'Smoked Rosemary Old Fashioned',
  null,
  'Small-batch Kentucky bourbon, demerara, aromatic bitters, ignited organic rosemary essence over hand-carved ice sphere.',
  18.00,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCx58zYcj4UJlWC5NC_VRmp07Nl3GoMirGhNNlzj6e58mj89VTG2zUk-LySusQknjS5gpk0OxHpOHK5XgdptP2zsmOzeFsAb_Wb84n4jiY4iRjAmzKHh1HH5ynTvdXt4jLtMYrS77cdFNcuXLjBU6eJnfHSnW9cSZXgxjVnRRJoLSk1rlK_iR8AvazGy_UyrwEvoE9uudAnjPFNpdGx7anyvA8sr8lDlSj8uZ4561IqzKry7eprojLJ',
  'Bar Pick',
  'Cellar Bar · 2.5 oz',
  false,
  true,
  '{}',
  3
),
(
  'c0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  'Cacio e Pepe Croquettes',
  null,
  'Crisp panko crust, molten center of Pecorino Romano DOP and toasted Sarawak peppercorn, roasted garlic lemon aioli.',
  16.00,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD_RYzXGhXz_0tpjhEkEgEsxB3YSuFxLd98XPADZTjorQrQ6FEve6DVvBaUoWHrHk6K-vFx5mwIAuke7DQAfGINbd5jiq9bBeKSl_VEbOEKdWOhCkLjSu2Q0mwrV2OkyjRm7CaCywkl2XvDpW5tjmBbprCsZCmdFEZO6tChEMKljDqEqNUElMaPlcDjfwpT2_JoBTTIW7e-RW3X3E_nut5fiTcFqTJaRN87DpcAB1s4agNEodUXPV5S',
  null,
  null,
  false,
  true,
  array['Starter'],
  4
),
(
  'c0000000-0000-4000-8000-000000000005',
  'a0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  'Wagyu Ribeye Carpaccio',
  null,
  'Marbled A5 Wagyu beef slices, caperberries, shallot pearls, cold-pressed Ligurian olive oil, Parmigiano ribbons.',
  22.00,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAfD_jpBijxWombMTZeuPR5gUfDCvpXx4rZyUgW07uB6-dHd5Xvlm9IISDEks8L4PGfxWLYxnajEjEgp9RHTLqDDnDclUvP5F2Qpysok6cLXxCM1LpvO1mPZ5QFA3N-UZz8yB6bpsw9OTLpqyz6kfiwKfWYJULjL9vXWQk8xFj_7UUoIqSjUjnu6DkuTmDMIYy3L-2hIyqov22Gr_IgZias7Z_Bn7CmenJmlBOkNeain3Ixxj-XEveo',
  null,
  null,
  false,
  true,
  array['Gluten-Free'],
  5
);


-- =============================================
-- FILE: supabase\migrations\0002_seed_admin.sql
-- =============================================

-- Seed single admin user for L'Ambre TableFlow
-- Run once in Supabase SQL Editor after 0001_init.sql
-- Email: tejas2025s@gmail.com / Password: Admin@123

create extension if not exists "pgcrypto";

do $$
declare
  v_user_id uuid;
  v_restaurant_id uuid;
begin
  select id into v_user_id from auth.users where email = 'tejas2025s@gmail.com';

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'tejas2025s@gmail.com',
      crypt('Admin@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', 'tejas2025s@gmail.com',
        'email_verified', true
      ),
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    );
  else
    update auth.users
    set
      encrypted_password = crypt('Admin@123', gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
    where id = v_user_id;
  end if;

  select id into v_restaurant_id from public.restaurants where slug = 'lamber' limit 1;

  if v_restaurant_id is null then
    raise exception 'Restaurant slug lamber not found. Run 0001_init.sql first.';
  end if;

  insert into public.profiles (id, restaurant_id, full_name, role)
  values (v_user_id, v_restaurant_id, 'Admin', 'owner')
  on conflict (id) do update
  set
    role = 'owner',
    full_name = 'Admin',
    restaurant_id = excluded.restaurant_id;
end $$;


-- =============================================
-- FILE: supabase\migrations\0003_branding_storage.sql
-- =============================================

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


-- =============================================
-- FILE: supabase\migrations\0004_savora_european_menu.sql
-- =============================================

-- Migration 0004: Maison Aurelia European Gourmet Branding & Menu Seed
-- Run in Supabase SQL Editor after 0001, 0002, 0003

do $$
declare
  v_restaurant_id uuid;
  v_cat_starters uuid;
  v_cat_mains uuid;
  v_cat_pasta uuid;
  v_cat_desserts uuid;
begin
  -- 1. Find restaurant (by slug 'lamber' or first restaurant)
  select id into v_restaurant_id from public.restaurants where slug = 'lamber' limit 1;
  if v_restaurant_id is null then
    select id into v_restaurant_id from public.restaurants limit 1;
  end if;

  if v_restaurant_id is null then
    raise exception 'No restaurant found. Run 0001_init.sql first.';
  end if;

  -- 2. Update restaurant brand identity to Maison Aurelia
  update public.restaurants
  set
    name = 'Maison Aurelia',
    accent_color = '#C9A84C',
    currency = 'EUR',
    tax_rate = 0.10,
    default_tip_rate = 0.12
  where id = v_restaurant_id;

  -- 3. Delete existing menu items & order items for clean menu replacement
  delete from public.order_items where menu_item_id in (select id from public.menu_items where restaurant_id = v_restaurant_id);
  delete from public.menu_items where restaurant_id = v_restaurant_id;
  delete from public.categories where restaurant_id = v_restaurant_id;

  -- 4. Create 4 European Gourmet Categories
  v_cat_starters := gen_random_uuid();
  v_cat_mains    := gen_random_uuid();
  v_cat_pasta    := gen_random_uuid();
  v_cat_desserts := gen_random_uuid();

  insert into public.categories (id, restaurant_id, name, sort_order)
  values
    (v_cat_starters, v_restaurant_id, 'Starters', 1),
    (v_cat_mains,    v_restaurant_id, 'Mains', 2),
    (v_cat_pasta,    v_restaurant_id, 'Pasta & Risotto', 3),
    (v_cat_desserts, v_restaurant_id, 'Desserts', 4);

  -- 5. Insert 10 European Gourmet Dishes
  insert into public.menu_items (
    id, restaurant_id, category_id, name, subtitle, description,
    price, image_url, badge, meta, is_signature, is_available, tags, sort_order
  ) values
  -- #1 Beef Carpaccio
  (
    gen_random_uuid(),
    v_restaurant_id,
    v_cat_starters,
    'Beef Carpaccio',
    'Carpaccio di Manzo Stagionato',
    'Thinly sliced aged beef, shaved Parmigiano-Reggiano 36-month, caperberries, wild rocket, cold-pressed Ligurian olive oil & white truffle essence.',
    16.00,
    'https://ijvqgldcgaoabuhlhdfu.supabase.co/storage/v1/object/public/menu-images/dishes/beef_carpaccio.jpg',
    'Chef Pick',
    'Starter · 180g',
    false,
    true,
    array['Gluten-Free', 'Aged Beef'],
    1
  ),
  -- #2 Burrata Pugliese
  (
    gen_random_uuid(),
    v_restaurant_id,
    v_cat_starters,
    'Burrata Pugliese',
    'Burrata con Pomodorini e Basilico',
    'Creamy artisanal Pugliese burrata, heirloom San Marzano tomatoes, genovese basil emulsion, aged balsamico di Modena & Maldon sea salt crystals.',
    14.00,
    'https://ijvqgldcgaoabuhlhdfu.supabase.co/storage/v1/object/public/menu-images/dishes/burrata_pugliese.jpg',
    'Fresh Daily',
    'Starter · 200g',
    false,
    true,
    array['Vegetarian', 'Imported D.O.P.'],
    2
  ),
  -- #3 French Onion Soup
  (
    gen_random_uuid(),
    v_restaurant_id,
    v_cat_starters,
    'French Onion Soup',
    'Soupe à l''Oignon Gratinée',
    'Traditional slow-caramelised Roscoff onion broth, flambéed with Courvoisier Cognac, topped with artisan sourdough crouton and bubbly melted Gruyère AOP.',
    12.00,
    'https://ijvqgldcgaoabuhlhdfu.supabase.co/storage/v1/object/public/menu-images/dishes/french_onion_soup.jpg',
    null,
    'Starter · French Classic',
    false,
    true,
    array['French Classic'],
    3
  ),
  -- #4 Côte de Bœuf (Signature)
  (
    gen_random_uuid(),
    v_restaurant_id,
    v_cat_mains,
    'Côte de Bœuf (for 2)',
    'Dry-Aged Prime Rib of Beef',
    '800g prime dry-aged bone-in beef rib, flame-seared, served with roasted garlic bone marrow, Béarnaise sauce, truffled jus & triple-cooked duck fat frites.',
    68.00,
    'https://ijvqgldcgaoabuhlhdfu.supabase.co/storage/v1/object/public/menu-images/dishes/cote_de_boeuf.jpg',
    'Signature',
    'Mains · 800g · Serves 2',
    true,
    true,
    array['Dry Aged', 'Signature', 'For Two'],
    4
  ),
  -- #5 Pan-Seared Duck Breast
  (
    gen_random_uuid(),
    v_restaurant_id,
    v_cat_mains,
    'Pan-Seared Duck Breast',
    'Magret de Canard Rôti',
    'Pan-roasted tender French duck breast, Morello cherry and red wine reduction, silky celeriac purée, glazed heritage baby carrots & crispy lardons.',
    34.00,
    'https://ijvqgldcgaoabuhlhdfu.supabase.co/storage/v1/object/public/menu-images/dishes/duck_breast.jpg',
    null,
    'Mains · 280g',
    false,
    true,
    array['Gluten-Free', 'Poultry'],
    5
  ),
  -- #6 Grilled Mediterranean Sea Bass
  (
    gen_random_uuid(),
    v_restaurant_id,
    v_cat_mains,
    'Grilled Whole Sea Bass',
    'Branzino alla Griglia',
    'Whole butterfly Mediterranean sea bass fillet, preserved Amalfi lemon butter emulsion, caperberry salsa, charred fennel bulbs & sautéed samphire.',
    38.00,
    'https://ijvqgldcgaoabuhlhdfu.supabase.co/storage/v1/object/public/menu-images/dishes/sea_bass.jpg',
    'Wild Caught',
    'Mains · Seafood',
    false,
    true,
    array['Gluten-Free', 'Seafood'],
    6
  ),
  -- #7 Herb-Crusted Lamb Rack
  (
    gen_random_uuid(),
    v_restaurant_id,
    v_cat_mains,
    'Lamb Rack Provençal',
    'Carré d''Agneau en Croûte d''Herbes',
    'Roasted French-trimmed rack of lamb with Dijon herb crumb, slow-simmered Niçoise ratatouille, rosemary garlic reduction & fondant potato.',
    42.00,
    'https://ijvqgldcgaoabuhlhdfu.supabase.co/storage/v1/object/public/menu-images/dishes/lamb_rack.jpg',
    null,
    'Mains · 320g',
    false,
    true,
    array['Chef Special'],
    7
  ),
  -- #8 Black Truffle Tagliatelle
  (
    gen_random_uuid(),
    v_restaurant_id,
    v_cat_pasta,
    'Black Truffle Tagliatelle',
    'Tagliatelle al Tartufo Nero',
    'Hand-crafted fresh egg tagliatelle pasta, emulsified Normandy mountain butter, black Norcia winter truffle shavings, 36-month Parmigiano & organic chives.',
    28.00,
    'https://ijvqgldcgaoabuhlhdfu.supabase.co/storage/v1/object/public/menu-images/dishes/truffle_tagliatelle.jpg',
    'Hand Made',
    'Fresh Pasta · Norcia Truffle',
    false,
    true,
    array['Vegetarian', 'Fresh Pasta'],
    8
  ),
  -- #9 Lobster Bisque Risotto
  (
    gen_random_uuid(),
    v_restaurant_id,
    v_cat_pasta,
    'Lobster Bisque Risotto',
    'Risotto all''Astice e Zafferano',
    'Acquerello carnaroli rice simmered in rich Breton lobster bisque, butter-poached tiger prawns, saffron infusion, tarragon foam & lemon oil.',
    36.00,
    'https://ijvqgldcgaoabuhlhdfu.supabase.co/storage/v1/object/public/menu-images/dishes/lobster_risotto.jpg',
    'Premium',
    'Seafood · Acquerello Rice',
    false,
    true,
    array['Gluten-Free', 'Seafood'],
    9
  ),
  -- #10 Classic Madagascan Crème Brûlée
  (
    gen_random_uuid(),
    v_restaurant_id,
    v_cat_desserts,
    'Crème Brûlée',
    'Crème Brûlée à la Vanille Bourbon',
    'Rich baked vanilla custard infused with genuine Madagascan Bourbon vanilla beans, hand-torched golden caramel crust, served with crisp almond tuile.',
    10.00,
    'https://ijvqgldcgaoabuhlhdfu.supabase.co/storage/v1/object/public/menu-images/dishes/creme_brulee.jpg',
    null,
    'Dessert · Classic',
    false,
    true,
    array['Vegetarian', 'Dessert'],
    10
  );

end $$;


-- =============================================
-- FILE: supabase\migrations\0005_restaurant_tagline.sql
-- =============================================

-- Migration 0005: Add restaurant tagline / subtitle
-- Run in Supabase SQL Editor if you want to store custom taglines in the database

alter table public.restaurants
  add column if not exists tagline text default 'Fine Dining & Bar';


-- =============================================
-- FILE: supabase\migrations\0006_database_health_monitor.sql
-- =============================================

-- Migration 0006: Database & Storage Health Monitor RPC
-- Allows authenticated staff to inspect database footprint, storage usage, and table sizes.

create or replace function public.get_database_health()
returns json
language plpgsql
security definer
set search_path = public, pg_catalog, storage
as $$
declare
  v_db_bytes bigint;
  v_storage_bytes bigint;
  v_table_stats json;
  v_result json;
begin
  -- 1. Compute total database disk size in bytes
  select pg_database_size(current_database()) into v_db_bytes;

  -- 2. Compute total storage size from storage.objects if available
  begin
    select coalesce(sum((metadata->>'size')::bigint), 0)
    into v_storage_bytes
    from storage.objects;
  exception when others then
    v_storage_bytes := 0;
  end;

  -- 3. Top tables sorted by relation size (data + indexes)
  select json_agg(t) into v_table_stats
  from (
    select
      relname as name,
      pg_total_relation_size(relid) as total_bytes,
      n_live_tup as row_count
    from pg_stat_user_tables
    order by pg_total_relation_size(relid) desc
    limit 10
  ) t;

  -- 4. Construct JSON response
  v_result := json_build_object(
    'db_bytes', coalesce(v_db_bytes, 0),
    'db_limit_bytes', 524288000, -- 500 MB (Supabase default free tier limit)
    'storage_bytes', coalesce(v_storage_bytes, 0),
    'storage_limit_bytes', 1073741824, -- 1 GB (Supabase default storage limit)
    'tables', coalesce(v_table_stats, '[]'::json),
    'recorded_at', now()
  );


  return v_result;
end;
$$;

-- Grant execution permission to authenticated users (staff / admins)
grant execute on function public.get_database_health() to authenticated;
grant execute on function public.get_database_health() to service_role;



