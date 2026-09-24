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
