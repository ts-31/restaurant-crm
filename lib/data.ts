import { createClient } from "@/lib/supabase/server";
import type { Profile, Restaurant } from "@/lib/types";

export async function getStaffContext(): Promise<{
  restaurant: Restaurant;
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return null;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", profile.restaurant_id)
    .single();

  if (!restaurant) return null;
  return { restaurant: restaurant as Restaurant, profile: profile as Profile };
}

export async function resolveTableParam(tableParam: string) {
  const supabase = await createClient();
  
  // 1. Try by UUID
  const byId = await supabase
    .from("tables")
    .select("*, restaurants(*)")
    .eq("id", tableParam)
    .eq("is_active", true)
    .maybeSingle();

  if (byId.data) return byId.data;

  // 2. Try by exact qr_slug
  const bySlug = await supabase
    .from("tables")
    .select("*, restaurants(*)")
    .eq("qr_slug", tableParam)
    .eq("is_active", true)
    .maybeSingle();

  if (bySlug.data) return bySlug.data;

  // 3. Try by label search (e.g. 'table-14' or '14' -> 'Table 14')
  const cleaned = tableParam.replace(/[-_]/g, " ").trim();
  const byLabel = await supabase
    .from("tables")
    .select("*, restaurants(*)")
    .ilike("label", `%${cleaned}%`)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (byLabel.data) return byLabel.data;

  // 4. Fallback to first active table for friendly testing
  const fallback = await supabase
    .from("tables")
    .select("*, restaurants(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return fallback.data;
}
