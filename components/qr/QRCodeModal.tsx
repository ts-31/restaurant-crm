"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { DiningTable } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";

interface QRCodeModalProps {
  open: boolean;
  table: DiningTable | null;
  restaurantName: string;
  restaurantTagline?: string | null;
  appUrl: string;
  onClose: () => void;
}

export function QRCodeModal({
  open,
  table,
  restaurantName,
  restaurantTagline,
  appUrl,
  onClose,
}: QRCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const { toast } = useToast();

  const orderUrl = table ? `${appUrl}/t/${table.id}` : "";

  // Generate golden QR code matching luxury theme
  useEffect(() => {
    if (!table || !open) return;

    QRCode.toDataURL(orderUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: "#C9A84C",
        light: "#141210",
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error(err));
  }, [table, open, orderUrl]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-qr-card, #printable-qr-card * {
            visibility: visible;
          }
          #printable-qr-card {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 3.8in !important;
            box-shadow: none !important;
            border: 2px solid #C9A84C !important;
            padding: 0.4in !important;
            background-color: #141210 !important;
            color: #F5ECD7 !important;
            border-radius: 16px !important;
          }
          /* Ensure backgrounds print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-[#0e0d0b] rounded-2xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-[#C9A84C]/30 flex flex-col items-center gap-3.5 relative animate-scale-in max-h-[92vh] overflow-y-auto my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar with Table Title and Visible Close Button */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#C9A84C]/15">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C9A84C] text-[18px]">qr_code_2</span>
              <h2 className="text-xs sm:text-sm font-semibold text-[#F5ECD7]">
                {table.label} — QR Code
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#C9A84C]/20 text-[#F5ECD7]/60 hover:text-[#F5ECD7] flex items-center justify-center transition-colors border border-[#C9A84C]/20"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          {/* Printable Card Preview */}
          <div
            id="printable-qr-card"
            className="w-full bg-[#141210] text-[#F5ECD7] rounded-xl p-5 flex flex-col items-center justify-between gap-3 shadow-lg border-t-2 border-b-2 border-[#C9A84C]"
          >
            <div className="text-center">
              <div className="text-[#C9A84C] text-xs mb-0.5 tracking-widest">✦ ✦ ✦</div>
              <h3 className="font-serif font-bold text-lg text-[#F5ECD7] tracking-widest uppercase">
                {restaurantName}
              </h3>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#C9A84C]/80 mt-0.5">
                {restaurantTagline || "Fine Dining & Bar"}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-[#0c0b09] border border-[#C9A84C]/25 shadow-inner">
              {dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dataUrl}
                  alt={`QR code for ${table.label}`}
                  className="w-40 h-40 object-contain rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-[#F5ECD7]/40">
                  Generating...
                </div>
              )}
            </div>

            <div className="text-center w-full">
              <p className="text-xs italic font-serif text-[#F5ECD7]/70 mb-1">
                Scan to browse menu & order
              </p>
              <div className="w-10 h-px bg-[#C9A84C]/30 mx-auto mb-1.5" />
              <p className="text-base font-bold text-[#F5ECD7] tracking-wider uppercase font-serif">
                {table.label}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C9A84C] text-[#141210] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-[#D4B553] transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              Download PNG (High-Res)
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl bg-transparent border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#C9A84C]/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">link</span>
                Copy Link
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="py-2 px-3 rounded-xl bg-transparent border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#C9A84C]/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
