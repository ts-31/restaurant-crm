import { notFound } from "next/navigation";
import { resolveTableParam } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { OrderStatusView } from "@/components/cart/OrderStatusView";
import type { Order, OrderItem, Restaurant } from "@/lib/types";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ tableId: string; orderId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { tableId, orderId } = await params;
  const { session_id } = await searchParams;
  const table = await resolveTableParam(tableId);
  if (!table) notFound();

  const supabase = await createClient();

  // Resilient synchronous reconciliation when redirected back from Stripe Checkout
  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        const adminSupabase = createAdminClient();
        await adminSupabase
          .from("orders")
          .update({
            payment_status: "paid",
            stripe_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
          })
          .eq("id", orderId);
      }
    } catch (e) {
      console.warn("Could not retrieve Stripe session on return:", e);
    }
  }

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order || order.table_id !== table.id) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);

  // resolveTableParam already joins restaurants(*) — extract it for the share card
  const restaurant = (table.restaurants ?? null) as Restaurant | null;

  return (
    <OrderStatusView
      tableId={table.id}
      tableLabel={table.label}
      initialOrder={order as Order}
      initialItems={(items ?? []) as OrderItem[]}
      currency={table.restaurants?.currency || "EUR"}
      restaurant={restaurant}
    />
  );
}
