import { notFound } from "next/navigation";
import { resolveTableParam } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusView } from "@/components/cart/OrderStatusView";
import type { Order, OrderItem } from "@/lib/types";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ tableId: string; orderId: string }>;
}) {
  const { tableId, orderId } = await params;
  const table = await resolveTableParam(tableId);
  if (!table) notFound();

  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order || order.table_id !== table.id) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);

  return (
    <OrderStatusView
      tableId={table.id}
      tableLabel={table.label}
      initialOrder={order as Order}
      initialItems={(items ?? []) as OrderItem[]}
      currency={table.restaurants?.currency || "EUR"}
    />
  );
}
