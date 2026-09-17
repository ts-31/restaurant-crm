import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveTableParam } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { GuestMenu } from "@/components/menu/GuestMenu";
import type { MenuItem, Restaurant } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tableId: string }>;
}): Promise<Metadata> {
  const { tableId } = await params;
  const table = await resolveTableParam(tableId);
  if (!table) return { title: "Table Not Found" };
  const restaurant = table.restaurants as Restaurant;

  return {
    title: `${restaurant?.name || "Restaurant"} — Menu (${table.label})`,
    description: `Browse digital menu and order contactless at ${table.label}.`,
  };
}

export default async function TableMenuPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;
  const table = await resolveTableParam(tableId);
  if (!table) notFound();

  const restaurant = table.restaurants as Restaurant;
  const supabase = await createClient();

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, sort_order")
      .eq("restaurant_id", table.restaurant_id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", table.restaurant_id)
      .eq("is_available", true)
      .order("sort_order"),
  ]);

  return (
    <GuestMenu
      tableId={table.id}
      tableLabel={table.label}
      section={table.section}
      restaurantName={restaurant.name}
      logoUrl={restaurant.logo_url}
      accentColor={restaurant.accent_color}
      currency={restaurant.currency || "EUR"}
      categories={categories ?? []}
      items={(items ?? []) as MenuItem[]}
      defaultTipRate={Number(restaurant.default_tip_rate)}
    />
  );
}
