"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal confirmation dialog for destructive actions.
 * (Delete item, delete table, etc.)
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm bg-[#131210] border border-[#C9A84C]/25 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] p-6 flex flex-col gap-4 animate-fade-in"
      >
        <div className="flex flex-col gap-1.5">
          <h2 id="confirm-title" className="font-title-md text-title-md text-[#F5ECD7] font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {title}
          </h2>
          <p id="confirm-desc" className="font-body-sm text-body-sm text-[#A89880] leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            id="confirm-cancel"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl font-label-md text-label-md text-[#A89880] hover:text-[#F5ECD7] hover:bg-[#1a1816] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-ok"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl font-label-md text-label-md flex items-center gap-2 font-bold transition-all disabled:opacity-50 ${
              danger
                ? "bg-[#E86C5D] text-[#0f0e0c] hover:brightness-110"
                : "bg-[#C9A84C] text-[#0f0e0c] shadow-[0_2px_12px_rgba(201,168,76,0.3)] hover:brightness-110"
            }`}
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-[#0f0e0c]/40 border-t-[#0f0e0c] rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
