"use client";

import { useRef, useState } from "react";
import { ShareCard, type ShareCardHandle } from "./ShareCard";
import type { OrderItem, Restaurant } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

interface Props {
  restaurant: Restaurant | null;
  items: OrderItem[];
  tableLabel: string;
  tableId: string;
  total: number;
  currency: string;
}

type ShareState = "idle" | "generating" | "sharing" | "done" | "error" | "downloaded";

export function ShareButton({ restaurant, items, tableLabel, tableId, total, currency }: Props) {
  const cardRef = useRef<ShareCardHandle>(null);
  const [state, setState] = useState<ShareState>("idle");

  // The QR code on the card links new customers to this restaurant's menu
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const menuUrl = `${origin}/t/${tableId}`;

  async function handleShare() {
    if (state === "generating" || state === "sharing") return;
    setState("generating");

    try {
      const blob = await cardRef.current!.generateBlob();
      const file = new File([blob], "my-order.png", { type: "image/png" });

      // ── Web Share API (mobile) ────────────────────────────────────────────
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        setState("sharing");
        await navigator.share({
          files: [file],
          title: `Dining at ${restaurant?.name ?? "the restaurant"}`,
          text: `Just ordered at ${restaurant?.name ?? "a great restaurant"} 🍽`,
        });
        setState("done");
        // Reset after a moment so user can share again
        setTimeout(() => setState("idle"), 3000);
        return;
      }

      // ── Fallback: download the image (desktop) ───────────────────────────
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-order.png";
      a.click();
      URL.revokeObjectURL(url);
      setState("downloaded");
      setTimeout(() => setState("idle"), 3000);
    } catch (err) {
      // User cancelled the share sheet — not a real error
      if (err instanceof Error && err.name === "AbortError") {
        setState("idle");
        return;
      }
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  const isLoading = state === "generating" || state === "sharing";

  return (
    <>
      {/* Hidden canvas — renders off-screen */}
      <ShareCard
        ref={cardRef}
        restaurant={restaurant}
        items={items}
        tableLabel={tableLabel}
        total={total}
        currency={currency}
        menuUrl={menuUrl}
      />

      {/* Visible share card UI */}
      <section className="bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {/* Header gradient band */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${restaurant?.accent_color ?? "#C9A84C"}, transparent)`,
          }}
        />

        <div className="p-5 flex flex-col gap-4">
          {/* Heading row */}
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xl"
              style={{ background: `${restaurant?.accent_color ?? "#C9A84C"}22` }}
            >
              🎉
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Share your order</h2>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                Generate a beautiful card with your order details and share it with friends.
              </p>
            </div>
          </div>

          {/* Mini preview of what the card contains */}
          <div className="bg-surface-container rounded-2xl p-3 flex flex-col gap-1.5 border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                What's on the card
              </span>
              <span className="text-[10px] text-on-surface-variant/60">PNG image</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {[
                `📍 ${tableLabel}`,
                `🍽 ${items.length} dish${items.length !== 1 ? "es" : ""}`,
                `💳 ${formatMoney(total, currency)}`,
                "📷 QR code",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/20 text-on-surface-variant"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background:
                state === "done" || state === "downloaded"
                  ? "#16a34a"
                  : state === "error"
                  ? "#dc2626"
                  : restaurant?.accent_color ?? "#C9A84C",
              color: "#0f0e0c",
            }}
          >
            {isLoading ? (
              <>
                <Spinner />
                <span>{state === "generating" ? "Generating card…" : "Opening share…"}</span>
              </>
            ) : state === "done" ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Shared!</span>
              </>
            ) : state === "downloaded" ? (
              <>
                <span className="material-symbols-outlined text-[18px]">download_done</span>
                <span>Image saved!</span>
              </>
            ) : state === "error" ? (
              <>
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>Something went wrong — try again</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span>Share your order</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-on-surface-variant/50 text-center -mt-1">
            Opens your phone's share menu · Instagram, WhatsApp, and more
          </p>
        </div>
      </section>
    </>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
