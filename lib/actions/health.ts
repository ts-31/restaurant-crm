"use server";

import { createClient } from "@/lib/supabase/server";
import type { DatabaseHealthData } from "@/lib/types";

/**
 * Fetches real PostgreSQL database size via the `get_database_health` RPC function.
 * Requires migration 0006_database_health_monitor.sql to be run on Supabase first.
 * Returns an error string if the RPC hasn't been deployed yet.
 */
export async function getDatabaseHealth(): Promise<{ data?: DatabaseHealthData; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc("get_database_health");

    if (rpcError) {
      return { error: rpcError.message };
    }

    if (!rpcData) {
      return { error: "No data returned from database" };
    }

    return {
      data: {
        db_bytes: Number(rpcData.db_bytes ?? 0),
        db_limit_bytes: 524288000, // 500 MB
        storage_bytes: Number(rpcData.storage_bytes ?? 0),
        storage_limit_bytes: Number(rpcData.storage_limit_bytes ?? 1073741824),
        tables: rpcData.tables ?? [],
        recorded_at: rpcData.recorded_at || new Date().toISOString(),
        is_fallback: false,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to connect to database" };
  }
}
