"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcOrderTotals } from "@/lib/money";
import { stripe } from "@/lib/stripe";
import type { PlaceOrderInput } from "./index";

export type CreateStripeCheckoutResult = {
  url?: string;
  orderId?: string;
  error?: string;
};

export async function createStripeCheckoutSession(
  input: PlaceOrderInput
): Promise<CreateStripeCheckoutResult> {
  try {
    const supabase = await createClient();

    if (!input.lines.length) {
      return { error: "Cart is empty" };
    }

    // 1. Verify Table
    const { data: table, error: tableError } = await supabase
      .from("tables")
      .select("id, restaurant_id, label, is_active")
      .eq("id", input.tableId)
      .maybeSingle();

    if (tableError || !table || !table.is_active) {
      return { error: "Table not found or inactive" };
    }

    // 2. Fetch authoritative menu items (prevent client-side price tampering)
    const ids = input.lines.map((l) => l.menuItemId);
    const { data: items, error: itemsError } = await supabase
      .from("menu_items")
      .select("*")
      .in("id", ids)
      .eq("restaurant_id", table.restaurant_id);

    if (itemsError || !items?.length) {
      return { error: "Menu items unavailable" };
    }

    const itemMap = new Map(items.map((i) => [i.id, i]));
    for (const line of input.lines) {
      const item = itemMap.get(line.menuItemId);
      if (!item || !item.is_available || line.quantity < 1) {
        return { error: `Item unavailable: ${line.menuItemId}` };
      }
    }

    // 3. Fetch restaurant details (currency, tax rate)
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id, name, tax_rate, currency")
      .eq("id", table.restaurant_id)
      .single();

    const taxRate = Number(restaurant?.tax_rate ?? 0.08);
    const tipRate = Math.max(0, input.tipRate);
    const currency = (restaurant?.currency ?? "eur").toLowerCase();

    let subtotal = 0;
    const orderLines = input.lines.map((line) => {
      const item = itemMap.get(line.menuItemId)!;
      const price = Number(item.price);
      subtotal += price * line.quantity;
      return {
        menu_item_id: item.id,
        name_snapshot: item.name,
        price_snapshot: price,
        quantity: line.quantity,
        note: line.note || null,
        image_url: item.image_url,
      };
    });

    const totals = calcOrderTotals(subtotal, taxRate, tipRate);

    // 4. Generate Order Number
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("restaurant_id", table.restaurant_id);

    const orderNumber = `#${1000 + (count ?? 0) + 1}`;

    // 5. Create Order in DB (status: 'new', payment_status: 'pending', payment_method: 'stripe')
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: table.restaurant_id,
        table_id: table.id,
        order_number: orderNumber,
        status: "new",
        payment_status: "pending",
        payment_method: "stripe",
        pacing: input.pacing,
        chef_notes: input.chefNotes || null,
        subtotal: totals.subtotal,
        tax: totals.tax,
        tip: totals.tip,
        total: totals.total,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return { error: orderError?.message ?? "Failed to create order" };
    }

    // 6. Insert Order Items
    const { error: linesError } = await supabase.from("order_items").insert(
      orderLines.map((l) => ({ ...l, order_id: order.id }))
    );

    if (linesError) {
      return { error: linesError.message };
    }

    // 7. Determine App Base URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 8. Build Stripe Line Items
    const stripeLineItems = input.lines.map((line) => {
      const item = itemMap.get(line.menuItemId)!;
      return {
        price_data: {
          currency,
          unit_amount: Math.round(Number(item.price) * 100),
          product_data: {
            name: item.name,
            description: item.description ?? undefined,
            images: item.image_url ? [item.image_url] : undefined,
          },
        },
        quantity: line.quantity,
      };
    });

    // Add Tax as a line item if applicable
    if (totals.tax > 0) {
      stripeLineItems.push({
        price_data: {
          currency,
          unit_amount: Math.round(totals.tax * 100),
          product_data: {
            name: `Tax (${Math.round(taxRate * 100)}%)`,
            description: "Local sales tax",
            images: undefined,
          },
        },
        quantity: 1,
      });
    }

    // 9. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      allowed_payment_method_types: ["card"],
      line_items: stripeLineItems,
      mode: "payment",
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        tableId: table.id,
        restaurantId: table.restaurant_id,
        tableLabel: table.label,
      },
      success_url: `${appUrl}/t/${table.id}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/t/${table.id}/cart?cancelled=true`,
    });

    // 10. Update Order with Stripe Session ID (using Admin client to bypass public RLS restrictions)
    const adminSupabase = createAdminClient();
    await adminSupabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return {
      url: session.url ?? undefined,
      orderId: order.id,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initialize Stripe checkout";
    console.error("Stripe Checkout Error:", err);
    return { error: message };
  }
}
