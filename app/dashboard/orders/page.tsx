import { redirect } from "next/navigation";
import { getStaffContext } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { OrdersHistory } from "@/components/dashboard/OrdersHistory";
import type { OrderWithItems } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersHistoryPage() {
  const ctx = await getStaffContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*), tables(label, section)")
    .eq("restaurant_id", ctx.restaurant.id)
    .order("placed_at", { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Order History & Analytics</h1>
        <p className="text-sm text-on-surface-variant">
          Complete log of all customer orders placed across all tables.
        </p>
      </div>

      <OrdersHistory
        initialOrders={(orders ?? []) as OrderWithItems[]}
        currency={ctx.restaurant.currency || "EUR"}
      />
    </div>
  );
}
