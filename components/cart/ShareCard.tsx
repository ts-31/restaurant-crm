"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import QRCode from "qrcode";
import type { OrderItem, Restaurant } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

// ─── Card dimensions (portrait, social-story friendly) ───────────────────────
const W = 640;
const H = 800;

export interface ShareCardHandle {
  generateBlob: () => Promise<Blob>;
}

interface Props {
  restaurant: Restaurant | null;
  items: OrderItem[];
  tableLabel: string;
  total: number;
  currency: string;
  menuUrl: string;
}

export const ShareCard = forwardRef<ShareCardHandle, Props>(function ShareCard(
  { restaurant, items, tableLabel, total, currency, menuUrl },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    generateBlob: () => drawCard(canvasRef.current!, { restaurant, items, tableLabel, total, currency, menuUrl }),
  }));

  return (
    // Hidden off-screen — only used as a drawing surface
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ position: "absolute", left: -9999, top: -9999, pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
});

// ─── Core drawing logic ───────────────────────────────────────────────────────

async function drawCard(
  canvas: HTMLCanvasElement,
  { restaurant, items, tableLabel, total, currency, menuUrl }: Omit<Props, never>
): Promise<Blob> {
  const ctx = canvas.getContext("2d")!;
  const accent = restaurant?.accent_color || "#C9A84C";

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = "#0f0e0c";
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow at top center
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 420);
  glow.addColorStop(0, hexToRgba(accent, 0.18));
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── Top accent bar ──────────────────────────────────────────────────────────
  const bar = ctx.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0, "transparent");
  bar.addColorStop(0.5, accent);
  bar.addColorStop(1, "transparent");
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, W, 2);

  let y = 52;

  // ── Logo ────────────────────────────────────────────────────────────────────
  if (restaurant?.logo_url) {
    try {
      const img = await loadImage(restaurant.logo_url);
      const logoSize = 64;
      // Circle clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, W / 2 - logoSize / 2, y, logoSize, logoSize);
      ctx.restore();
      y += logoSize + 16;
    } catch {
      // Logo failed to load — skip silently
    }
  }

  // ── Restaurant name ─────────────────────────────────────────────────────────
  const name = restaurant?.name ?? "Our Restaurant";
  ctx.font = "bold 30px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#F5ECD7";
  ctx.textAlign = "center";
  ctx.fillText(name, W / 2, y + 30);
  y += 50;

  // Tagline
  if (restaurant?.tagline) {
    ctx.font = "italic 15px 'Jost', system-ui, sans-serif";
    ctx.fillStyle = hexToRgba(accent, 0.85);
    ctx.fillText(restaurant.tagline, W / 2, y);
    y += 24;
  }

  y += 8;

  // ── Gold divider ────────────────────────────────────────────────────────────
  drawDivider(ctx, y, accent);
  y += 28;

  // ── "Just ordered" headline ─────────────────────────────────────────────────
  ctx.font = "600 18px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#A89880";
  ctx.textAlign = "center";
  ctx.fillText("Just ordered something delicious 🍽", W / 2, y);
  y += 36;

  // ── Order items card ────────────────────────────────────────────────────────
  const PAD = 40;
  const cardX = PAD;
  const cardW = W - PAD * 2;
  const itemH = 32;
  const displayItems = items.slice(0, 5); // cap at 5 to avoid overflow
  const cardH = displayItems.length * itemH + 28;

  // Card background
  ctx.fillStyle = "#131210";
  roundRect(ctx, cardX, y, cardW, cardH, 16);
  ctx.fill();

  // Card border
  ctx.strokeStyle = hexToRgba("#5A4A35", 0.5);
  ctx.lineWidth = 1;
  roundRect(ctx, cardX, y, cardW, cardH, 16);
  ctx.stroke();

  y += 18;
  ctx.textAlign = "left";

  for (const item of displayItems) {
    const label = `${item.quantity}× ${item.name_snapshot}`;
    const price = formatMoney(Number(item.price_snapshot) * item.quantity, currency);

    ctx.font = "500 15px 'Jost', system-ui, sans-serif";
    ctx.fillStyle = "#F5ECD7";
    ctx.fillText(truncate(label, 38), cardX + 20, y);

    ctx.font = "600 15px 'Jost', system-ui, sans-serif";
    ctx.fillStyle = accent;
    ctx.textAlign = "right";
    ctx.fillText(price, cardX + cardW - 20, y);
    ctx.textAlign = "left";

    y += itemH;
  }

  if (items.length > 5) {
    ctx.font = "italic 13px 'Jost', system-ui, sans-serif";
    ctx.fillStyle = "#A89880";
    ctx.fillText(`+${items.length - 5} more items`, cardX + 20, y - 4);
  }

  y += 24;

  // ── Table + Total row ───────────────────────────────────────────────────────
  const pillY = y;
  const pillH = 40;

  // Table pill
  drawPill(ctx, cardX, pillY, (cardW - 12) / 2, pillH, accent);
  ctx.font = "600 14px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#F5ECD7";
  ctx.textAlign = "center";
  ctx.fillText(`🪑 ${tableLabel}`, cardX + (cardW - 12) / 4, pillY + 26);

  // Total pill
  const totalX = cardX + (cardW - 12) / 2 + 12;
  drawPill(ctx, totalX, pillY, (cardW - 12) / 2, pillH, accent);
  ctx.font = "700 14px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = accent;
  ctx.textAlign = "center";
  ctx.fillText(formatMoney(total, currency), totalX + (cardW - 12) / 4, pillY + 26);

  y += pillH + 36;

  // ── Gold divider ────────────────────────────────────────────────────────────
  drawDivider(ctx, y, accent);
  y += 28;

  // ── QR Code ─────────────────────────────────────────────────────────────────
  const qrSize = 120;
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, menuUrl, {
    width: qrSize,
    margin: 1,
    color: { dark: "#0f0e0c", light: "#F5ECD7" },
  });

  // QR background pill
  const qrBgW = qrSize + 32;
  const qrBgH = qrSize + 32;
  const qrBgX = W / 2 - qrBgW / 2;
  ctx.fillStyle = "#F5ECD7";
  roundRect(ctx, qrBgX, y, qrBgW, qrBgH, 12);
  ctx.fill();
  ctx.drawImage(qrCanvas, W / 2 - qrSize / 2, y + 16, qrSize, qrSize);

  y += qrBgH + 14;

  ctx.font = "500 13px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#A89880";
  ctx.textAlign = "center";
  ctx.fillText("Scan to explore our menu", W / 2, y);

  y += 30;

  // ── Bottom accent bar ───────────────────────────────────────────────────────
  const bottomBar = ctx.createLinearGradient(0, 0, W, 0);
  bottomBar.addColorStop(0, "transparent");
  bottomBar.addColorStop(0.5, accent);
  bottomBar.addColorStop(1, "transparent");
  ctx.fillStyle = bottomBar;
  ctx.fillRect(0, H - 2, W, 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to generate share card"));
    }, "image/png");
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number, accent: string) {
  const grad = ctx.createLinearGradient(W / 2 - 80, 0, W / 2 + 80, 0);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.5, hexToRgba(accent, 0.6));
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(W / 2 - 80, y, 160, 1);
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  accent: string
) {
  ctx.fillStyle = "#1a1816";
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(accent, 0.3);
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}
