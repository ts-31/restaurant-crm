"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-space-md gap-space-lg">
      <div className="text-center">
        <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold">TableFlow</p>
        <h1 className="font-headline-md text-headline-md text-on-surface mt-1">Reset your password</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 max-w-sm">
          Enter your admin email and we&apos;ll send a password reset link.
        </p>
      </div>

      {sent ? (
        <div className="w-full max-w-md bg-secondary-container rounded-2xl px-6 py-5 text-center flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[40px]">mark_email_read</span>
          <p className="font-label-lg text-label-lg text-on-surface">Check your inbox</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            A reset link has been sent to <strong>{email}</strong>. It may take a minute to arrive.
          </p>
          <Link href="/login" className="mt-2 font-label-md text-label-md text-primary hover:underline">
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-space-md w-full max-w-md">
          <div className="flex flex-col gap-1">
            <label htmlFor="reset-email" className="font-label-md text-label-md text-on-surface-variant">
              Admin email
            </label>
            <input
              id="reset-email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest shadow-sm font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@restaurant.com"
              autoComplete="email"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-on-error-container bg-error-container px-3 py-2.5 rounded-lg">
              <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
              <p className="font-body-sm text-body-sm">{error}</p>
            </div>
          )}

          <button
            id="reset-submit"
            type="submit"
            disabled={loading}
            className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl font-label-lg text-label-lg shadow-md hover:brightness-110 active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </button>

          <div className="text-center">
            <Link href="/login" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}
