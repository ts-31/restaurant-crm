"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timerRef.current.get(id);
    if (t) { clearTimeout(t); timerRef.current.delete(id); }
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-4), { id, message, variant }]);
      const timer = setTimeout(() => remove(id), 3500);
      timerRef.current.set(id, timer);
    },
    [remove]
  );

  const iconMap: Record<ToastVariant, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
  };
  const colorMap: Record<ToastVariant, string> = {
    success: "bg-[#131210] text-[#F5ECD7] border border-[#C9A84C]/40 shadow-[0_8px_30px_rgba(0,0,0,0.8)]",
    error: "bg-[#1a0f0d] text-[#F5A89A] border border-[#E86C5D]/40 shadow-[0_8px_30px_rgba(0,0,0,0.8)]",
    info: "bg-[#131210] text-[#F5ECD7] border border-[#C9A84C]/25 shadow-[0_8px_30px_rgba(0,0,0,0.8)]",
  };
  const iconColorMap: Record<ToastVariant, string> = {
    success: "text-[#C9A84C]",
    error: "text-[#E86C5D]",
    info: "text-[#C9A84C]",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast stack */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none w-full max-w-sm px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "flex items-center gap-2.5 px-4 py-3 rounded-xl w-full pointer-events-auto animate-slide-in-bottom",
              colorMap[t.variant]
            )}
          >
            <span className={cn("material-symbols-outlined text-[20px] shrink-0", iconColorMap[t.variant])}>
              {iconMap[t.variant]}
            </span>
            <p className="font-body-sm text-body-sm flex-1">{t.message}</p>
            <button
              aria-label="Dismiss"
              onClick={() => remove(t.id)}
              className="shrink-0 text-[#A89880] hover:text-[#F5ECD7] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return { toast: ctx.toast };
}
