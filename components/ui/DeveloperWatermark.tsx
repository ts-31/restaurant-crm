"use client";

import { useState } from "react";

export function DeveloperWatermark() {
  const [isOpen, setIsOpen] = useState(false);

  const phone = "+918857073481";
  const displayPhone = "+91 8857073481";
  const email = "tejas2025s@gmail.com";
  const whatsappUrl = `https://wa.me/918857073481?text=${encodeURIComponent(
    "Hi Tejas, I saw your project and would like to discuss building a website / software."
  )}`;

  return (
    <div
      aria-label="Developer Attribution & Contact"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99999] flex flex-col items-end font-sans select-none"
    >
      {/* ─── Expanded Contact Card ─── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="mb-3 w-[290px] sm:w-[320px] rounded-2xl bg-[#12110e]/95 backdrop-blur-xl border border-[#C9A84C]/35 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(201,168,76,0.15)] animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {/* Card Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[#C9A84C]/15">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] px-1.5 py-0.5 rounded bg-[#C9A84C]/15 border border-[#C9A84C]/30">
                  Developer
                </span>
                <span className="text-xs text-[#A89880] flex items-center gap-1">
                  India 🇮🇳
                </span>
              </div>
              <h4 className="text-base font-semibold text-[#F5ECD7] leading-tight">
                Tejas
              </h4>
              <p className="text-[11px] text-[#A89880]/90 mt-0.5">
                Full-Stack Web &amp; App Development
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-[#1a1815] hover:bg-[#25221d] text-[#A89880] hover:text-[#F5ECD7] flex items-center justify-center transition-colors text-xs font-bold border border-[#C9A84C]/20"
              aria-label="Close contact card"
            >
              ✕
            </button>
          </div>

          {/* Contact Action Buttons */}
          <div className="flex flex-col gap-2 pt-3">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg
                className="w-4 h-4 fill-current shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.761.882 2.79.882 3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.768-5.767-5.768zm7.391 5.766c-.001 4.072-3.315 7.386-7.391 7.386-1.282 0-2.485-.328-3.535-.905l-4.52 1.184 1.207-4.412c-.675-1.112-1.033-2.392-1.033-3.253 0-4.072 3.316-7.387 7.392-7.387 4.076 0 7.39 3.315 7.39 7.387z" />
              </svg>
              <span className="flex-1">WhatsApp Chat</span>
              <span className="text-[10px] uppercase font-bold text-[#25D366]/80 bg-[#25D366]/10 px-1.5 py-0.5 rounded">
                Instant ↗
              </span>
            </a>

            {/* Direct Phone Call */}
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#C9A84C]/15 hover:bg-[#C9A84C]/25 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg
                className="w-4 h-4 fill-current shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <span className="flex-1 font-mono tracking-tight">{displayPhone}</span>
              <span className="text-[10px] uppercase font-bold text-[#C9A84C]/80 bg-[#C9A84C]/10 px-1.5 py-0.5 rounded">
                Call
              </span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}?subject=Project%20Inquiry%20via%20Portfolio/Webapp`}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#1b1916] hover:bg-[#23201c] border border-[#C9A84C]/25 text-[#F5ECD7] text-xs font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg
                className="w-4 h-4 fill-current text-[#C9A84C] shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span className="flex-1 truncate">{email}</span>
            </a>
          </div>

          {/* Card Footer */}
          <div className="mt-3 pt-2.5 border-t border-[#C9A84C]/10 text-center">
            <p className="text-[10px] text-[#A89880]/70">
              Need a custom webapp like this? Let&apos;s build it.
            </p>
          </div>
        </div>
      )}

      {/* ─── Persistent Floating Pill Button (Anchored Bottom-Right) ─── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#12110e]/95 hover:bg-[#1a1815] backdrop-blur-xl border border-[#C9A84C]/40 hover:border-[#C9A84C] text-[#F5ECD7] text-xs font-medium shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(201,168,76,0.2)] transition-all hover:scale-[1.03] active:scale-[0.97]"
        title="Contact developer"
        aria-expanded={isOpen}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
        </span>
        <span className="text-[#A89880] group-hover:text-[#F5ECD7] transition-colors">
          Built by <strong className="text-[#C9A84C] font-semibold">Tejas</strong>
        </span>
        <span className="text-[#A89880]/40">|</span>
        <span className="text-[11px] text-[#C9A84C] font-bold">
          {isOpen ? "✕" : "Contact ↗"}
        </span>
      </button>
    </div>
  );
}
