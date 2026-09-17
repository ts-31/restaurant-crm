import { notFound } from "next/navigation";
import { resolveTableParam } from "@/lib/data";
import { CartView } from "@/components/cart/CartView";
import type { Restaurant } from "@/lib/types";

export default async function CartPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;
  const table = await resolveTableParam(tableId);
  if (!table) notFound();
  const restaurant = table.restaurants as Restaurant;

  return (
    <CartView
      tableId={table.id}
      tableLabel={table.label}
      taxRate={Number(restaurant.tax_rate)}
      defaultTipRate={Number(restaurant.default_tip_rate)}
    />
  );
}
