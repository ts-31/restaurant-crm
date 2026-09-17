-- Migration 0005: Add restaurant tagline / subtitle
-- Run in Supabase SQL Editor if you want to store custom taglines in the database

alter table public.restaurants
  add column if not exists tagline text default 'Fine Dining & Bar';
