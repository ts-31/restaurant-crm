import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Create elevated Supabase admin client for background webhook reconciliation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let event: Stripe.Event;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In development fallback if testing without webhook signing secret
      console.warn("⚠️ STRIPE_WEBHOOK_SECRET not provided or signature missing. Parsing unverified payload.");
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error(`❌ Webhook Error: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Handle Stripe events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.client_reference_id || session.metadata?.orderId;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      if (!orderId) {
        console.error("❌ checkout.session.completed received without orderId:", session.id);
        break;
      }

      console.log(`✅ Payment confirmed for Order ${orderId} (Session: ${session.id})`);

      // Idempotently update order status to 'paid'
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          stripe_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId ?? null,
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("❌ Failed to update order payment status in Supabase:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Hook point: Ready for future Roadmap Items:
      // Item #2: Dispatch WhatsApp Receipt & Kitchen alert
      // Item #4: Dispatch CRM webhook
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        console.warn(`⚠️ Payment failed for Order ${orderId}:`, paymentIntent.last_payment_error?.message);
        await supabaseAdmin
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("id", orderId);
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
