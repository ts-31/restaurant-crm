"use client";

import { useRef, useState } from "react";
import { ShareCard, type ShareCardHandle } from "./ShareCard";
import { FoodPhotoModal } from "./FoodPhotoModal";
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

export function ShareButton({
  restaurant,
  items,
  tableLabel,
  tableId,
  total,
  currency,
}: Props) {
  const cardRef = useRef<ShareCardHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Card generation state (Feature 1)
  const [state, setState] = useState<ShareState>("idle");

  // Food photo state (Feature 2)
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // The QR code on the card/photo links new customers to this restaurant's menu
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const menuUrl = `${origin}/t/${tableId}`;
  const accentColor = restaurant?.accent_color ?? "#C9A84C";

  // ── Feature 1: Share Order Card Handler ───────────────────────────────────
  async function handleShareOrderCard() {
    if (state === "generating" || state === "sharing") return;
    setState("generating");

    try {
      const blob = await cardRef.current!.generateBlob();
      const file = new File([blob], "my-order.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        setState("sharing");
        await navigator.share({
          files: [file],
          title: `Dining at ${restaurant?.name ?? "the restaurant"}`,
          text: `Just ordered at ${restaurant?.name ?? "a great restaurant"} 🍽`,
        });
        setState("done");
        setTimeout(() => setState("idle"), 3000);
        return;
      }

      // Fallback: download the image (desktop)
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-order.png";
      a.click();
      URL.revokeObjectURL(url);
      setState("downloaded");
      setTimeout(() => setState("idle"), 3000);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setState("idle");
        return;
      }
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  // ── Feature 2: Food Photo Camera Picker ───────────────────────────────────
  function handleTriggerCamera() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPhotoSrc(url);
    setIsPhotoModalOpen(true);

    // Reset input so user can re-pick same photo if needed
    e.target.value = "";
  }

  function handleRetakePhoto() {
    fileInputRef.current?.click();
  }

  function handleCloseModal() {
    setIsPhotoModalOpen(false);
    if (photoSrc) {
      URL.revokeObjectURL(photoSrc);
      setPhotoSrc(null);
    }
  }

  const isLoading = state === "generating" || state === "sharing";

  return (
    <>
      {/* Hidden canvas for Feature 1 (Order Card) */}
      <ShareCard
        ref={cardRef}
        restaurant={restaurant}
        items={items}
        tableLabel={tableLabel}
        total={total}
        currency={currency}
        menuUrl={menuUrl}
      />

      {/* Hidden file input for Feature 2 (Food Photo Camera / Gallery) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Feature 2 Modal */}
      <FoodPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={handleCloseModal}
        imageSrc={photoSrc}
        restaurant={restaurant}
        tableLabel={tableLabel}
        tableId={tableId}
        onRetake={handleRetakePhoto}
      />

      {/* Social Hub Section */}
      <section className="bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {/* Header gradient band */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          }}
        />

        <div className="p-5 flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xl"
              style={{ background: `${accentColor}22` }}
            >
              📣
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">Share your experience</h2>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                Post your meal on Instagram Stories or WhatsApp with branded overlays.
              </p>
            </div>
          </div>

          {/* Dual Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Action 1: Snap Food Photo (Feature 2) */}
            <button
              onClick={handleTriggerCamera}
              className="p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-left flex flex-col justify-between gap-3 transition-all hover:border-primary/50 group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors group-hover:scale-105"
                  style={{ background: `${accentColor}25`, color: accentColor }}
                >
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                  NEW
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                  Snap Food Photo
                  <span className="material-symbols-outlined text-[14px] opacity-70 group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </span>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Take a photo of your dish with branded sticker & menu QR
                </p>
              </div>
            </button>

            {/* Action 2: Share Order Card (Feature 1) */}
            <button
              onClick={handleShareOrderCard}
              disabled={isLoading}
              className="p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-left flex flex-col justify-between gap-3 transition-all hover:border-outline-variant/60 group active:scale-[0.98] disabled:opacity-60"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface">
                  {isLoading ? (
                    <Spinner />
                  ) : state === "done" ? (
                    <span className="material-symbols-outlined text-[20px] text-emerald-500">
                      check_circle
                    </span>
                  ) : state === "downloaded" ? (
                    <span className="material-symbols-outlined text-[20px] text-emerald-500">
                      download_done
                    </span>
                  ) : state === "error" ? (
                    <span className="material-symbols-outlined text-[20px] text-red-500">
                      error
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-on-surface-variant/70">
                  {items.length} dish{items.length !== 1 ? "es" : ""} · {formatMoney(total, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                  {isLoading
                    ? "Preparing card…"
                    : state === "done"
                    ? "Card Shared!"
                    : state === "downloaded"
                    ? "Card Saved!"
                    : "Share Order Card"}
                  <span className="material-symbols-outlined text-[14px] opacity-70 group-hover:translate-x-0.5 transition-transform">
                    share
                  </span>
                </span>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Instant receipt card with your dishes & table details
                </p>
              </div>
            </button>
          </div>

          <p className="text-[10px] text-on-surface-variant/50 text-center">
            Zero app installation required · Opens directly into your phone&apos;s share sheet
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
