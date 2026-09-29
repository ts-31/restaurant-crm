"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useInView } from "@/components/ui/useInView";
import { useTopLoader } from "@/components/ui/TopLoader";

export default function HomePage() {
  return <HomePageContent />;
}

function HomePageContent() {
  const [heroRef, heroInView] = useInView();
  const [featuresRef, featuresInView] = useInView();
  const [socialRef, socialInView] = useInView();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const { startLoading } = useTopLoader();

  // Preload dashboard route for snappier nav after auto-login
  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/t/a0000000-0000-4000-8000-000000000014");
  }, [router]);

  const handleDemoLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/demo-login", { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.error) {
        setLoginError(data.error ?? "Login failed. Please try again.");
        setLoginLoading(false);
        return;
      }
      startLoading();
      router.push("/dashboard");
    } catch {
      setLoginError("Network error. Please try again.");
      setLoginLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#0f0e0c" }}
    >
      {/* Background grain/texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Radial gold glows */}
      <div
        className="absolute inset-0 pointer-events-none animate-gradient-shift"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)",
          backgroundSize: "200% 200%",
          animationDuration: "20s",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none animate-gradient-shift"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 55%, rgba(201,168,76,0.05) 0%, transparent 70%)",
          backgroundSize: "200% 200%",
          animationDuration: "25s",
          animationDelay: "5s",
        }}
      />

      {/* Floating icons */}
      <div className="absolute top-20 left-10 text-[#C9A84C]/10 animate-float">
        <span className="material-symbols-outlined text-6xl">restaurant</span>
      </div>
      <div
        className="absolute top-40 right-20 text-[#C9A84C]/10 animate-float-delayed"
        style={{ animationDelay: "1s" }}
      >
        <span className="material-symbols-outlined text-5xl">local_dining</span>
      </div>
      <div
        className="absolute bottom-40 left-20 text-[#C9A84C]/10 animate-float"
        style={{ animationDelay: "2s" }}
      >
        <span className="material-symbols-outlined text-4xl">qr_code_2</span>
      </div>
      <div
        className="absolute bottom-60 right-10 text-[#C9A84C]/8 animate-float"
        style={{ animationDelay: "1.5s" }}
      >
        <span className="material-symbols-outlined text-4xl">menu_book</span>
      </div>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 gap-10 max-w-6xl mx-auto w-full min-h-screen">

        {/* ── Brand + Headline ── */}
        <div
          ref={heroRef}
          className={`text-center flex flex-col items-center gap-4 max-w-3xl transition-all duration-700 ${
            heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
            <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shadow-[0_4px_20px_rgba(201,168,76,0.15)]">
              <span className="material-symbols-outlined text-[#C9A84C] text-[28px]">restaurant</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 bg-[#131210]/30 backdrop-blur-sm px-5 py-2 rounded-2xl border border-[#C9A84C]/10">
              <h1
                className="text-[#C9A84C] tracking-[0.2em] uppercase text-2xl font-bold"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                TableFlow
              </h1>
              <div className="savora-divider" />
              <p className="text-[#A89880] uppercase tracking-[0.15em] text-[10px] mt-0.5">
                Restaurant Management
              </p>
            </div>
          </div>

          {/* Headline */}
          <h2
            className="text-[#F5ECD7] mt-1 animate-fade-in-up"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              animationDelay: "100ms",
            }}
          >
            Contactless QR Ordering for Modern Restaurants
          </h2>
          <p
            className="text-[#A89880] text-base max-w-2xl animate-fade-in-up"
            style={{ animationDelay: "180ms" }}
          >
            Two sides, one seamless experience. Tap a card below to explore it from either perspective.
          </p>
        </div>

        {/* ── Two-Sided Demo Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full max-w-4xl animate-fade-in-up" style={{ animationDelay: "260ms" }}>

          {/* ── LEFT: Customer View ── */}
          <div className="group relative flex flex-col rounded-3xl border border-[#C9A84C]/20 bg-[#131210] overflow-hidden hover:border-[#C9A84C]/50 hover:shadow-[0_8px_48px_rgba(201,168,76,0.18)] transition-all duration-300">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C] to-[#C9A84C]/0" />

            <div className="flex flex-col gap-5 p-7">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.12)]">
                    <span className="material-symbols-outlined text-[#C9A84C] text-[24px]">phone_iphone</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#A89880] font-medium">For Guests</p>
                    <h3
                      className="text-xl text-[#F5ECD7] font-semibold leading-tight"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Customer Experience
                    </h3>
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  No Login
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#A89880] leading-relaxed">
                See exactly what your guests experience — browse the digital menu, place a live sample order, and generate a shareable social card.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: "qr_code_scanner", label: "Scan Menu" },
                  { icon: "add_shopping_cart",  label: "Tap to Order" },
                  { icon: "share",              label: "Social Share Card" },
                  { icon: "photo_camera",       label: "Food Photo Overlay" },
                ].map((f) => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1816] border border-[#C9A84C]/15 text-[#A89880] text-[11px] font-medium"
                  >
                    <span className="material-symbols-outlined text-[#C9A84C] text-[13px]">{f.icon}</span>
                    {f.label}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                id="demo-customer-btn"
                href="/t/a0000000-0000-4000-8000-000000000014"
                className="mt-1 w-full py-3.5 rounded-2xl bg-[#C9A84C] text-[#0f0e0c] font-bold text-sm text-center shadow-[0_4px_24px_rgba(201,168,76,0.35)] hover:brightness-110 hover:shadow-[0_4px_40px_rgba(201,168,76,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                Open Guest Menu
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Kitchen / Staff View ── */}
          <div className="group relative flex flex-col rounded-3xl border border-[#C9A84C]/20 bg-[#131210] overflow-hidden hover:border-[#C9A84C]/50 hover:shadow-[0_8px_48px_rgba(201,168,76,0.18)] transition-all duration-300">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C] to-[#C9A84C]/0" />

            <div className="flex flex-col gap-5 p-7">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.12)]">
                    <span className="material-symbols-outlined text-[#C9A84C] text-[24px]">dashboard</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#A89880] font-medium">For Restaurant</p>
                    <h3
                      className="text-xl text-[#F5ECD7] font-semibold leading-tight"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Kitchen Dashboard
                    </h3>
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-[10px] font-bold uppercase tracking-wider">
                  1-Click Login
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#A89880] leading-relaxed">
                See what your staff sees — live incoming orders, brass bell alerts on every new order, table management, and full menu control.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: "receipt_long",       label: "Live Orders Feed" },
                  { icon: "notifications_active", label: "Bell on New Order" },
                  { icon: "table_restaurant",   label: "Table Management" },
                  { icon: "menu_book",           label: "Menu Editor" },
                ].map((f) => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1816] border border-[#C9A84C]/15 text-[#A89880] text-[11px] font-medium"
                  >
                    <span className="material-symbols-outlined text-[#C9A84C] text-[13px]">{f.icon}</span>
                    {f.label}
                  </span>
                ))}
              </div>

              {/* Error */}
              {loginError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {loginError}
                </p>
              )}

              {/* CTA */}
              <button
                id="demo-dashboard-btn"
                type="button"
                disabled={loginLoading}
                onClick={handleDemoLogin}
                className="mt-1 w-full py-3.5 rounded-2xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#C9A84C] font-bold text-sm hover:bg-[#C9A84C]/20 hover:shadow-[0_4px_30px_rgba(201,168,76,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loginLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin" />
                    Signing you in…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    Enter Kitchen Dashboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Feature Cards ── */}
        <div
          ref={featuresRef}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl transition-all duration-700 ${
            featuresInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {[
            {
              icon: "qr_code_scanner",
              title: "Instant Menu Access",
              description: "Guests scan QR codes to view your full digital menu instantly on their phones.",
            },
            {
              icon: "update",
              title: "Real-time Tracking",
              description: "Track orders from kitchen to table with live status updates.",
            },
            {
              icon: "dashboard",
              title: "Kitchen Dashboard",
              description: "Streamlined operations dashboard for staff to manage orders efficiently.",
            },
            {
              icon: "palette",
              title: "Custom Branding",
              description: "Match your restaurant's unique style with customizable themes and colors.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-[#131210]/80 backdrop-blur-sm border border-[#C9A84C]/15 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-[#C9A84C]/40 hover:shadow-[0_8px_30px_rgba(201,168,76,0.15)] hover:scale-105 transition-all group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center group-hover:bg-[#C9A84C]/20 transition-all">
                <span className="material-symbols-outlined text-[#C9A84C] text-[24px]">
                  {feature.icon}
                </span>
              </div>
              <h3
                className="text-[#F5ECD7] font-medium text-lg"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {feature.title}
              </h3>
              <p className="text-sm text-[#A89880] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* ── Social Proof ── */}
        <div
          ref={socialRef}
          className={`flex flex-col items-center gap-3 transition-all duration-700 ${
            socialInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 shadow-[0_4px_20px_rgba(201,168,76,0.15)]">
            <span className="material-symbols-outlined text-[#C9A84C] text-[18px] animate-pulse">verified</span>
            <span className="text-sm font-semibold text-[#C9A84C]">
              Trusted by <AnimatedCounter end={50} className="font-bold" /> restaurants
            </span>
          </div>
          <p className="text-sm text-[#A89880]/70 text-center max-w-md">
            Join forward-thinking restaurants transforming their guest experience with TableFlow.
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 px-6 py-6 border-t border-[#C9A84C]/10">
        <Link
          href="/login"
          className="text-sm text-[#A89880] hover:text-[#C9A84C] transition-colors"
        >
          Already have an account? Staff Login →
        </Link>
      </div>
    </main>
  );
}
