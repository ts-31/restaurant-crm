import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 gap-10 relative overflow-hidden"
      style={{ background: "#0f0e0c" }}>
      {/* Background grain/texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Radial gold glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#C9A84C] text-[28px]">restaurant</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-headline-lg text-headline-lg text-[#C9A84C] tracking-[0.2em] uppercase"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              TableFlow
            </h1>
            <div className="savora-divider" />
            <p className="font-label-sm text-label-sm text-[#A89880] uppercase tracking-[0.15em] text-[10px] mt-1">
              Restaurant Management
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-[#131210] border border-[#C9A84C]/15 rounded-2xl p-8 flex flex-col gap-2"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)" }}>
          <h2 className="font-headline-sm text-headline-sm text-[#F5ECD7] mb-1">Admin Sign In</h2>
          <p className="font-body-sm text-body-sm text-[#A89880] mb-6">
            Access the operations dashboard to manage your restaurant.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

