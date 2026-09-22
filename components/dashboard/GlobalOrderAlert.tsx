"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import {
  playKitchenBell,
  unlockAudio,
  checkIsAudioUnlocked,
  initAudioAutoUnlock,
} from "@/lib/audio/kitchenAudio";

interface Props {
  restaurantId: string;
}

export function GlobalOrderAlert({ restaurantId }: Props) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [, setIsUnlocked] = useState(false);
  const { toast } = useToast();
  const bellRef = useRef<HTMLSpanElement>(null);

  /** Replay the swing animation even if already mid-ring */
  const triggerBellAnimation = () => {
    const el = bellRef.current;
    if (!el) return;
    el.classList.remove("animate-bell-ring");
    // Force reflow so the browser registers the class removal before re-adding
    void el.offsetWidth;
    el.classList.add("animate-bell-ring");
    // Clean up class after animation completes so it can replay next time
    setTimeout(() => el.classList.remove("animate-bell-ring"), 950);
  };

  // Load sound preference on mount & register autoplay unlocker
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kitchen_sound_enabled");
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    } catch {
      // localStorage unavailable (SSR/private)
    }

    setIsUnlocked(checkIsAudioUnlocked());
    const cleanup = initAudioAutoUnlock(() => {
      setIsUnlocked(true);
    });

    return cleanup;
  }, []);

  // Global Realtime listener for incoming orders across all dashboard routes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`global-order-alerts-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async () => {
          if (soundEnabled) {
            playKitchenBell(0.85);
          }
          triggerBellAnimation();
          toast("New table order received!", "info");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, soundEnabled, toast]);

  const handleToggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem("kitchen_sound_enabled", String(next));
    } catch {}

    if (next) {
      await unlockAudio();
      setIsUnlocked(true);
      playKitchenBell(0.85);
      triggerBellAnimation();
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleSound}
      title={
        soundEnabled
          ? "Order chime active (Click to mute)"
          : "Order chime muted (Click to enable)"
      }
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-[0.96] ${
        soundEnabled
          ? "bg-[#C9A84C]/15 border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/25 shadow-xs"
          : "bg-[#1a1816] border-[#C9A84C]/15 text-[#A89880]/60 hover:text-[#A89880]"
      }`}
    >
      <span
        ref={bellRef}
        className="material-symbols-outlined text-[18px]"
        style={{ display: "inline-block" }}
      >
        {soundEnabled ? "notifications_active" : "notifications_off"}
      </span>
      <span className="hidden sm:inline">
        {soundEnabled ? "Chime ON" : "Chime Muted"}
      </span>
    </button>
  );
}
