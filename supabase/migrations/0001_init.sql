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
