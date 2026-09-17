import Link from "next/link";

export default function TableNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "#0f0e0c" }}>
      <div className="max-w-sm flex flex-col items-center gap-4 bg-[#131210] p-8 rounded-3xl border border-[#C9A84C]/25 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        <div className="w-16 h-16 rounded-2xl bg-[#E86C5D]/10 border border-[#E86C5D]/30 text-[#E86C5D] flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
        </div>
        <h1 className="text-2xl font-normal text-[#F5ECD7] tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Table Not Found
        </h1>
        <p className="text-xs text-[#A89880] leading-relaxed font-light">
          This table code is inactive or does not exist. Please check the QR code on your dining table or ask your server for assistance.
        </p>
        <Link
          href="/"
          className="mt-2 px-5 py-2.5 rounded-xl bg-[#1a1816] hover:bg-[#C9A84C] hover:text-[#0f0e0c] border border-[#C9A84C]/25 text-[#C9A84C] text-xs font-semibold transition-all shadow-xs"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
