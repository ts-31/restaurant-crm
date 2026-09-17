"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { updateRestaurantSettings, uploadMenuImage } from "@/lib/actions";
import type { Restaurant } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";

const COLOR_PRESETS = [
  { label: "Terracotta", value: "#c1440e" },
  { label: "Warm Amber", value: "#d97706" },
  { label: "Deep Forest", value: "#15803d" },
  { label: "Teal Green", value: "#0d9488" },
  { label: "Royal Navy", value: "#1d4ed8" },
  { label: "Burgundy", value: "#9f1239" },
  { label: "Obsidian", value: "#18181b" },
];

export function SettingsForm({ restaurant }: { restaurant: Restaurant }) {
  const [name, setName] = useState(restaurant.name || "");
  const [currency, setCurrency] = useState(restaurant.currency || "EUR");
  const [logoUrl, setLogoUrl] = useState(restaurant.logo_url || "");
  const [accentColor, setAccentColor] = useState(restaurant.accent_color || "#c1440e");
  const [taxRate, setTaxRate] = useState(String(Number(restaurant.tax_rate ?? 0.08) * 100));
  const [tipRate, setTipRate] = useState(String(Number(restaurant.default_tip_rate ?? 0.15) * 100));
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMenuImage(fd);
      if (res.error) {
        toast(res.error, "error");
      } else if (res.url) {
        setLogoUrl(res.url);
        toast("Logo uploaded successfully", "success");
      }
    } catch {
      toast("Error uploading logo", "error");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateRestaurantSettings({
        name: name.trim(),
        tax_rate: Number(taxRate) / 100,
        default_tip_rate: Number(tipRate) / 100,
        currency,
        logo_url: logoUrl.trim() || null,
        accent_color: accentColor,
      });

      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Restaurant settings updated successfully", "success");
      }
    } catch {
      toast("Failed to update settings", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Restaurant Settings & Branding</h1>
        <p className="text-sm text-on-surface-variant">
          Configure branding, colors, currency, and dining tax rules.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {/* Identity & Branding Card */}
        <section className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface">
            Brand Identity
          </h2>

          <div>
            <label className="text-xs font-semibold text-on-surface block mb-1">
              Restaurant Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface block mb-1">
              Restaurant Logo
            </label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/40 shrink-0">
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/40 border border-outline-variant/30 shrink-0 font-bold text-lg">
                  {name ? name[0].toUpperCase() : "R"}
                </div>
              )}

              <div className="flex flex-col gap-1.5 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl border border-outline-variant/30 bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload</span>
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-error hover:bg-error/10 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Or paste external logo URL..."
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/20 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface block mb-1">
              Accent Theme Color
            </label>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setAccentColor(p.value)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    accentColor.toLowerCase() === p.value.toLowerCase()
                      ? "scale-110 ring-2 ring-offset-2 ring-primary"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: p.value }}
                  title={p.label}
                >
                  {accentColor.toLowerCase() === p.value.toLowerCase() && (
                    <span className="material-symbols-outlined text-white text-[14px]">check</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent p-0"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#c1440e"
                className="w-28 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* Currency & Financials */}
        <section className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface">
            Currency & Billing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Display Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary font-mono font-medium"
              >
                <option value="EUR">EUR (€) - Euros</option>
                <option value="USD">USD ($) - US Dollars</option>
                <option value="GBP">GBP (£) - British Pounds</option>
                <option value="CHF">CHF (Fr) - Swiss Franc</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Sales Tax Rate (%)
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Default Tip Rate (%)
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={tipRate}
                onChange={(e) => setTipRate(e.target.value)}
                className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-sm focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-6 rounded-xl bg-primary text-white font-semibold text-sm shadow-xs hover:opacity-95 disabled:opacity-50 transition-opacity self-start"
        >
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
