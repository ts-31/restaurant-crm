"use client";

import type { CartLine, CartState, ServicePacing } from "./types";

const keyFor = (tableId: string) => `cart:${tableId}`;

export function emptyCart(tableId: string, tipRate = 0.18): CartState {
  return {
    tableId,
    lines: [],
    pacing: "Together",
    chefNotes: "",
    tipRate,
  };
}

export function loadCart(tableId: string, tipRate = 0.18): CartState {
  if (typeof window === "undefined") return emptyCart(tableId, tipRate);
  try {
    const raw = localStorage.getItem(keyFor(tableId));
    if (!raw) return emptyCart(tableId, tipRate);
    const parsed = JSON.parse(raw) as CartState;
    if (parsed.tableId !== tableId) return emptyCart(tableId, tipRate);
    return { ...emptyCart(tableId, tipRate), ...parsed, tipRate: parsed.tipRate ?? tipRate };
  } catch {
    return emptyCart(tableId, tipRate);
  }
}

export function saveCart(cart: CartState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(cart.tableId), JSON.stringify(cart));
}

export function clearCart(tableId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(keyFor(tableId));
}

export function cartItemCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function upsertLine(cart: CartState, line: CartLine): CartState {
  const existing = cart.lines.find((l) => l.menuItemId === line.menuItemId);
  let lines: CartLine[];
  if (existing) {
    lines = cart.lines.map((l) =>
      l.menuItemId === line.menuItemId
        ? {
            ...l,
            quantity: l.quantity + line.quantity,
            note: line.note || l.note,
          }
        : l
    );
  } else {
    lines = [...cart.lines, line];
  }
  const next = { ...cart, lines };
  saveCart(next);
  return next;
}

export function setLineQty(cart: CartState, menuItemId: string, quantity: number): CartState {
  const lines =
    quantity <= 0
      ? cart.lines.filter((l) => l.menuItemId !== menuItemId)
      : cart.lines.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l));
  const next = { ...cart, lines };
  saveCart(next);
  return next;
}

export function setLineNote(cart: CartState, menuItemId: string, note: string): CartState {
  const lines = cart.lines.map((l) => (l.menuItemId === menuItemId ? { ...l, note } : l));
  const next = { ...cart, lines };
  saveCart(next);
  return next;
}

export function setPacing(cart: CartState, pacing: ServicePacing): CartState {
  const next = { ...cart, pacing };
  saveCart(next);
  return next;
}

export function setChefNotes(cart: CartState, chefNotes: string): CartState {
  const next = { ...cart, chefNotes };
  saveCart(next);
  return next;
}

export function setTipRate(cart: CartState, tipRate: number): CartState {
  const next = { ...cart, tipRate };
  saveCart(next);
  return next;
}
