"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { DiningTable } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";

interface QRCodeModalProps {
  open: boolean;
  table: DiningTable | null;
  restaurantName: string;
  appUrl: string;
  onClose: () => void;
}

export function QRCodeModal({
  open,
  table,
  restaurantName,
  appUrl,
  onClose,
}: QRCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const orderUrl = table ? `${appUrl}/t/${table.id}` : "";

  useEffect(() => {
    if (!table || !open) return;

    QRCode.toDataURL(orderUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: "#1e1b18",
        light: "#ffffff",
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error(err));
  }, [table, open, orderUrl]);

  if (!open || !table) return null;

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${restaurantName.toLowerCase().replace(/\s+/g, "-")}-${table.label.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast(`Downloaded QR for ${table.label}`, "success");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(orderUrl);
    toast("Table menu link copied to clipboard", "info");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-surface rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/30 flex flex-col items-center gap-5 relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Printable Card Preview */}
        <div
          id="printable-qr-card"
          className="w-full bg-white text-slate-900 rounded-xl p-6 flex flex-col items-center gap-3 border border-slate-200 shadow-sm"
        >
          <div className="text-center">
            <h3 className="font-serif font-bold text-lg text-slate-900 tracking-tight">
              {restaurantName}
            </h3>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold tracking-wide">
              {table.label} {table.section ? `• ${table.section}` : ""}
            </span>
          </div>

          <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt={`QR code for ${table.label}`}
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                Generating QR code...
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Scan to Browse & Order
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Contactless digital menu & kitchen dispatch
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download PNG (High-Res)
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2 px-3 rounded-xl bg-surface-container text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Copy Link
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="py-2 px-3 rounded-xl bg-surface-container text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
