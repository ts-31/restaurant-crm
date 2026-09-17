import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "#0f0e0c" }}>
      <div className="max-w-md flex flex-col items-center gap-4 bg-[#131210] p-8 rounded-3xl border border-[#C9A84C]/25 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] flex items-center justify-center font-mono font-bold text-2xl">
          404
        </div>
        <h1 className="text-2xl font-normal text-[#F5ECD7] tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Page Not Found
        </h1>
        <p className="text-xs text-[#A89880] max-w-xs leading-relaxed font-light">
          The page you requested does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-2 px-6 py-2.5 rounded-xl bg-[#C9A84C] text-[#0f0e0c] text-xs font-bold shadow-[0_4px_16px_rgba(201,168,76,0.25)] hover:brightness-110 transition-all"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
