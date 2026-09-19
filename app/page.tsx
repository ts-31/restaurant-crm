"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useInView } from "@/components/ui/useInView";
import QRCode from "qrcode";

export default function HomePage() {
  return <HomePageContent />;
}

function HomePageContent() {
  const router = useRouter();
  const [heroRef, heroInView] = useInView();
  const [featuresRef, featuresInView] = useInView();
  const [socialRef, socialInView] = useInView();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const generateQR = async () => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const demoUrl = `${appUrl}/t/a0000000-0000-4000-8000-000000000014`;
      const qrDataUrl = await QRCode.toDataURL(demoUrl, {
        width: 200,
        margin: 0,
        color: {
          dark: "#C9A84C",
          light: "#0a0908"
        }
      });
      setQrCodeUrl(qrDataUrl);
    };
    generateQR();
  }, []);

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#0f0e0c" }}>
      {/* Background grain/texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Radial gold glows */}
      <div className="absolute inset-0 pointer-events-none animate-gradient-shift"
        style={{ 
          background: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)",
          backgroundSize: "200% 200%",
          animationDuration: "20s"
        }} />
      <div className="absolute inset-0 pointer-events-none animate-gradient-shift"
        style={{ 
          background: "radial-gradient(ellipse 50% 50% at 50% 55%, rgba(201,168,76,0.05) 0%, transparent 70%)",
          backgroundSize: "200% 200%",
          animationDuration: "25s",
          animationDelay: "5s"
        }} />
      <div className="absolute inset-0 pointer-events-none animate-gradient-shift"
        style={{ 
          background: "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(201,168,76,0.08) 0%, transparent 60%)",
          backgroundSize: "200% 200%",
          animationDuration: "30s",
          animationDelay: "10s"
        }} />

      {/* Floating icons */}
      <div className="absolute top-20 left-10 text-[#C9A84C]/10 animate-float">
        <span className="material-symbols-outlined text-6xl">restaurant</span>
      </div>
      <div className="absolute top-40 right-20 text-[#C9A84C]/10 animate-float-delayed" style={{ animationDelay: "1s" }}>
        <span className="material-symbols-outlined text-5xl">local_dining</span>
      </div>
      <div className="absolute bottom-40 left-20 text-[#C9A84C]/10 animate-float" style={{ animationDelay: "2s" }}>
        <span className="material-symbols-outlined text-4xl">qr_code_2</span>
      </div>
      <div className="absolute top-60 right-40 text-[#C9A84C]/8 animate-float-delayed" style={{ animationDelay: "3s" }}>
        <span className="material-symbols-outlined text-3xl">set_meal</span>
      </div>
      <div className="absolute bottom-60 right-10 text-[#C9A84C]/8 animate-float" style={{ animationDelay: "1.5s" }}>
        <span className="material-symbols-outlined text-4xl">menu_book</span>
      </div>
      <div className="absolute top-80 left-40 text-[#C9A84C]/6 animate-float-delayed" style={{ animationDelay: "2.5s" }}>
        <span className="material-symbols-outlined text-3xl">wine_bar</span>
      </div>
      <div className="absolute bottom-20 left-60 text-[#C9A84C]/8 animate-float" style={{ animationDelay: "0.5s" }}>
        <span className="material-symbols-outlined text-2xl">coffee</span>
      </div>
      <div className="absolute top-32 right-60 text-[#C9A84C]/6 animate-float-delayed" style={{ animationDelay: "3.5s" }}>
        <span className="material-symbols-outlined text-2xl">cake</span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8 gap-8 max-w-6xl mx-auto w-full min-h-screen">
        {/* Hero Section */}
        <div ref={heroRef} className={`text-center flex flex-col items-center gap-4 max-w-3xl transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
            <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center backdrop-blur-sm shadow-[0_4px_20px_rgba(201,168,76,0.15)]">
              <span className="material-symbols-outlined text-[#C9A84C] text-[28px]">restaurant</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 bg-[#131210]/30 backdrop-blur-sm px-5 py-2 rounded-2xl border border-[#C9A84C]/10">
              <h1 className="font-headline-lg text-headline-lg text-[#C9A84C] tracking-[0.2em] uppercase"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                TableFlow
              </h1>
              <div className="savora-divider" />
              <p className="font-label-sm text-label-sm text-[#A89880] uppercase tracking-[0.15em] text-[10px] mt-0.5">
                Restaurant Management
              </p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="font-display text-display text-[#F5ECD7] mt-2 animate-shimmer-gold animate-fade-in-up"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", animationDelay: "100ms" }}>
            Contactless QR Ordering for Modern Restaurants
          </h2>

          {/* Subheadline */}
          <p className="font-body-md text-body-md text-[#A89880] mt-2 max-w-2xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            Increase table turnover, reduce errors, and delight guests with a seamless digital ordering experience.
          </p>

          {/* Animated QR Visualization */}
          <div className="relative w-28 h-28 mt-3 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-2xl border-2 border-[#C9A84C]/30 animate-pulse-ring" style={{ animationDelay: "0s" }} />
            <div className="absolute inset-0 rounded-2xl border-2 border-[#C9A84C]/20 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
            
            {/* Glassmorphism card */}
            <div className="absolute inset-0 bg-[#131210]/60 backdrop-blur-md rounded-2xl border border-[#C9A84C]/30 shadow-[0_8px_32px_rgba(201,168,76,0.2)] overflow-hidden">
              {/* QR Code */}
              <div className="absolute inset-3 bg-[#0a0908] rounded-xl flex items-center justify-center p-1">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-[#C9A84C]/20 animate-pulse" />
                )}
              </div>
              
              {/* Laser scan line with glow */}
              <div className="absolute inset-3 rounded-xl overflow-hidden pointer-events-none">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent shadow-[0_0_10px_#C9A84C,0_0_20px_#C9A84C] animate-laser-scan" />
              </div>
              
              {/* Gold glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-3 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Link
              href="/t/a0000000-0000-4000-8000-000000000014"
              className="px-6 py-3 rounded-xl bg-[#C9A84C] text-[#0f0e0c] font-label-lg text-label-lg font-bold shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:brightness-110 hover:shadow-[0_4px_40px_rgba(201,168,76,0.5),0_0_60px_rgba(201,168,76,0.3)] active:scale-[0.98] transition-all flex items-center gap-2 animate-glow-pulse"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Try Demo
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-[#131210] text-[#F5ECD7] font-label-lg text-label-lg border border-[#C9A84C]/30 hover:bg-[#1a1816] hover:border-[#C9A84C]/50 hover:shadow-[0_4px_20px_rgba(201,168,76,0.2)] transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              Book a Demo
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div ref={featuresRef} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mt-12 transition-all duration-700 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            {
              icon: "qr_code_scanner",
              title: "Instant Menu Access",
              description: "Guests scan QR codes to view your full digital menu instantly on their phones."
            },
            {
              icon: "update",
              title: "Real-time Tracking",
              description: "Track orders from kitchen to table with live status updates."
            },
            {
              icon: "dashboard",
              title: "Kitchen Dashboard",
              description: "Streamlined operations dashboard for staff to manage orders efficiently."
            },
            {
              icon: "palette",
              title: "Custom Branding",
              description: "Match your restaurant's unique style with customizable themes and colors."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-[#131210]/80 backdrop-blur-sm border border-[#C9A84C]/15 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-[#C9A84C]/40 hover:shadow-[0_8px_30px_rgba(201,168,76,0.15)] hover:scale-105 transition-all group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center group-hover:bg-[#C9A84C]/20 group-hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all">
                <span className="material-symbols-outlined text-[#C9A84C] text-[24px] group-hover:animate-pulse">{feature.icon}</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-[#F5ECD7] font-medium"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {feature.title}
              </h3>
              <p className="font-body-sm text-body-sm text-[#A89880] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div ref={socialRef} className={`flex flex-col items-center gap-4 mt-8 transition-all duration-700 ${socialInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 backdrop-blur-sm shadow-[0_4px_20px_rgba(201,168,76,0.15)]">
            <span className="material-symbols-outlined text-[#C9A84C] text-[18px] animate-pulse">verified</span>
            <span className="text-sm font-semibold text-[#C9A84C]">Trusted by <AnimatedCounter end={50} className="font-bold" /> restaurants</span>
          </div>
          <p className="font-body-sm text-body-sm text-[#A89880]/70 text-center max-w-md">
            Join forward-thinking restaurants transforming their guest experience with TableFlow.
          </p>
        </div>
      </div>

      {/* Footer Links */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 px-6 py-8 border-t border-[#C9A84C]/10">
        <Link
          href="/login"
          className="text-sm text-[#A89880] hover:text-[#C9A84C] transition-colors"
        >
          Staff Login
        </Link>
        <span className="text-[#C9A84C]/30 hidden sm:block">•</span>
        <Link
          href="/t/a0000000-0000-4000-8000-000000000014"
          className="text-sm text-[#A89880] hover:text-[#C9A84C] transition-colors"
        >
          Demo Table 14 Menu
        </Link>
      </div>
    </main>
  );
}
