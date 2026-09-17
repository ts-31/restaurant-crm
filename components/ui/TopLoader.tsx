"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface TopLoaderContextValue {
  startLoading: () => void;
  stopLoading: () => void;
}

const TopLoaderContext = createContext<TopLoaderContextValue | null>(null);

export function TopLoaderProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const stopLoading = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    // Fade out after reaching 100%
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 280);
  }, []);

  const startLoading = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setVisible(true);
    setProgress(15);

    // Incremental trickle animation like Instagram / NProgress
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 85;
        }
        const delta = Math.max(1, (85 - prev) * 0.15);
        return Math.min(85, prev + delta);
      });
    }, 150);
  }, []);

  // Finish loader on route / search param changes
  useEffect(() => {
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Intercept internal link clicks to immediately trigger the top loader
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore modified clicks (cmd, ctrl, shift) or right clicks
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      // Check if target is internal and not download / external / hash
      const isExternal = target.target === "_blank" || target.rel?.includes("external");
      const url = new URL(target.href, window.location.origin);
      const isSameOrigin = url.origin === window.location.origin;
      const isHashOnly = url.pathname === window.location.pathname && url.hash !== "";
      const isSamePage = url.pathname === window.location.pathname && url.search === window.location.search && !url.hash;

      if (isSameOrigin && !isExternal && !isHashOnly && !isSamePage && !target.hasAttribute("download")) {
        startLoading();
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [startLoading]);

  return (
    <TopLoaderContext.Provider value={{ startLoading, stopLoading }}>
      {/* Top horizontal progress bar */}
      <div
        role="progressbar"
        aria-hidden={!visible}
        className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-300"
        style={{
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="h-[3px] transition-[width] duration-200 ease-out relative"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--color-accent, var(--color-primary, #c1440e))",
            boxShadow:
              "0 0 10px var(--color-accent, var(--color-primary, #c1440e)), 0 0 4px var(--color-accent, var(--color-primary, #c1440e))",
          }}
        >
          {/* Leading glow dot */}
          <div
            className="absolute top-0 right-0 bottom-0 w-24 opacity-80 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.7) 80%, rgba(255,255,255,0.9))",
            }}
          />
        </div>
      </div>
      {children}
    </TopLoaderContext.Provider>
  );
}

export function useTopLoader() {
  const ctx = useContext(TopLoaderContext);
  if (!ctx) {
    throw new Error("useTopLoader must be used within a TopLoaderProvider");
  }
  return ctx;
}
