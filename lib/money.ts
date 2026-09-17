export function calcOrderTotals(
  subtotal: number,
  taxRate: number,
  tipRate: number
) {
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const tip = Math.round(subtotal * tipRate * 100) / 100;
  const total = Math.round((subtotal + tax + tip) * 100) / 100;
  return { subtotal, tax, tip, total };
}
