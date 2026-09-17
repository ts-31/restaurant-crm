import { redirect } from "next/navigation";
import { MenuManager } from "@/components/dashboard/MenuManager";
import { getStaffContext } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Category, MenuItem } from "@/lib/types";

export default async function MenuPage() {
  const ctx = await getStaffContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", ctx.restaurant.id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", ctx.restaurant.id)
      .order("sort_order"),
  ]);

  return (
    <MenuManager
      categories={(categories ?? []) as Category[]}
      items={(items ?? []) as MenuItem[]}
      currency={ctx.restaurant.currency || "EUR"}
    />
  );
}
