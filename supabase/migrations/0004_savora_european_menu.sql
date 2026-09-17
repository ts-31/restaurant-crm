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
