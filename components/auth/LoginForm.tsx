"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTopLoader } from "@/components/ui/TopLoader";

export function LoginForm() {
  const router = useRouter();
  const { startLoading } = useTopLoader();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fillDemoCredentials = () => {
    setEmail("admin@gmail.com");
    setPassword("Admin@123");
  };

  useEffect(() => {
    const handleFillCredentials = () => {
      fillDemoCredentials();
    };

    window.addEventListener("fillDemoCredentials", handleFillCredentials);

    return () => {
      window.removeEventListener("fillDemoCredentials", handleFillCredentials);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    startLoading();
    const supabase = createClient();

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        if (signInError.message.toLowerCase().includes("invalid")) {
          throw new Error("Incorrect email or password. Please try again.");
        }
        throw signInError;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5 w-full">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="font-label-md text-label-md text-[#A89880] uppercase tracking-widest text-[10px]">
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          required
          className="w-full px-4 py-2.5 rounded-xl font-body-md text-body-md text-[#F5ECD7] placeholder:text-[#5A4A35] focus:outline-none transition-all"
          style={{
            background: "#0f0e0c",
            border: "1px solid rgba(201,168,76,0.2)",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@restaurant.com"
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="font-label-md text-label-md text-[#A89880] uppercase tracking-widest text-[10px]">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            className="w-full px-4 py-2.5 pr-12 rounded-xl font-body-md text-body-md text-[#F5ECD7] placeholder:text-[#5A4A35] focus:outline-none transition-all"
            style={{
              background: "#0f0e0c",
              border: "1px solid rgba(201,168,76,0.2)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89880] hover:text-[#C9A84C] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-[#E86C5D]/30" style={{ background: "rgba(232,108,93,0.08)" }}>
          <span className="material-symbols-outlined text-[#E86C5D] text-[18px] mt-0.5 shrink-0">error</span>
          <p className="font-body-sm text-body-sm text-[#F5A89A]">{error}</p>
        </div>
      )}

      <button
        id="login-submit"
        type="submit"
        disabled={loading}
        className="w-full min-h-[46px] rounded-xl font-label-lg text-label-lg font-semibold disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-1"
        style={{
          background: loading ? "#8B6914" : "#C9A84C",
          color: "#0f0e0c",
          boxShadow: "0 4px 20px rgba(201,168,76,0.25)",
        }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-[#0f0e0c]/40 border-t-[#0f0e0c] rounded-full animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign In to Dashboard"
        )}
      </button>

      <div className="text-center">
        <Link
          href="/forgot-password"
          className="font-label-sm text-label-sm text-[#A89880] hover:text-[#C9A84C] transition-colors"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}


