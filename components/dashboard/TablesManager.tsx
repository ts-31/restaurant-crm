"use client";

import { useEffect, useMemo, useState } from "react";
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
}: {
  initialTables: DiningTable[];
  appUrl: string;
  restaurantName?: string;
}) {
  const [tables, setTables] = useState<DiningTable[]>(initialTables);
  const [label, setLabel] = useState("");
  const [section, setSection] = useState("");
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
          entries[t.id] = await QRCode.toDataURL(url, { margin: 1, width: 240 });
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
      const result = await createTable(label.trim(), section.trim());
      if (result.error || !result.table) {
        toast(result.error ?? "Failed to create table", "error");
        return;
      }
      setTables((prev) => [...prev, result.table as DiningTable]);
      setLabel("");
      setSection("");
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

  // Group tables by section
  const groupedTables = useMemo(() => {
    const map = new Map<string, DiningTable[]>();
    tables.forEach((t) => {
      const sec = t.section?.trim() || "Main Area";
      const existing = map.get(sec) || [];
      existing.push(t);
      map.set(sec, existing);
    });
    return map;
  }, [tables]);

  return (
    <div className="flex flex-col gap-space-lg max-w-6xl pb-12">
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
        className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row gap-3 items-end"
      >
        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-on-surface block mb-1">
            Table Label *
          </label>
          <input
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Table 12, Bar 04, Patio B"
            className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-on-surface block mb-1">
            Section / Floor Area
          </label>
          <input
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g. Indoor Dining, Terrace, Rooftop"
            className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
          />
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-xs hover:opacity-90 disabled:opacity-50 transition-all shrink-0"
        >
          {isCreating ? "Adding..." : "Add Table"}
        </button>
      </form>

      {/* Tables Display by Section */}
      <div className="flex flex-col gap-6">
        {tables.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-12 text-center text-on-surface-variant text-sm border border-outline-variant/30">
            No tables added yet. Add your first table above to generate its QR code.
          </div>
        ) : (
          Array.from(groupedTables.entries()).map(([secName, secTables]) => (
            <div key={secName} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {secName} ({secTables.length})
                </span>
                <div className="h-px flex-1 bg-outline-variant/20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {secTables.map((table) => {
                  const url = `${appUrl}/t/${table.id}`;
                  return (
                    <article
                      key={table.id}
                      className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-on-surface">{table.label}</h2>
                          <p className="text-xs text-on-surface-variant">{table.section || "General"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(table)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
                            table.is_active
                              ? "bg-secondary/15 text-secondary border border-secondary/20"
                              : "bg-error/10 text-error border border-error/20"
                          }`}
                        >
                          {table.is_active ? "Active" : "Inactive"}
                        </button>
                      </div>

                      {/* QR Thumbnail Preview */}
                      <div
                        onClick={() => setSelectedQRTable(table)}
                        className="bg-white p-3 rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
                      >
                        {qrMap[table.id] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={qrMap[table.id]}
                            alt={`QR for ${table.label}`}
                            className="w-36 h-36 object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                            Loading QR...
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 mt-1 font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">fullscreen</span>
                          Click to Enlarge / Print
                        </span>
                      </div>

                      <div className="text-[11px] text-on-surface-variant font-mono truncate px-1 text-center">
                        /t/{table.qr_slug}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedQRTable(table)}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-primary text-white text-xs font-semibold flex items-center justify-center gap-1 hover:opacity-90 shadow-xs transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[15px]">qr_code</span>
                          View QR
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            toast("Table menu link copied", "info");
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors"
                          title="Copy Table URL"
                        >
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(table)}
                          className="p-1.5 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete table"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        open={!!selectedQRTable}
        table={selectedQRTable}
        restaurantName={restaurantName}
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
