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
