import { redirect } from "next/navigation";
import { DashboardSidebar, MobileDashboardNav } from "@/components/dashboard/DashboardSidebar";
import { GlobalOrderAlert } from "@/components/dashboard/GlobalOrderAlert";
import { getStaffContext } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getStaffContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", ctx.restaurant.id)
    .eq("status", "new");

  const accentColor = ctx.restaurant.accent_color || "#C9A84C";

  return (
    <div
      className="min-h-screen"
      style={{ "--color-accent": accentColor, background: "#0f0e0c", color: "#F5ECD7" } as React.CSSProperties}
    >
      <DashboardSidebar
        restaurantName={ctx.restaurant.name}
        staffName={ctx.profile.full_name}
        newCount={count ?? 0}
        logoUrl={ctx.restaurant.logo_url}
      />
      <div className="md:pl-64 pb-20 md:pb-0">
        <header className="sticky top-0 h-16 bg-[#0a0908]/90 backdrop-blur-xl border-b border-[#C9A84C]/15 z-40 px-4 md:px-6 flex items-center justify-between shadow-[0_1px_0_rgba(201,168,76,0.12)]">
          <div className="flex items-center gap-3">
            <span className="font-label-lg text-label-lg font-semibold text-[#F5ECD7] tracking-wide uppercase text-xs">
              Operations Control
            </span>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1816] border border-[#C9A84C]/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-label-sm text-[10px] font-medium text-[#C9A84C] uppercase tracking-widest">
                Service Active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#C9A84C] font-mono bg-[#1a1816] px-2.5 py-1 rounded-md border border-[#C9A84C]/20 hidden sm:inline-block">
              {ctx.restaurant.currency || "EUR"}
            </span>
            <GlobalOrderAlert restaurantId={ctx.restaurant.id} />
          </div>
        </header>
        <main className="relative w-full min-h-[calc(100vh-4rem)] px-4 md:px-6 py-6" style={{ background: "#0f0e0c" }}>
          {children}
        </main>
      </div>
      <MobileDashboardNav />
    </div>
  );
}

