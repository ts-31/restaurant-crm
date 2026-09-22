"use client";

import { useEffect, useState } from "react";
import type { Restaurant } from "@/lib/types";
import {
  compositeFoodPhoto,
  type OverlayStyle,
} from "./foodPhotoCompositor";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  restaurant: Restaurant | null;
  tableLabel: string;
  tableId: string;
  onRetake: () => void;
}

const STYLES: { id: OverlayStyle; label: string; icon: string; desc: string }[] = [
  { id: "glass", label: "Modern Glass", icon: "auto_awesome", desc: "Frosted card at bottom" },
  { id: "badge", label: "Corner Stamp", icon: "verified", desc: "Minimal unobtrusive badge" },
  { id: "polaroid", label: "Polaroid", icon: "photo_camera", desc: "Classic photo frame" },
];

export function FoodPhotoModal({
  isOpen,
  onClose,
  imageSrc,
  restaurant,
  tableLabel,
  tableId,
  onRetake,
}: Props) {
  const [style, setStyle] = useState<OverlayStyle>("glass");
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [shareState, setShareState] = useState<
    "idle" | "sharing" | "done" | "downloaded" | "error"
  >("idle");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const menuUrl = `${origin}/t/${tableId}`;

  // Composite when image or style changes
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    let cancelled = false;
    setIsRendering(true);

    compositeFoodPhoto({
      imageSrc,
      restaurant,
      tableLabel,
      menuUrl,
      style,
    })
      .then((blob) => {
        if (cancelled) return;
        setPreviewBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      })
      .catch((err) => {
        console.error("Compositing error:", err);
      })
      .finally(() => {
        if (!cancelled) setIsRendering(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, imageSrc, style, restaurant, tableLabel, menuUrl]);

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen || !imageSrc) return null;

  async function handleShare() {
    if (!previewBlob || isRendering) return;
    setShareState("sharing");

    try {
      const file = new File([previewBlob], "food-story.jpg", { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Dining at ${restaurant?.name ?? "the restaurant"}`,
          text: `Enjoying delicious food at ${restaurant?.name ?? "a wonderful restaurant"}! 🍽️✨`,
        });
        setShareState("done");
        setTimeout(() => setShareState("idle"), 3000);
        return;
      }

      // Fallback to direct download
      downloadImage(previewBlob);
      setShareState("downloaded");
      setTimeout(() => setShareState("idle"), 3000);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setShareState("idle");
        return;
      }
      setShareState("error");
      setTimeout(() => setShareState("idle"), 3000);
    }
  }

  function handleDownload() {
    if (!previewBlob) return;
    downloadImage(previewBlob);
    setShareState("downloaded");
    setTimeout(() => setShareState("idle"), 3000);
  }

  function downloadImage(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${restaurant?.name ? restaurant.name.toLowerCase().replace(/\s+/g, "-") : "restaurant"}-food.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const accentColor = restaurant?.accent_color || "#C9A84C";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">
              photo_camera
            </span>
            <h2 className="text-sm font-bold text-on-surface">Your Food Story</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable preview body */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4 flex-1">
          {/* Live Preview Container */}
          <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-outline-variant/20 flex items-center justify-center min-h-[320px] max-h-[460px]">
            {isRendering && (
              <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Applying branding overlay…</span>
              </div>
            )}

            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Food photo preview"
                className="w-full h-full max-h-[460px] object-contain"
              />
            ) : (
              <div className="text-xs text-on-surface-variant/60">Loading photo…</div>
            )}
          </div>

          {/* Style Selector Chips */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Overlay Style
            </span>
            <div className="grid grid-cols-3 gap-2">
              {STYLES.map((s) => {
                const active = style === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`py-2 px-2.5 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
                      active
                        ? "bg-primary/15 border-primary text-primary shadow-xs"
                        : "bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/40"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                    <span className="text-[11px] font-bold leading-none">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={onRetake}
              className="py-2.5 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Retake</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isRendering || !previewBlob}
              className="py-2.5 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Save</span>
            </button>

            <button
              onClick={handleShare}
              disabled={isRendering || !previewBlob}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60 active:scale-[0.98]"
              style={{
                backgroundColor:
                  shareState === "done" || shareState === "downloaded"
                    ? "#16a34a"
                    : shareState === "error"
                    ? "#dc2626"
                    : accentColor,
                color: "#0f0e0c",
              }}
            >
              {shareState === "sharing" ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Sharing…</span>
                </>
              ) : shareState === "done" ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Shared!</span>
                </>
              ) : shareState === "downloaded" ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">download_done</span>
                  <span>Saved to device!</span>
                </>
              ) : shareState === "error" ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>Try again</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">share</span>
                  <span>Share Story</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-on-surface-variant/50 text-center">
            Share directly to Instagram Stories, WhatsApp, or save to photos
          </p>
        </div>
      </div>
    </div>
  );
}
