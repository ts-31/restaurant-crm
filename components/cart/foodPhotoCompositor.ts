import QRCode from "qrcode";
import type { Restaurant } from "@/lib/types";

export type OverlayStyle = "glass" | "badge" | "polaroid";

export interface CompositorOptions {
  imageSrc: string;
  restaurant: Restaurant | null;
  tableLabel: string;
  menuUrl: string;
  style: OverlayStyle;
}

export async function compositeFoodPhoto({
  imageSrc,
  restaurant,
  tableLabel,
  menuUrl,
  style,
}: CompositorOptions): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const accent = restaurant?.accent_color || "#C9A84C";
  const name = restaurant?.name || "Our Restaurant";
  const tagline = restaurant?.tagline || "Delicious Dining";

  // Pre-generate QR code
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, menuUrl, {
    width: 140,
    margin: 1,
    color: { dark: "#0f0e0c", light: "#F5ECD7" },
  });

  // Pre-load restaurant logo if available
  let logoImg: HTMLImageElement | null = null;
  if (restaurant?.logo_url) {
    try {
      logoImg = await loadImage(restaurant.logo_url);
    } catch {
      logoImg = null;
    }
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  if (style === "polaroid") {
    await renderPolaroidStyle(ctx, canvas, img, logoImg, qrCanvas, {
      name,
      tagline,
      tableLabel,
      accent,
    });
  } else if (style === "badge") {
    await renderBadgeStyle(ctx, canvas, img, logoImg, qrCanvas, {
      name,
      tagline,
      tableLabel,
      accent,
    });
  } else {
    // Default: "glass"
    await renderGlassStyle(ctx, canvas, img, logoImg, qrCanvas, {
      name,
      tagline,
      tableLabel,
      accent,
    });
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to composite food photo"));
      },
      "image/jpeg",
      0.92
    );
  });
}

// ─── Style 1: Modern Frosted Glass Banner ─────────────────────────────────────

async function renderGlassStyle(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  qrCanvas: HTMLCanvasElement,
  info: { name: string; tagline: string; tableLabel: string; accent: string }
) {
  const targetW = 1080;
  const targetH = Math.round(targetW * (img.height / img.width));
  canvas.width = targetW;
  canvas.height = targetH;

  // Draw customer's photo
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Bottom gradient shade for readability
  const gradH = Math.min(targetH * 0.45, 420);
  const grad = ctx.createLinearGradient(0, targetH - gradH, 0, targetH);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.5, "rgba(10, 9, 8, 0.6)");
  grad.addColorStop(1, "rgba(10, 9, 8, 0.95)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, targetH - gradH, targetW, gradH);

  // Glass Card layout
  const pad = 48;
  const cardW = targetW - pad * 2;
  const cardH = 200;
  const cardX = pad;
  const cardY = targetH - cardH - pad;

  // Glass background
  ctx.save();
  ctx.fillStyle = "rgba(20, 18, 16, 0.82)";
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  // Glass gold border
  ctx.strokeStyle = hexToRgba(info.accent, 0.45);
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.stroke();
  ctx.restore();

  // Accent top shimmer line inside card
  const topBar = ctx.createLinearGradient(cardX + 40, 0, cardX + cardW - 40, 0);
  topBar.addColorStop(0, "transparent");
  topBar.addColorStop(0.5, info.accent);
  topBar.addColorStop(1, "transparent");
  ctx.fillStyle = topBar;
  ctx.fillRect(cardX + 40, cardY, cardW - 80, 2);

  let textLeft = cardX + 36;
  const contentCenterY = cardY + cardH / 2;

  // Logo (if available)
  if (logoImg) {
    const logoSize = 88;
    const logoY = contentCenterY - logoSize / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(textLeft + logoSize / 2, contentCenterY, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, textLeft, logoY, logoSize, logoSize);
    ctx.restore();

    // Circle border around logo
    ctx.save();
    ctx.strokeStyle = hexToRgba(info.accent, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(textLeft + logoSize / 2, contentCenterY, logoSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    textLeft += logoSize + 28;
  }

  // Restaurant Name & Details
  ctx.textAlign = "left";
  ctx.font = "bold 38px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#F5ECD7";
  ctx.fillText(info.name, textLeft, contentCenterY - 18);

  ctx.font = "italic 20px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = hexToRgba(info.accent, 0.95);
  ctx.fillText(truncate(info.tagline, 32), textLeft, contentCenterY + 14);

  // Table badge
  ctx.font = "600 18px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#A89880";
  ctx.fillText(`📍 Dining at ${info.tableLabel}`, textLeft, contentCenterY + 44);

  // Right: QR code
  const qrDisplaySize = 130;
  const qrX = cardX + cardW - qrDisplaySize - 36;
  const qrY = contentCenterY - qrDisplaySize / 2 - 10;

  // QR white rounded container
  ctx.save();
  ctx.fillStyle = "#F5ECD7";
  roundRect(ctx, qrX - 8, qrY - 8, qrDisplaySize + 16, qrDisplaySize + 16, 16);
  ctx.fill();
  ctx.drawImage(qrCanvas, qrX, qrY, qrDisplaySize, qrDisplaySize);
  ctx.restore();

  ctx.font = "600 14px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#F5ECD7";
  ctx.textAlign = "center";
  ctx.fillText("Scan for Menu", qrX + qrDisplaySize / 2, qrY + qrDisplaySize + 24);
}

// ─── Style 2: Minimalist Corner Stamp ─────────────────────────────────────────

async function renderBadgeStyle(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  qrCanvas: HTMLCanvasElement,
  info: { name: string; tagline: string; tableLabel: string; accent: string }
) {
  const targetW = 1080;
  const targetH = Math.round(targetW * (img.height / img.width));
  canvas.width = targetW;
  canvas.height = targetH;

  // Draw customer's photo
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Subtle corner vignette
  const badgeW = 460;
  const badgeH = 130;
  const pad = 40;
  const badgeX = targetW - badgeW - pad;
  const badgeY = targetH - badgeH - pad;

  // Badge capsule background
  ctx.save();
  ctx.fillStyle = "rgba(15, 14, 12, 0.88)";
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 65);
  ctx.fill();

  ctx.strokeStyle = hexToRgba(info.accent, 0.5);
  ctx.lineWidth = 2;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 65);
  ctx.stroke();
  ctx.restore();

  let textX = badgeX + 30;
  const centerY = badgeY + badgeH / 2;

  // Logo
  if (logoImg) {
    const logoSize = 70;
    ctx.save();
    ctx.beginPath();
    ctx.arc(textX + logoSize / 2, centerY, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, textX, centerY - logoSize / 2, logoSize, logoSize);
    ctx.restore();
    textX += logoSize + 20;
  }

  // Texts
  ctx.textAlign = "left";
  ctx.font = "bold 26px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#F5ECD7";
  ctx.fillText(truncate(info.name, 14), textX, centerY - 8);

  ctx.font = "600 16px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = hexToRgba(info.accent, 0.9);
  ctx.fillText(`🍽 ${info.tableLabel}`, textX, centerY + 20);

  // Tiny QR in badge
  const qrSize = 90;
  const qrX = badgeX + badgeW - qrSize - 20;
  const qrY = centerY - qrSize / 2;

  ctx.save();
  ctx.fillStyle = "#F5ECD7";
  roundRect(ctx, qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 12);
  ctx.fill();
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
  ctx.restore();
}

// ─── Style 3: Vintage Polaroid / Postcard ─────────────────────────────────────

async function renderPolaroidStyle(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  qrCanvas: HTMLCanvasElement,
  info: { name: string; tagline: string; tableLabel: string; accent: string }
) {
  const borderX = 48;
  const borderTop = 48;
  const borderBottom = 260;

  const photoW = 1080 - borderX * 2;
  const photoH = Math.round(photoW * (img.height / img.width));

  canvas.width = 1080;
  canvas.height = photoH + borderTop + borderBottom;

  // Polaroid creamy background
  ctx.fillStyle = "#F8F5EE";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw photo inside frame
  ctx.drawImage(img, borderX, borderTop, photoW, photoH);

  // Soft inner shadow around photo
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(borderX, borderTop, photoW, photoH);

  // Bottom text area
  const textCenterY = borderTop + photoH + borderBottom / 2;
  let textX = borderX + 24;

  if (logoImg) {
    const logoSize = 80;
    ctx.save();
    ctx.beginPath();
    ctx.arc(textX + logoSize / 2, textCenterY, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, textX, textCenterY - logoSize / 2, logoSize, logoSize);
    ctx.restore();

    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(textX + logoSize / 2, textCenterY, logoSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    textX += logoSize + 28;
  }

  ctx.textAlign = "left";
  ctx.font = "bold 38px 'Cormorant Garamond', Georgia, serif";
  ctx.fillStyle = "#1c1917";
  ctx.fillText(info.name, textX, textCenterY - 14);

  ctx.font = "italic 20px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#78716c";
  ctx.fillText(`${info.tagline} · ${info.tableLabel}`, textX, textCenterY + 18);

  const today = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  ctx.font = "500 16px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#a8a29e";
  ctx.fillText(`Captured on ${today}`, textX, textCenterY + 44);

  // Right QR code
  const qrSize = 130;
  const qrX = canvas.width - borderX - qrSize - 16;
  const qrY = textCenterY - qrSize / 2 - 8;

  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  ctx.font = "600 13px 'Jost', system-ui, sans-serif";
  ctx.fillStyle = "#78716c";
  ctx.textAlign = "center";
  ctx.fillText("Menu & Details", qrX + qrSize / 2, qrY + qrSize + 20);
}

// ─── Shared Utilities ─────────────────────────────────────────────────────────

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
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.slice(0, 2), 16) || 201;
  const g = parseInt(cleanHex.slice(2, 4), 16) || 168;
  const b = parseInt(cleanHex.slice(4, 6), 16) || 76;
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
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

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}
