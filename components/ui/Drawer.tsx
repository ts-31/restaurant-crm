"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** "bottom" slides up from bottom (mobile-first). "right" slides in from right (desktop panel). Default: "bottom" */
  side?: "bottom" | "right";
  className?: string;
}

/**
 * Reusable bottom-sheet / side-drawer component.
 * Used for item detail, cart, QR modal, and admin edit panels.
 */
export function Drawer({ open, onClose, title, children, side = "bottom", className }: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const panelBase =
    "fixed z-50 bg-[#131210] border-t border-[#C9A84C]/20 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden";
  const panelSide =
    side === "right"
      ? "top-0 right-0 h-full w-full max-w-md rounded-l-2xl border-l border-[#C9A84C]/20 animate-slide-in-right"
      : "bottom-0 left-0 right-0 rounded-t-3xl max-h-[92dvh] animate-slide-in-bottom";

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(panelBase, panelSide, className)}
      >
        {/* Drag handle (bottom sheet) */}
        {side === "bottom" && (
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-[#C9A84C]/30" />
          </div>
        )}
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-[#C9A84C]/15">
            <h2 className="font-title-md text-title-md text-[#F5ECD7] font-medium"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-full hover:bg-[#1a1816] text-[#A89880] hover:text-[#F5ECD7] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
}
