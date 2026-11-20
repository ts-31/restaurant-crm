"use client";

import Link from "next/link";
import Image from "next/image";
import type { MenuItem, CartLine } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { upsertLine, loadCart, cartItemCount, cartSubtotal, saveCart } from "@/lib/cart";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";
import { RestaurantMapCard } from "@/components/ui/RestaurantMapCard";

type Props = {
  tableId: string;
  tableLabel: string;
  section: string | null;
  restaurantName: string;
  logoUrl?: string | null;
  accentColor?: string | null;
  currency?: string;
  categories: { id: string; name: string }[];
  items: MenuItem[];
  defaultTipRate: number;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export function GuestMenu({
  tableId,
  tableLabel,
  restaurantName,
  accentColor,
  currency = "EUR",
  categories,
  items,
  defaultTipRate,
  address,
  latitude,
  longitude,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [categoryId, setCategoryId] = useState<string | "all">("all");
  const [count, setCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);

  // Detail Sheet state
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemNote, setItemNote] = useState("");

  const { toast } = useToast();

  const refreshCart = useCallback(() => {
    const cart = loadCart(tableId, defaultTipRate);
    setCartLines(cart.lines);
    setCount(cartItemCount(cart.lines));
    setSubtotal(cartSubtotal(cart.lines));
  }, [tableId, defaultTipRate]);

  useEffect(() => {
    setMounted(true);
    refreshCart();
  }, [refreshCart]);

  // Clean category filtering
  const filtered = useMemo(() => {
    if (categoryId === "all") return items;
    return items.filter((item) => item.category_id === categoryId);
  }, [items, categoryId]);

  function openDetail(item: MenuItem) {
    const cart = loadCart(tableId, defaultTipRate);
    const existing = cart.lines.find((l) => l.menuItemId === item.id);
    setActiveItem(item);
    setItemQty(existing ? existing.quantity : 1);
    setItemNote(existing ? existing.note || "" : "");
  }

  function handleAddFromDetail() {
    if (!activeItem) return;
    const cart = loadCart(tableId, defaultTipRate);
    upsertLine(cart, {
      menuItemId: activeItem.id,
      name: activeItem.name,
      price: Number(activeItem.price),
      quantity: itemQty,
      note: itemNote.trim(),
      imageUrl: activeItem.image_url,
      description: activeItem.description,
    });
    refreshCart();
    toast(`Added ${itemQty}× ${activeItem.name}`, "success");
    setActiveItem(null);
  }

  function quickAdd(item: MenuItem, e?: React.MouseEvent) {
    e?.stopPropagation();
    const cart = loadCart(tableId, defaultTipRate);
    upsertLine(cart, {
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
      note: "",
      imageUrl: item.image_url,
      description: item.description,
    });
    refreshCart();
    toast(`Added ${item.name}`, "success");
  }

  function bumpQty(item: MenuItem, delta: number, e?: React.MouseEvent) {
    e?.stopPropagation();
    const cart = loadCart(tableId, defaultTipRate);
    const existing = cart.lines.find((l) => l.menuItemId === item.id);
    const nextQty = (existing?.quantity ?? 0) + delta;
    if (!existing && delta > 0) {
      quickAdd(item);
      return;
    }
    if (!existing) return;
    const lines =
      nextQty <= 0
        ? cart.lines.filter((l) => l.menuItemId !== item.id)
        : cart.lines.map((l) => (l.menuItemId === item.id ? { ...l, quantity: nextQty } : l));
    saveCart({ ...cart, lines });
    refreshCart();
  }

  function lineQty(id: string) {
    if (!mounted) return 0;
    return cartLines.find((l) => l.menuItemId === id)?.quantity ?? 0;
  }

  return (
    <div
      className="flex flex-col relative w-full min-h-screen"
      style={{
        "--color-accent": accentColor || "#C9A84C",
        background: "#0a0908",
        color: "#F5ECD7",
      } as React.CSSProperties}
    >
      {/* ─── Ultra-Clean Fixed Top Bar ───────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0a0908]/95 backdrop-blur-xl border-b border-[#C9A84C]/15 pt-safe shadow-[0_1px_0_rgba(201,168,76,0.1)]">
        <div className="h-14 px-4 flex items-center justify-between max-w-xl mx-auto w-full">
          <span
            className="text-lg font-normal text-[#F5ECD7] tracking-wider truncate"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {restaurantName || "Maison Aurelia"}
          </span>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161412] border border-[#C9A84C]/30 text-[#C9A84C] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            <span className="text-xs font-semibold tracking-wide font-mono">{tableLabel}</span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-4 pb-2.5 max-w-xl mx-auto w-full">
          <button
            type="button"
            onClick={() => setCategoryId("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
              categoryId === "all"
                ? "bg-[#C9A84C] text-[#0a0908] font-bold shadow-[0_2px_10px_rgba(201,168,76,0.3)]"
                : "bg-[#161412] text-[#A89880] border border-[#C9A84C]/15 hover:text-[#F5ECD7]"
            }`}
          >
            All Dishes
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                categoryId === c.id
                  ? "bg-[#C9A84C] text-[#0a0908] font-bold shadow-[0_2px_10px_rgba(201,168,76,0.3)]"
                  : "bg-[#161412] text-[#A89880] border border-[#C9A84C]/15 hover:text-[#F5ECD7]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </nav>
      </header>

      {/* ─── 2-Column Luxury Dishes Grid ───────────────────────────── */}
      <main className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-xl mx-auto px-3.5 sm:px-4 pt-28 pb-32">
        {filtered.map((item) => {
          const qty = lineQty(item.id);
          const isSelected = qty > 0;

          return (
            <article
              key={item.id}
              onClick={() => openDetail(item)}
              className={`flex flex-col p-2.5 sm:p-3 bg-[#141210] rounded-2xl border transition-all cursor-pointer group relative select-none ${
                isSelected
                  ? "border-[#C9A84C] shadow-[0_0_18px_rgba(201,168,76,0.18)] ring-1 ring-[#C9A84C]/50"
                  : "border-[#C9A84C]/15 hover:border-[#C9A84C]/40 hover:shadow-md"
              }`}
            >
              {/* Large Top Photo (Aspect 4:3) */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#1a1816] border border-[#C9A84C]/15 shrink-0">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, 260px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#C9A84C]/30">
                    <span className="material-symbols-outlined text-3xl">restaurant</span>
                  </div>
                )}

                {/* Top-Left: Signature / Badge */}
                {(item.is_signature || item.badge) && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-[#0a0908]/85 backdrop-blur-md border border-[#C9A84C]/40 text-[#C9A84C] text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {item.badge || "Signature"}
                    </span>
                  </div>
                )}

                {/* Top-Right: Selected Checkmark Badge (matching reference screenshot) */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#C9A84C] text-[#0a0908] flex items-center justify-center font-black text-xs shadow-[0_2px_8px_rgba(0,0,0,0.6)] animate-scale-in">
                    ✓
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 mt-2.5 min-w-0">
                <h3
                  className="text-xs sm:text-sm font-medium text-[#F5ECD7] group-hover:text-[#C9A84C] transition-colors leading-snug line-clamp-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {item.name}
                </h3>

                {item.subtitle && (
                  <p className="text-[10px] text-[#A89880]/70 italic mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                )}

                {/* Bottom Row: Price + Stepper / Add Button */}
                <div className="flex items-center justify-between mt-auto pt-2.5">
                  <span className="text-xs sm:text-sm font-bold text-[#C9A84C] font-mono shrink-0">
                    {formatMoney(Number(item.price), currency)}
                  </span>

                  {isSelected ? (
                    <div
                      className="flex items-center bg-[#1a1816] border border-[#C9A84C]/40 rounded-full p-0.5 gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => bumpQty(item, -1, e)}
                        className="w-6 h-6 rounded-full bg-[#0a0908] flex items-center justify-center text-[#F5ECD7] text-xs font-bold hover:text-[#C9A84C] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold px-1 text-[#F5ECD7] font-mono min-w-[14px] text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => bumpQty(item, 1, e)}
                        className="w-6 h-6 rounded-full bg-[#C9A84C] text-[#0a0908] flex items-center justify-center text-xs font-bold shadow-xs hover:brightness-110 active:scale-90 transition-all"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => quickAdd(item, e)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#C9A84C] hover:brightness-110 active:scale-90 text-[#0a0908] flex items-center justify-center font-bold text-sm shadow-[0_2px_10px_rgba(201,168,76,0.3)] transition-all shrink-0"
                      aria-label={`Add ${item.name}`}
                    >
                      <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </main>

      {/* ─── Restaurant Location & Google Maps Card ──────────────── */}
      <div className="max-w-xl mx-auto w-full px-4 mb-24">
        <RestaurantMapCard
          name={restaurantName}
          address={address}
          latitude={latitude}
          longitude={longitude}
          title="Visit Our Restaurant"
        />
      </div>

      {/* ─── Item Detail Bottom Sheet (Drawer) ───────────────────────── */}
      <Drawer
        open={!!activeItem}
        onClose={() => setActiveItem(null)}
        title={activeItem?.name || "Dish Details"}
        side="bottom"
      >
        {activeItem && (
          <div className="flex flex-col gap-4 max-w-lg mx-auto p-4 bg-[#131210]">
            {activeItem.image_url ? (
              <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-[#1a1816] border border-[#C9A84C]/20">
                <Image
                  src={activeItem.image_url}
                  alt={activeItem.name}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 500px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  className="text-xl font-normal text-[#F5ECD7]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {activeItem.name}
                </h3>
                {activeItem.is_signature && (
                  <span className="text-xs text-[#C9A84C] font-semibold tracking-wide block mt-0.5">
                    Chef&apos;s Signature
                  </span>
                )}
              </div>
              <span className="text-xl font-bold text-[#C9A84C] font-mono">
                {formatMoney(Number(activeItem.price), currency)}
              </span>
            </div>

            {activeItem.description && (
              <p className="text-sm text-[#A89880] leading-relaxed font-light">
                {activeItem.description}
              </p>
            )}

            {/* Special Instructions / Note */}
            <div>
              <label className="text-xs font-medium uppercase tracking-widest text-[#C9A84C] block mb-1.5 text-[10px]">
                Special Requests / Kitchen Note
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Extra sauce, no garlic, dressing on the side..."
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="w-full bg-[#0a0908] text-[#F5ECD7] p-3 rounded-xl border border-[#C9A84C]/20 text-xs focus:outline-none focus:border-[#C9A84C] resize-none placeholder:text-[#5A4A35]"
              />
            </div>

            {/* Quantity Stepper & Add Action */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center bg-[#0a0908] rounded-xl p-1 gap-2 border border-[#C9A84C]/25">
                <button
                  type="button"
                  onClick={() => setItemQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg bg-[#1a1816] text-[#F5ECD7] flex items-center justify-center font-bold text-sm hover:text-[#C9A84C]"
                >
                  -
                </button>
                <span className="font-bold text-sm px-2 text-[#F5ECD7]">{itemQty}</span>
                <button
                  type="button"
                  onClick={() => setItemQty((q) => q + 1)}
                  className="w-9 h-9 rounded-lg bg-[#C9A84C] text-[#0a0908] flex items-center justify-center font-bold text-sm shadow-xs hover:brightness-110"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddFromDetail}
                className="flex-1 py-3 px-5 rounded-xl bg-[#C9A84C] text-[#0a0908] text-sm font-bold shadow-[0_4px_20px_rgba(201,168,76,0.25)] flex items-center justify-between hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <span>Add to Order</span>
                <span className="font-mono">
                  {formatMoney(Number(activeItem.price) * itemQty, currency)}
                </span>
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ─── Floating Cart Pill (Only shown when count > 0) ──────────── */}
      {mounted && count > 0 && (
        <aside className="fixed bottom-6 inset-x-0 z-40 px-4 pointer-events-none flex justify-center animate-slide-in-bottom">
          <Link
            href={`/t/${tableId}/cart`}
            className="pointer-events-auto w-full max-w-sm py-3.5 px-5 rounded-2xl bg-[#C9A84C] text-[#0a0908] font-bold text-sm flex items-center justify-between shadow-[0_12px_36px_rgba(0,0,0,0.9),0_2px_12px_rgba(201,168,76,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              <span>
                {count} {count === 1 ? "dish" : "dishes"} · {formatMoney(subtotal, currency)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs uppercase tracking-wider font-extrabold">
              <span>View Cart</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </Link>
        </aside>
      )}
    </div>
  );
}
