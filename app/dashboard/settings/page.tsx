import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { getStaffContext } from "@/lib/data";

export default async function SettingsPage() {
  const ctx = await getStaffContext();
  if (!ctx) redirect("/login");
  return <SettingsForm restaurant={ctx.restaurant} />;
}
