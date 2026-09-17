import { redirect } from "next/navigation";
import { LiveOrdersBoard } from "@/components/dashboard/LiveOrdersBoard";
import { getStaffContext } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { MenuItem, OrderWithItems } from "@/lib/types";

export default async function DashboardPage() {
  const ctx = await getStaffContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const [{ data: orders }, { data: menuItems }, { count: tableCount }, { count: activeTables }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*, order_items(*), tables(label, section)")
        .eq("restaurant_id", ctx.restaurant.id)
        .in("status", ["new", "preparing", "ready", "served"])
        .order("placed_at", { ascending: false })
        .limit(40),
      supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", ctx.restaurant.id)
        .order("sort_order"),
      supabase
        .from("tables")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", ctx.restaurant.id),
      supabase
        .from("tables")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", ctx.restaurant.id)
        .eq("is_active", true),
    ]);

  return (
    <LiveOrdersBoard
      restaurantId={ctx.restaurant.id}
      initialOrders={(orders ?? []) as OrderWithItems[]}
      menuItems={(menuItems ?? []) as MenuItem[]}
      seatedCount={activeTables ?? 0}
      tableCount={tableCount ?? 0}
    />
  );
}
