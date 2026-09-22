"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const [showTooltip, setShowTooltip] = useState(false);
  const isHovering = useRef(false);

  const fillDemoCredentials = () => {
    setShowTooltip(false);
    const event = new CustomEvent("fillDemoCredentials");
    window.dispatchEvent(event);
  };

  useEffect(() => {
    let showId = 0;
    let hideId = 0;

    const startTimers = () => {
      showId = window.setTimeout(() => {
        setShowTooltip(true);
      }, 1500);

      hideId = window.setTimeout(() => {
        if (!isHovering.current) {
          setShowTooltip(false);
        }
      }, 4500);
    };

    if (document.readyState === "complete") {
      startTimers();
    } else {
      window.addEventListener("load", startTimers, { once: true });
    }

    return () => {
      window.removeEventListener("load", startTimers);
      window.clearTimeout(showId);
      window.clearTimeout(hideId);
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 gap-4 relative overflow-y-auto py-6"
      style={{ background: "#0f0e0c" }}>
      {/* Background grain/texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Radial gold glows — top + centre */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 50% at 50% 55%, rgba(201,168,76,0.05) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-5">
        {/* Brand */}
        <Link href="/" className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-11 h-11 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#C9A84C] text-[24px]">restaurant</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <h1 className="font-headline-lg text-headline-lg text-[#C9A84C] tracking-[0.2em] uppercase"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              TableFlow
            </h1>
            <div className="savora-divider" />
            <p className="font-label-sm text-label-sm text-[#A89880] uppercase tracking-[0.15em] text-[10px] mt-0.5">
              Restaurant Management
            </p>
          </div>
        </Link>

        {/* Card */}
        <div className="w-full bg-[#131210] border border-[#C9A84C]/15 rounded-2xl p-6 flex flex-col gap-1 relative"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)" }}>
          <h2 className="font-headline-sm text-headline-sm text-[#F5ECD7] mb-0.5">Admin Sign In</h2>
          <p className="font-body-sm text-body-sm text-[#A89880] mb-4">
            Access the operations dashboard to manage your restaurant.
          </p>
          <LoginForm />

          {/* Circular Autofill Button — desktop only */}
          <button
            type="button"
            aria-label="Autofill demo credentials"
            onClick={fillDemoCredentials}
            onMouseEnter={(e) => {
              isHovering.current = true;
              setShowTooltip(true);
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(201,168,76,0.5)";
              e.currentTarget.style.background = "linear-gradient(135deg, #D4BC94 0%, #EDD38A 100%)";
            }}
            onMouseLeave={(e) => {
              isHovering.current = false;
              setShowTooltip(false);
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,168,76,0.4)";
              e.currentTarget.style.background = "linear-gradient(135deg, #C9A84C 0%, #D4A05A 100%)";
            }}
            className="hidden md:flex absolute -right-16 top-[58%] w-12 h-12 rounded-full items-center justify-center transition-all duration-300 hover:scale-110 animate-bounce-once"
            style={{
              background: "linear-gradient(135deg, #C9A84C 0%, #D4A05A 100%)",
              color: "#0f0e0c",
              boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
            }}
          >
            <span className="material-symbols-outlined text-[24px]">auto_fix_high</span>
            {showTooltip && (
              <div
                className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg text-xs font-label-md whitespace-nowrap animate-tooltip-rise pointer-events-none"
                style={{
                  background: "#131210",
                  color: "#F5ECD7",
                  border: "1px solid rgba(201,168,76,0.3)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
              >
                ✨ Autofill
              </div>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
