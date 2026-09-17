import { redirect } from "next/navigation";
import { TablesManager } from "@/components/dashboard/TablesManager";
import { getStaffContext } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { DiningTable } from "@/lib/types";

export default async function TablesPage() {
  const ctx = await getStaffContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data: tables } = await supabase
    .from("tables")
    .select("*")
    .eq("restaurant_id", ctx.restaurant.id)
    .order("label");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <TablesManager
      initialTables={(tables ?? []) as DiningTable[]}
      appUrl={appUrl}
      restaurantName={ctx.restaurant.name}
    />
  );
}
