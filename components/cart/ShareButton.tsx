"use client";

import { useRef, useState } from "react";
import { ShareCard, type ShareCardHandle } from "./ShareCard";
import { FoodPhotoModal } from "./FoodPhotoModal";
import type { OrderItem, Restaurant } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

// ── Social platforms shown in the glowing chip row ───────────────────────────
const PLATFORMS: { name: string; color: string; path: string }[] = [
  {
    name: "Instagram",
    color: "#E1306C",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "TikTok",
    color: "#69C9D0",
    path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z",
  },
  {
    name: "WhatsApp",
    color: "#25D366",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  },
  {
    name: "Facebook",
    color: "#1877F2",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "X",
    color: "#e2e2e2",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

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
                Post your meal on Instagram, TikTok, Facebook, or WhatsApp with branded overlays.
              </p>
            </div>
          </div>

          {/* Platform Glowing Chip Row */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-medium text-on-surface-variant/40 shrink-0 tracking-wide uppercase">
              Share to
            </span>
            <div className="flex items-center gap-1.5">
              {PLATFORMS.map((p) => (
                <PlatformChip key={p.name} platform={p} onClick={handleShareOrderCard} />
              ))}
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

// ── Platform Glowing Chip ─────────────────────────────────────────────────────
function PlatformChip({
  platform,
  onClick,
}: {
  platform: { name: string; color: string; path: string };
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      title={`Share on ${platform.name}`}
      aria-label={`Share on ${platform.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        width: "2.25rem",
        height: "2.25rem",
        borderRadius: "0.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
        background: hovered ? `${platform.color}28` : `${platform.color}14`,
        boxShadow: hovered
          ? `0 0 18px 4px ${platform.color}40, 0 0 6px 1px ${platform.color}25, inset 0 0 0 1px ${platform.color}50`
          : `inset 0 0 0 1px ${platform.color}22`,
        transform: hovered ? "scale(1.18)" : "scale(1)",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill={platform.color}
        style={{
          opacity: hovered ? 1 : 0.7,
          transition: "opacity 0.2s ease",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <path d={platform.path} />
      </svg>
    </button>
  );
}
