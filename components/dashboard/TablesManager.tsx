"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { createTable, deleteTable, updateTable } from "@/lib/actions";
import type { DiningTable } from "@/lib/types";
import { QRCodeModal } from "@/components/qr/QRCodeModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export function TablesManager({
  initialTables,
  appUrl,
  restaurantName = "Restaurant",
  restaurantTagline,
}: {
  initialTables: DiningTable[];
  appUrl: string;
  restaurantName?: string;
  restaurantTagline?: string | null;
}) {
  const [tables, setTables] = useState<DiningTable[]>(initialTables);
  const [label, setLabel] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [selectedQRTable, setSelectedQRTable] = useState<DiningTable | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiningTable | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function build() {
      const entries: Record<string, string> = {};
      for (const t of tables) {
        const url = `${appUrl}/t/${t.id}`;
        try {
          entries[t.id] = await QRCode.toDataURL(url, {
            margin: 1,
            width: 256,
            color: {
              dark: "#C9A84C",
              light: "#141210",
            },
          });
        } catch {
          /* ignore */
        }
      }
      if (!cancelled) setQrMap(entries);
    }
    build();
    return () => {
      cancelled = true;
    };
  }, [tables, appUrl]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;

    try {
      setIsCreating(true);
      const result = await createTable(label.trim(), "");
      if (result.error || !result.table) {
        toast(result.error ?? "Failed to create table", "error");
        return;
      }
      setTables((prev) => [...prev, result.table as DiningTable]);
      setLabel("");
      toast(`Table "${label.trim()}" created successfully`, "success");
    } catch {
      toast("Error creating table", "error");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleStatus(table: DiningTable) {
    const next = !table.is_active;
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, is_active: next } : t)));
    const res = await updateTable(table.id, { is_active: next });
    if (res?.error) {
      toast(res.error, "error");
      setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, is_active: !next } : t)));
    } else {
      toast(`${table.label} marked ${next ? "Active" : "Inactive"}`, "info");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await deleteTable(deleteTarget.id);
      if (res?.error) {
        toast(res.error, "error");
      } else {
        setTables((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        toast(`Table "${deleteTarget.label}" deleted`, "info");
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }



  return (
    <div className="flex flex-col gap-space-lg max-w-7xl w-full pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Table Management & QR Codes</h1>
        <p className="text-sm text-on-surface-variant">
          Generate unique, printable QR codes for each table. Guests scan the QR code to browse the menu and order directly to their table.
        </p>
      </div>

      {/* Add Table Form */}
      <form
        onSubmit={onCreate}
        className="bg-[#141210] rounded-2xl p-4 border border-[#C9A84C]/20 shadow-xs flex flex-col sm:flex-row gap-3 items-end"
      >
        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-[#F5ECD7] block mb-1">
            Table Label *
          </label>
          <input
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Table 12, Bar 04, Patio B"
            className="w-full bg-transparent px-3 py-2 rounded-xl border border-[#C9A84C]/20 text-sm text-[#F5ECD7] focus:outline-none focus:border-[#C9A84C] placeholder:text-[#F5ECD7]/30"
          />
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#C9A84C] text-[#141210] font-bold text-sm shadow-xs hover:bg-[#D4B553] disabled:opacity-50 transition-colors shrink-0"
        >
          {isCreating ? "Adding..." : "+ Add Table"}
        </button>
      </form>

      {/* Tables Display */}
      <div className="flex flex-col gap-6">
        {tables.length === 0 ? (
          <div className="bg-[#141210] rounded-2xl p-12 text-center text-[#F5ECD7]/60 text-sm border border-[#C9A84C]/20">
            No tables added yet. Add your first table above to generate its QR code.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((table) => {
              const url = `${appUrl}/t/${table.id}`;
              return (
                <article
                  key={table.id}
                  onClick={() => setSelectedQRTable(table)}
                  className="bg-[#141210] rounded-2xl p-4 border border-[#C9A84C]/20 shadow-xs flex flex-col justify-between gap-3.5 hover:border-[#C9A84C]/50 hover:shadow-[0_0_18px_rgba(201,168,76,0.1)] transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-[#F5ECD7] font-serif group-hover:text-[#C9A84C] transition-colors">
                      {table.label}
                    </h2>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(table);
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1 border ${
                        table.is_active
                          ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                      }`}
                    >
                      <span className="text-[8px]">{table.is_active ? "●" : "●"}</span>
                      {table.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {/* QR Thumbnail Preview - Square and Theme-Styled */}
                  <div
                    className="w-full max-w-[190px] aspect-square mx-auto bg-[#0d0c0a] p-2.5 rounded-2xl border border-[#C9A84C]/25 flex flex-col items-center justify-center relative overflow-hidden shrink-0 group-hover:border-[#C9A84C]/60 group-hover:shadow-[0_0_15px_rgba(201,168,76,0.15)] transition-all"
                  >
                    {qrMap[table.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrMap[table.id]}
                        alt={`QR for ${table.label}`}
                        className="w-32 h-32 object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center text-xs text-[#F5ECD7]/40">
                        Loading QR...
                      </div>
                    )}
                    <span className="text-[10px] text-[#C9A84C]/80 mt-1 font-medium group-hover:text-[#F5ECD7] transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">fullscreen</span>
                      Click to Enlarge / Print
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] text-[#C9A84C]/70 font-mono truncate px-1 text-center bg-[#C9A84C]/5 py-1 rounded-lg">
                      /t/{table.qr_slug}
                    </div>

                    {/* Action buttons: Beautiful, spacious Copy Link + Delete */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(url);
                          toast("Table menu link copied", "info");
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">link</span>
                        Copy Link
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(table);
                        }}
                        className="py-2 px-2.5 rounded-xl border border-red-500/25 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors flex items-center justify-center shrink-0"
                        title="Delete table"
                      >
                        <span className="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        open={!!selectedQRTable}
        table={selectedQRTable}
        restaurantName={restaurantName}
        restaurantTagline={restaurantTagline}
        appUrl={appUrl}
        onClose={() => setSelectedQRTable(null)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Table"
        description={`Are you sure you want to delete "${deleteTarget?.label}"? Any existing QR codes printed for this table will stop working.`}
        confirmLabel="Delete Table"
        cancelLabel="Cancel"
        danger
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
