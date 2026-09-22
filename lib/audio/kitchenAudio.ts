let audioCtx: AudioContext | null = null;
let isUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  return audioCtx;
}

/**
 * Attempts to resume the AudioContext to bypass browser autoplay restrictions.
 */
export async function unlockAudio(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    isUnlocked = ctx.state === "running";
    return isUnlocked;
  } catch {
    return false;
  }
}

/**
 * Checks if the AudioContext is running without restrictions.
 */
export function checkIsAudioUnlocked(): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;
  return ctx.state === "running";
}

/**
 * Attaches one-time event listeners to unlock audio on first user touch/click.
 */
export function initAudioAutoUnlock(onUnlocked?: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleInteraction = async () => {
    const success = await unlockAudio();
    if (success) {
      removeListeners();
      if (onUnlocked) onUnlocked();
    }
  };

  const removeListeners = () => {
    window.removeEventListener("pointerdown", handleInteraction);
    window.removeEventListener("keydown", handleInteraction);
    window.removeEventListener("touchstart", handleInteraction);
  };

  window.addEventListener("pointerdown", handleInteraction, { passive: true });
  window.addEventListener("keydown", handleInteraction, { passive: true });
  window.addEventListener("touchstart", handleInteraction, { passive: true });

  return removeListeners;
}

// ─── Sound Synthesizer: Classic Brass Service Bell ────────────────────────────

/**
 * Classic Brass Service Bell (Double-strike "Ding-Ding!")
 * Uses physical-modeling synthesis: sharp clapper transient + brass resonance
 */
function synthesizeBrassBell(ctx: AudioContext, masterVolume: number) {
  const now = ctx.currentTime;
  const strikes = [now, now + 0.18]; // Double strike

  strikes.forEach((strikeTime) => {
    // Fundamental brass resonance (~1174Hz - D6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1174.66, strikeTime);

    // Overtone resonance (~2740Hz metallic overtone)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(2740, strikeTime);

    // High sparkle shimmer (~3950Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(3950, strikeTime);

    // Envelopes
    const v = Math.max(0.01, Math.min(masterVolume, 1));
    gain1.gain.setValueAtTime(v * 0.45, strikeTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, strikeTime + 1.2);

    gain2.gain.setValueAtTime(v * 0.25, strikeTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.8);

    gain3.gain.setValueAtTime(v * 0.15, strikeTime);
    gain3.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.4);

    // Connections
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(ctx.destination);
    gain2.connect(ctx.destination);
    gain3.connect(ctx.destination);

    osc1.start(strikeTime);
    osc2.start(strikeTime);
    osc3.start(strikeTime);

    osc1.stop(strikeTime + 1.25);
    osc2.stop(strikeTime + 0.85);
    osc3.stop(strikeTime + 0.45);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Plays the Classic Brass Service Bell alert.
 */
export async function playKitchenBell(volume = 0.85) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return; // Autoplay prevented
    }
  }

  synthesizeBrassBell(ctx, volume);
}
