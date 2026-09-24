"use client";

import { useEffect, useState } from "react";
import { getDatabaseHealth } from "@/lib/actions/health";
import type { DatabaseHealthData } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

export function DatabaseHealthCard() {
  const [data, setData] = useState<DatabaseHealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchHealth() {
      const res = await getDatabaseHealth();
      if (!active) return;
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setData(res.data);
      }
      setLoading(false);
    }
    fetchHealth();
    return () => {
      active = false;
    };
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-xl bg-[#141210] border border-[#C9A84C]/20 px-4 py-3">
        <div className="flex items-center gap-2.5 text-xs text-[#A89880]">
          <span className="material-symbols-outlined text-[16px] text-[#C9A84C]/60 animate-spin">
            progress_activity
          </span>
          <span className="font-mono">Reading database storage...</span>
        </div>
      </div>
    );
  }

  // ── Error / RPC not deployed ────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="rounded-xl bg-[#141210] border border-[#C9A84C]/15 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <span className="material-symbols-outlined text-[16px]">database</span>
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#F5ECD7]/80 uppercase tracking-wider block">
              Database Storage
            </span>
            <span className="text-[11px] text-amber-400/80 font-mono truncate block">
              RPC not deployed — run migration 0006 in Supabase SQL Editor
            </span>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[12px]">warning</span>
          Unavailable
        </span>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────
  const pct = Math.min(100, Math.max(1, Math.round((data.db_bytes / data.db_limit_bytes) * 100)));
  const freeBytes = Math.max(0, data.db_limit_bytes - data.db_bytes);

  return (
    <div className="rounded-xl bg-[#141210] border border-[#C9A84C]/20 px-4 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-3 text-xs mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#C9A84C]">
            <span className="material-symbols-outlined text-[16px]">database</span>
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#F5ECD7]">
              Database Storage
            </span>
          </div>
          <span className="text-[#C9A84C]/40 hidden sm:inline">·</span>
          <span className="font-mono text-[#F5ECD7] font-semibold text-xs">
            {formatBytes(data.db_bytes, 1)}
          </span>
          <span className="font-mono text-[#A89880] text-[11px]">/ 500 MB</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
          <span className="text-emerald-400 hidden sm:inline">
            {formatBytes(freeBytes, 0)} free
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1e1b17] border border-[#C9A84C]/20 text-[#C9A84C] font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {pct}%
          </span>
        </div>
      </div>

      {/* Slim 6px progress bar */}
      <div className="w-full h-1.5 rounded-full bg-[#0a0908] overflow-hidden border border-[#C9A84C]/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-[#C9A84C] to-[#E5C158] transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
