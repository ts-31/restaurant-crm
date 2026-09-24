"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { createClient } from "@/lib/supabase/client";
import { updateOrderStatus } from "@/lib/actions";
import type { MenuItem, OrderWithItems } from "@/lib/types";
import { formatMoney, timeAgo } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type Props = {
  restaurantId: string;
  initialOrders: OrderWithItems[];
  menuItems?: MenuItem[];
  seatedCount?: number;
  tableCount?: number;
};

export function LiveOrdersBoard({
  restaurantId,
  initialOrders,
  menuItems = [],
}: Props) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [currentTime, setCurrentTime] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showServed, setShowServed] = useState(false);

  const { toast } = useToast();
  const knownIds = useRef(new Set(initialOrders.map((o) => o.id)));
  const [ordersGridRef] = useAutoAnimate({ duration: 450, easing: "ease-out" });

  const imageMap = useMemo(() => {
    const map = new Map<string, string>();
    menuItems.forEach((m) => {
      if (m.image_url) map.set(m.id, m.image_url);
    });
    return map;
  }, [menuItems]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*), tables(label, section)")
      .eq("restaurant_id", restaurantId)
      .in("status", ["new", "preparing", "ready", "served"])
      .order("placed_at", { ascending: false })
      .limit(40);

    if (data) {
      setOrders(data as OrderWithItems[]);
      data.forEach((o) => knownIds.current.add(o.id));
    }
  }, [restaurantId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`live-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          if (!knownIds.current.has(payload.new.id)) {
            knownIds.current.add(payload.new.id);
            await refetch();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => refetch()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, refetch]);

  const handleMarkServed = async (orderId: string, tableLabel: string) => {
    try {
      setProcessingId(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "served" } : o))
      );
      await updateOrderStatus(orderId, "served");
      toast(`Order for ${tableLabel} marked as Served`, "success");
    } catch {
      toast("Failed to update order status", "error");
      await refetch();
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelOrder = async (orderId: string, tableLabel: string) => {
    try {
      setCancellingId(orderId);
      await updateOrderStatus(orderId, "cancelled");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast(`Order for ${tableLabel} cancelled`, "info");
    } catch {
      toast("Failed to cancel order", "error");
      await refetch();
    } finally {
      setCancellingId(null);
    }
  };

  const activeOrders = orders.filter((o) => o.status !== "served" && o.status !== "cancelled");
  const servedOrders = orders.filter((o) => o.status === "served");
  const displayedOrders = showServed
    ? orders.filter((o) => o.status !== "cancelled")
    : activeOrders;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">


      {/* ─── Control Bar ─────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#131210] border border-[#C9A84C]/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">soup_kitchen</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-xl sm:text-2xl font-normal text-[#F5ECD7] tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Live Orders Feed
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-[#A89880] mt-0.5">
              Instant alerts for table orders. Real-time kitchen dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-[#1a1816] border border-[#C9A84C]/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-ping" />
            <span className="text-xs font-bold text-[#F5ECD7]">
              {activeOrders.length} {activeOrders.length === 1 ? "Active Order" : "Active Orders"}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#1a1816] border border-[#C9A84C]/15 font-mono text-xs text-[#C9A84C] font-semibold hidden md:inline-block">
            {currentTime}
          </div>


          {servedOrders.length > 0 && (
            <button
              type="button"
              onClick={() => setShowServed((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-[#1a1816] hover:bg-[#221e1b] border border-[#C9A84C]/20 text-xs font-medium text-[#A89880] hover:text-[#F5ECD7] transition-colors"
            >
              {showServed ? "Hide Served" : `Show Served (${servedOrders.length})`}
            </button>
          )}
        </div>
      </header>

      {/* ─── Orders Grid ─────────────────────────────────────────── */}
      {displayedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 rounded-3xl bg-[#131210] border border-[#C9A84C]/15 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#C9A84C] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px]">room_service</span>
          </div>
          <h2 className="text-2xl font-normal text-[#F5ECD7] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            All Tables Are Served
          </h2>
          <p className="text-xs text-[#A89880] max-w-sm leading-relaxed">
            No pending orders. When a guest places an order it will appear here instantly.
          </p>
        </div>
      ) : (
        <div ref={ordersGridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayedOrders.map((order) => {
            const tableLabel = order.tables?.label || "Table";
            const section = order.tables?.section;
            const isServed = order.status === "served";
            const isProcessing = processingId === order.id;
            const isCancelling = cancellingId === order.id;
            const isBusy = isProcessing || isCancelling;
            const orderAgeMs = Date.now() - new Date(order.placed_at).getTime();
            const isRecent = orderAgeMs < 3 * 60 * 1000 && !isServed;

            const items = order.order_items ?? [];
            const [heroItem, ...restItems] = items;

            const getPhoto = (item: typeof heroItem) =>
              item?.image_url ||
              (item?.menu_item_id ? imageMap.get(item.menu_item_id) : undefined);

            const heroPhoto = getPhoto(heroItem);

            return (
              <article
                key={order.id}
                className={`relative flex flex-col h-[520px] rounded-2xl overflow-hidden transition-all duration-300 ${
                  isServed
                    ? "opacity-50 border border-[#C9A84C]/10"
                    : isRecent
                    ? "border-2 border-[#C9A84C] shadow-[0_0_40px_rgba(201,168,76,0.22)]"
                    : "border border-[#C9A84C]/25 shadow-[0_4px_32px_rgba(0,0,0,0.55)] hover:border-[#C9A84C]/45"
                }`}
                style={{ background: isServed ? "#0f0e0c" : isRecent ? "#16140f" : "#131210" }}
              >
                {/* ── Hero Food Photo ── */}
                <div className="relative w-full h-44 bg-[#0c0b09] shrink-0">
                  {heroPhoto ? (
                    <Image
                      src={heroPhoto}
                      alt={heroItem?.name_snapshot ?? "dish"}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 380px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#C9A84C]/20">
                      <span className="material-symbols-outlined text-[56px]">restaurant</span>
                    </div>
                  )}

                  {/* Gradient overlay so text is readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0c] via-[#0f0e0c]/30 to-transparent" />

                  {/* Table badge — sits over the photo */}
                  <div className="absolute top-3 left-4 right-4 flex items-start justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-white tracking-widest uppercase font-mono drop-shadow-lg leading-none">
                          {tableLabel}
                        </span>
                        {isRecent && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#C9A84C] text-[#0f0e0c] text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg">
                            NEW
                          </span>
                        )}
                        {isServed && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/80 text-white text-[10px] font-bold uppercase tracking-wider">
                            Served
                          </span>
                        )}
                      </div>
                      {section && (
                        <span className="text-[11px] text-white/60 mt-0.5 drop-shadow">{section}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#C9A84C] font-mono drop-shadow bg-[#0f0e0c]/60 px-2 py-1 rounded-lg">
                      {timeAgo(order.placed_at)}
                    </span>
                  </div>

                  {/* Hero dish name — bottom of photo */}
                  {heroItem && (
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-white leading-snug drop-shadow-md">
                          {heroItem.name_snapshot}
                        </span>
                        <span className="text-xs text-white/60 font-mono drop-shadow">
                          {formatMoney(Number(heroItem.price_snapshot) * heroItem.quantity)}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[#C9A84C] text-[#0a0908] font-black text-sm font-mono shrink-0 shadow-lg">
                        {heroItem.quantity}×
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Middle Body: Items or Order Details (Scrollable) ── */}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
                  {restItems.length > 0 ? (
                    restItems.map((item) => {
                      const photo = getPhoto(item);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0c0b09] border border-[#C9A84C]/10 shrink-0"
                        >
                          {/* Small thumbnail */}
                          {photo ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#C9A84C]/15 bg-[#1a1816]">
                              <Image
                                src={photo}
                                alt={item.name_snapshot}
                                fill
                                unoptimized
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg shrink-0 border border-[#C9A84C]/10 bg-[#1a1816] flex items-center justify-center text-[#C9A84C]/30">
                              <span className="material-symbols-outlined text-[18px]">restaurant</span>
                            </div>
                          )}
                          <span className="flex-1 text-sm text-[#F5ECD7] font-medium leading-tight">
                            {item.name_snapshot}
                            {item.note && (
                              <span className="block text-[11px] text-[#C9A84C] italic">↳ {item.note}</span>
                            )}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-[#A89880] font-mono">
                              {formatMoney(Number(item.price_snapshot) * item.quantity)}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#C9A84C] text-[#0a0908] font-black text-xs font-mono">
                              {item.quantity}×
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Single-dish orders: High-end ticket specs to fill card intentionally */
                    <div className="h-full flex flex-col justify-between p-3.5 rounded-xl bg-[#0c0b09]/80 border border-[#C9A84C]/15">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wider text-[#A89880] font-mono font-medium">
                            Ticket Ref
                          </span>
                          <span className="text-xs font-mono font-bold text-[#C9A84C]">
                            #{order.order_number || order.id.slice(0, 6).toUpperCase()}
                          </span>
                        </div>
                        <div className="h-px bg-[#C9A84C]/10" />
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wider text-[#A89880] font-mono font-medium">
                            Table Location
                          </span>
                          <span className="text-xs text-[#F5ECD7] font-medium">
                            {section ? `${section} · ${tableLabel}` : tableLabel}
                          </span>
                        </div>
                        <div className="h-px bg-[#C9A84C]/10" />
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wider text-[#A89880] font-mono font-medium">
                            Kitchen Status
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#C9A84C] text-[10px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
                            Direct Dispatch
                          </span>
                        </div>
                      </div>

                      {heroItem?.note ? (
                        <div className="mt-2 p-2 rounded-lg bg-[#3D2E0A]/40 border border-[#C9A84C]/20 text-[11px] text-[#F5ECD7]">
                          <span className="text-[#C9A84C] font-bold">Guest Request: </span>{heroItem.note}
                        </div>
                      ) : (
                        <div className="mt-2 text-[11px] text-[#A89880]/70 italic flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-[#C9A84C]/60">verified</span>
                          Single course order · Verified table ticket
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Chef notes ── */}
                  {order.chef_notes && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#3D2E0A]/60 border border-[#C9A84C]/25 text-xs shrink-0">
                      <span className="material-symbols-outlined text-[#C9A84C] text-[15px] shrink-0 mt-0.5">speaker_notes</span>
                      <p className="text-[#F5ECD7] font-medium leading-snug">
                        <span className="text-[#C9A84C] font-bold">Note: </span>{order.chef_notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Footer: Total + Actions (Pinned to bottom) ── */}
                <div className="px-4 pb-4 pt-3 flex flex-col gap-3 shrink-0 border-t border-[#C9A84C]/15 bg-[#131210]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#A89880]">Total Bill</span>
                    <span className="text-lg font-black text-[#C9A84C] font-mono">
                      {formatMoney(Number(order.total))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isServed ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleMarkServed(order.id, tableLabel)}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#C9A84C] text-[#0f0e0c] font-bold text-sm shadow-[0_4px_20px_rgba(201,168,76,0.35)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <span className="w-4 h-4 border-2 border-[#0f0e0c]/40 border-t-[#0f0e0c] rounded-full animate-spin" />
                            <span>Updating…</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            <span>Mark as Served</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold text-sm text-center flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                        <span>Completed & Served</span>
                      </div>
                    )}
                    {!isServed && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleCancelOrder(order.id, tableLabel)}
                        title="Cancel Order"
                        className="p-3.5 rounded-xl bg-[#1a1816] hover:bg-[#E86C5D]/15 text-[#A89880] hover:text-[#E86C5D] border border-[#C9A84C]/15 hover:border-[#E86C5D]/30 transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center"
                      >
                        {isCancelling ? (
                          <span className="w-5 h-5 border-2 border-[#E86C5D]/40 border-t-[#E86C5D] rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}


    </div>
  );
}
