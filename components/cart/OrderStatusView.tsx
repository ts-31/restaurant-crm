"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

const STATUS_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: "new", label: "Received", icon: "check_circle" },
  { status: "preparing", label: "Cooking", icon: "skillet" },
  { status: "ready", label: "Ready", icon: "room_service" },
  { status: "served", label: "Delivered", icon: "done_all" },
];

type Props = {
  tableId: string;
  tableLabel: string;
  initialOrder: Order;
  initialItems: OrderItem[];
  currency?: string;
};

export function OrderStatusView({
  tableId,
  tableLabel,
  initialOrder,
  initialItems,
  currency = "EUR",
}: Props) {
  const [order, setOrder] = useState(initialOrder);
  const [items] = useState(initialItems);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="min-h-screen bg-surface pt-16 px-4 pb-16">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl h-16 px-4 flex items-center justify-between max-w-2xl mx-auto w-full border-b border-outline-variant/30">
        <Link
          href={`/t/${tableId}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-on-surface hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back_ios_new</span>
          <span>Back to Menu</span>
        </Link>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/30">
          {tableLabel}
        </span>
      </header>

      <div className="max-w-xl mx-auto flex flex-col gap-5 mt-6">
        {/* Success Confirmation Card */}
        <section className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/30 shadow-xs flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-on-surface">Order Placed!</h1>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
              Thank you! Your order was transmitted directly to the kitchen station.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 font-bold font-mono text-sm text-on-surface">
              {order.order_number}
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface">
              {tableLabel}
            </div>
          </div>

          {/* Real-time Order Progress Stepper */}
          <div className="w-full pt-4 mt-2 border-t border-outline-variant/20">
            <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Kitchen Status: <span className="text-primary font-bold">{order.status.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = order.status === step.status;
                return (
                  <div key={step.status} className="flex flex-col items-center gap-1.5 text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? "bg-primary text-white shadow-xs ring-4 ring-primary/20 scale-105"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-surface-container text-on-surface-variant/40"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold leading-tight ${
                        isCurrent ? "text-primary font-bold" : isPassed ? "text-on-surface" : "text-on-surface-variant/50"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dishes Ordered */}
        <section className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 shadow-xs flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            Order Summary ({items.length} dishes)
          </h2>
          <div className="flex flex-col divide-y divide-outline-variant/20">
            {items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-sm font-semibold text-on-surface truncate">
                    {item.quantity}x {item.name_snapshot}
                  </span>
                  {item.note && (
                    <span className="text-[11px] text-primary italic font-medium">
                      Note: &ldquo;{item.note}&rdquo;
                    </span>
                  )}
                </div>
                <span className="text-sm font-mono font-semibold text-on-surface shrink-0">
                  {formatMoney(Number(item.price_snapshot) * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Bill Summary */}
        <section className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 shadow-xs flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-on-surface-variant">
            <span>Subtotal</span>
            <span>{formatMoney(Number(order.subtotal), currency)}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Tax</span>
            <span>{formatMoney(Number(order.tax), currency)}</span>
          </div>
          {Number(order.tip) > 0 && (
            <div className="flex justify-between text-secondary font-medium">
              <span>Tip</span>
              <span>{formatMoney(Number(order.tip), currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-on-surface pt-2 border-t border-outline-variant/30">
            <span>Total</span>
            <span className="text-primary font-mono">{formatMoney(Number(order.total), currency)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant pt-1">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>Pay directly at your table at conclusion of dining</span>
          </div>
        </section>

        {/* Action button */}
        <Link
          href={`/t/${tableId}`}
          className="w-full py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-center font-semibold text-sm transition-colors shadow-xs"
        >
          Add More Dishes to This Table
        </Link>
      </div>
    </div>
  );
}
