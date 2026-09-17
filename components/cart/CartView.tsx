"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  clearCart,
  loadCart,
  cartItemCount,
  cartSubtotal,
  setChefNotes,
  setLineNote,
  setLineQty,
} from "@/lib/cart";
import { calcOrderTotals } from "@/lib/money";
import { placeOrder } from "@/lib/actions";
import type { CartState } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { QtyStepper } from "@/components/ui/QtyStepper";

type Props = {
  tableId: string;
  tableLabel: string;
  taxRate: number;
  defaultTipRate: number;
};

export function CartView({ tableId, tableLabel, taxRate, defaultTipRate }: Props) {
  const router = useRouter();
  const [cart, setCart] = useState<CartState | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    setCart(loadCart(tableId, 0));
  }, [tableId]);

  const totals = useMemo(() => {
    if (!cart) return { subtotal: 0, tax: 0, tip: 0, total: 0 };
    return calcOrderTotals(cartSubtotal(cart.lines), taxRate, 0);
  }, [cart, taxRate]);

  if (!cart) {
    return <div className="min-h-screen p-8 text-on-surface-variant">Loading cart…</div>;
  }

  const itemCount = cartItemCount(cart.lines);
  const shortLabel = tableLabel.replace(/table\s*/i, "T");

  function update(next: CartState) {
    setCart(next);
  }

  async function onPlaceOrder() {
    if (!cart || cart.lines.length === 0) return;
    setPlacing(true);
    setError(null);
    const result = await placeOrder({
      tableId,
      pacing: "Together",
      chefNotes: cart.chefNotes,
      tipRate: 0,
      lines: cart.lines.map((l) => ({
        menuItemId: l.menuItemId,
        quantity: l.quantity,
        note: l.note,
      })),
    });
    setPlacing(false);
    if (result.error || !result.orderId) {
      setError(result.error ?? "Failed to place order");
      return;
    }
    clearCart(tableId);
    router.push(`/t/${tableId}/order/${result.orderId}`);
  }

  return (
    <div className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-space-md flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-space-sm">
            <Link
              href={`/t/${tableId}`}
              className="min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            </Link>
            <h1 className="font-title-md text-title-md text-on-surface tracking-tight">Active Cart</h1>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-label-sm text-label-sm">{shortLabel}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row w-full px-space-md pt-space-md pb-36 lg:pb-12 gap-space-lg max-w-7xl mx-auto">
        <div className="flex flex-col w-full lg:w-2/3 space-y-space-lg">
          <div className="flex flex-col space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Review Your Order</span>
              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm tracking-wide uppercase">
                Kitchen Live
              </span>
            </div>
            <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
              <span>{tableLabel} · Dinner Service</span>
            </div>
          </div>

          <div className="flex flex-col space-y-space-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-title-md text-title-md text-on-surface">Dishes & Drinks</h2>
              <span className="font-label-md text-label-md text-on-surface-variant">{itemCount} items selected</span>
            </div>

            {cart.lines.length === 0 && (
              <div className="bg-surface-container-low rounded-xl p-space-md text-on-surface-variant font-body-md">
                Your cart is empty. Add dishes from the menu.
              </div>
            )}

            {cart.lines.map((item) => (
              <div
                key={item.menuItemId}
                className="bg-surface-container-low rounded-xl p-space-sm shadow-sm flex flex-col space-y-space-xs"
              >
                <div className="flex gap-space-sm items-start">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-surface-container-high"
                      src={item.imageUrl}
                      alt={item.name}
                    />
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-title-md text-title-md text-on-surface truncate">{item.name}</span>
                      <span className="font-label-lg text-label-lg text-primary font-semibold flex-shrink-0">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant italic line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    {(item.note || editingNoteId === item.menuItemId) && (
                      <div className="mt-1.5">
                        {editingNoteId === item.menuItemId ? (
                          <input
                            autoFocus
                            className="w-full px-2 py-1 rounded-lg bg-surface-container-lowest font-label-sm text-label-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={item.note}
                            onChange={(e) => update(setLineNote(cart, item.menuItemId, e.target.value))}
                            onBlur={() => setEditingNoteId(null)}
                            placeholder="Kitchen note…"
                          />
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm w-fit">
                            <span className="material-symbols-outlined text-[13px] text-tertiary">edit_note</span>
                            <span className="truncate max-w-[190px]">{item.note}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingNoteId(item.menuItemId)}
                    className="text-on-surface-variant hover:text-error flex items-center gap-1 text-label-sm font-label-sm transition-colors min-h-[44px] px-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    <span>Modify Note</span>
                  </button>
                  <QtyStepper
                    value={item.quantity}
                    onChange={(q) => update(setLineQty(cart, item.menuItemId, q))}
                  />
                </div>
              </div>
            ))}

            <Link
              href={`/t/${tableId}`}
              className="w-full min-h-[48px] py-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 text-primary font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
              <span>Add More Dishes or Drinks</span>
            </Link>
          </div>

          <div className="flex flex-col space-y-space-xs">
            <div className="flex items-center justify-between">
              <label className="font-title-md text-title-md text-on-surface">Special Requests / Kitchen Notes</label>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Optional</span>
            </div>
            <textarea
              className="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-none"
              placeholder="Allergies, dietary requirements, or specific requests for the kitchen..."
              rows={2}
              value={cart.chefNotes}
              onChange={(e) => update(setChefNotes(cart, e.target.value))}
            />
          </div>
        </div>

        <div className="flex flex-col w-full lg:w-1/3 space-y-space-md">
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm space-y-space-sm sticky top-24">
            <div className="flex items-center justify-between">
              <span className="font-title-md text-title-md text-on-surface">Order Summary</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                {tableLabel}
              </span>
            </div>
            <div className="space-y-2 pt-1 font-body-md text-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="text-on-surface font-label-lg text-label-lg">{formatMoney(totals.subtotal)}</span>
              </div>
              {totals.tax > 0 && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>Local Tax ({Math.round(taxRate * 100)}%)</span>
                  <span className="text-on-surface font-label-lg text-label-lg">{formatMoney(totals.tax)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-baseline">
                <span className="font-title-lg text-title-lg text-on-surface">Total Due</span>
                <span className="font-display-mobile text-display-mobile text-primary font-bold tracking-tight">
                  {formatMoney(totals.total)}
                </span>
              </div>
            </div>
          </div>

          {error && <p className="text-error font-body-sm bg-error-container p-3 rounded-xl">{error}</p>}

          <div className="hidden lg:flex flex-col space-y-2 mt-4">
            <button
              type="button"
              disabled={placing || cart.lines.length === 0}
              onClick={onPlaceOrder}
              className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl font-label-lg text-label-lg flex items-center justify-between px-5 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
                <span>{placing ? "Sending…" : `Place Order to ${tableLabel}`}</span>
              </span>
              <span className="font-title-md text-title-md tracking-tight">{formatMoney(totals.total)}</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Sent directly to kitchen station · Pay at table</span>
            </div>
          </div>
        </div>
      </div>

      <aside className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe px-space-md pt-3">
        <div className="max-w-md mx-auto flex flex-col space-y-2 pb-3">
          <button
            type="button"
            disabled={placing || cart.lines.length === 0}
            onClick={onPlaceOrder}
            className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl font-label-lg text-label-lg flex items-center justify-between px-5 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
              <span>{placing ? "Sending…" : `Place Order to ${tableLabel}`}</span>
            </span>
            <span className="font-title-md text-title-md tracking-tight">{formatMoney(totals.total)}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
