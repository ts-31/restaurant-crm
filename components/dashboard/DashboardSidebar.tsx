"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const NAV = [
  { href: "/dashboard", label: "Live Orders", icon: "table_restaurant" },
  { href: "/dashboard/orders", label: "Orders History", icon: "receipt_long" },
  { href: "/dashboard/menu", label: "Menu Management", icon: "restaurant_menu" },
  { href: "/dashboard/tables", label: "Table QR Codes", icon: "qr_code_2" },
  { href: "/dashboard/settings", label: "Settings", icon: "tune" },
];

export function DashboardSidebar({
  restaurantName,
  staffName,
  newCount,
  logoUrl,
}: {
  restaurantName: string;
  staffName: string;
  newCount: number;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a0908] z-50 flex flex-col justify-between py-6 px-4 shadow-[1px_0_0_rgba(201,168,76,0.15)] hidden md:flex border-r border-[#C9A84C]/10">
      {/* Logo / Brand */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          {logoUrl ? (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#1a1816] border border-[#C9A84C]/30 shrink-0">
              <Image src={logoUrl} alt={restaurantName} fill sizes="40px" className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] flex items-center justify-center font-headline-sm font-bold shrink-0 text-lg">
              {restaurantName ? restaurantName[0].toUpperCase() : "R"}
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-headline-sm text-headline-sm text-[#F5ECD7] leading-tight truncate tracking-wide">
              {restaurantName}
            </span>
            <span className="font-label-sm text-label-sm text-[#C9A84C] uppercase tracking-[0.12em] text-[10px]">
              Admin Console
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent mx-2" />

        {/* Kitchen Status */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#1a1816] rounded-lg border border-[#C9A84C]/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-label-sm text-label-sm text-[#A89880] text-[11px]">Kitchen Online</span>
          </div>
          {newCount > 0 && (
            <span className="font-label-sm text-label-sm text-[#0a0908] bg-[#C9A84C] px-2 py-0.5 rounded-full font-bold text-[10px] shadow-sm">
              {newCount} New
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm relative",
                  active
                    ? "bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20"
                    : "text-[#A89880] hover:bg-[#1a1816] hover:text-[#F5ECD7] border border-transparent"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C9A84C] rounded-r-full" />
                )}
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
                {item.href === "/dashboard" && newCount > 0 && !active && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#C9A84C]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Card */}
      <div className="p-3 bg-[#1a1816] rounded-xl flex flex-col gap-3 border border-[#C9A84C]/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-md text-label-md text-[#F5ECD7] truncate font-medium">
              {staffName || "Staff"}
            </span>
            <span className="font-label-sm text-label-sm text-[#C9A84C] truncate text-[10px] uppercase tracking-wider">
              Restaurant Lead
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowSignOutConfirm(true)}
          className="w-full py-2 px-3 rounded-lg bg-[#E86C5D]/10 hover:bg-[#E86C5D]/20 border border-[#E86C5D]/20 text-[#E86C5D] font-label-sm text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">logout</span>
          Sign Out
        </button>
      </div>


      <ConfirmDialog
        open={showSignOutConfirm}
        title="Sign out of SAVORA?"
        description="Are you sure you want to sign out of the admin console? You will need to log back in to manage your restaurant."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        danger
        loading={signingOut}
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />
    </aside>
  );
}

export function MobileDashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0a0908]/95 backdrop-blur-xl border-t border-[#C9A84C]/15 flex justify-around py-2 pb-safe shadow-lg">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 min-w-[56px] transition-colors",
              active ? "text-[#C9A84C]" : "text-[#A89880]"
            )}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="font-label-sm text-[10px] leading-tight">
              {item.label === "Live Orders" ? "Orders" : item.label === "Orders History" ? "History" : item.label === "Menu Management" ? "Menu" : item.label === "Table QR Codes" ? "Tables" : "Settings"}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

