"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { updateRestaurantSettings, uploadMenuImage } from "@/lib/actions";
import type { Restaurant } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { DatabaseHealthCard } from "./DatabaseHealthCard";

export function SettingsForm({ restaurant }: { restaurant: Restaurant }) {
  const [name, setName] = useState(restaurant.name || "");
  const [tagline, setTagline] = useState(restaurant.tagline || "Fine Dining & Bar");
  const [currency, setCurrency] = useState(restaurant.currency || "EUR");
  const [logoUrl, setLogoUrl] = useState(restaurant.logo_url || "");
  const [taxRate, setTaxRate] = useState(String(Number(restaurant.tax_rate ?? 0.08) * 100));
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function processLogoFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file (PNG, JPG, WebP)", "error");
      return;
    }

    try {
      setUploadingLogo(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMenuImage(fd);
      if (res.error) {
        toast(res.error, "error");
      } else if (res.url) {
        setLogoUrl(res.url);
        toast("Brand logo uploaded successfully", "success");
      }
    } catch {
      toast("Error uploading logo", "error");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processLogoFile(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateRestaurantSettings({
        name: name.trim(),
        tagline: tagline.trim() || null,
        tax_rate: Number(taxRate) / 100,
        currency,
        logo_url: logoUrl.trim() || null,
        accent_color: "#C9A84C",
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
    <div className="max-w-3xl flex flex-col gap-8 pb-16">
      {/* Page Header & System Telemetry */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C] bg-[#C9A84C]/10 px-2.5 py-1 rounded-full border border-[#C9A84C]/25">
              Operations Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5ECD7] font-serif tracking-tight">
            Restaurant Settings & Branding
          </h1>
          <p className="text-sm text-[#F5ECD7]/60 mt-1">
            Configure your venue identity, display currency, and dining tax rules.
          </p>
        </div>

        {/* Compact Database Storage Bar */}
        <DatabaseHealthCard />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {/* Brand & Venue Identity */}
        <section className="bg-[#141210] p-6 sm:p-7 rounded-2xl border border-[#C9A84C]/20 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#C9A84C]/15 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C9A84C] text-[20px]">storefront</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5ECD7]">
                Venue & Brand Identity
              </h2>
            </div>
            <span className="text-xs text-[#C9A84C] font-serif">SAVORA Luxe</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#F5ECD7] block mb-1.5">
                Restaurant Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SAVORA"
                className="w-full bg-[#0c0b09] px-3.5 py-2.5 rounded-xl border border-[#C9A84C]/25 text-sm text-[#F5ECD7] focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#F5ECD7]/25"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#F5ECD7] block mb-1.5">
                Cuisine Subtitle / Tagline
              </label>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Fine Dining & Bar"
                className="w-full bg-[#0c0b09] px-3.5 py-2.5 rounded-xl border border-[#C9A84C]/25 text-sm text-[#F5ECD7] focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#F5ECD7]/25"
              />
              <span className="text-[11px] text-[#F5ECD7]/40 mt-1 block">
                Shown on table QR tent cards and guest menu headers
              </span>
            </div>
          </div>

          {/* Logo Uploader */}
          <div>
            <label className="text-xs font-semibold text-[#F5ECD7] block mb-2">
              Restaurant Logo
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Preview Avatar */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#0c0b09] border border-[#C9A84C]/30 shrink-0 flex items-center justify-center shadow-inner group">
                {logoUrl ? (
                  <>
                    <Image
                      src={logoUrl}
                      alt="Restaurant Logo"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="absolute inset-0 bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold"
                      title="Remove Logo"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="font-serif font-bold text-2xl text-[#C9A84C]/60">
                    {name ? name[0].toUpperCase() : "S"}
                  </span>
                )}
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 border-2 border-dashed rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  dragOver
                    ? "border-[#C9A84C] bg-[#C9A84C]/10"
                    : "border-[#C9A84C]/25 bg-[#0c0b09]/60 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 text-[#C9A84C] flex items-center justify-center shrink-0 border border-[#C9A84C]/20">
                    <span className="material-symbols-outlined text-[20px]">
                      {uploadingLogo ? "sync" : "cloud_upload"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#F5ECD7]">
                      {uploadingLogo ? "Uploading logo..." : "Click or drag logo image here"}
                    </p>
                    <p className="text-[11px] text-[#F5ECD7]/45">
                      Recommended square PNG, JPG, or WebP (max 5 MB)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={uploadingLogo}
                  className="px-3.5 py-1.5 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-xs font-bold text-[#C9A84C] hover:bg-[#C9A84C]/25 transition-colors shrink-0 disabled:opacity-50"
                >
                  {uploadingLogo ? "Uploading..." : "Browse"}
                </button>
              </div>
            </div>
          </div>

          {/* Active Palette Information (Replaces old color picker) */}
          <div className="bg-[#0c0b09] rounded-xl p-3.5 border border-[#C9A84C]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#C9A84C] text-[18px]">palette</span>
              <div>
                <p className="text-xs font-semibold text-[#F5ECD7]">Brand Luxury Palette</p>
                <p className="text-[11px] text-[#F5ECD7]/40">Active across Admin Console and Guest Menus</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 bg-[#141210] px-2.5 py-1 rounded-lg border border-[#C9A84C]/20 text-[11px] text-[#F5ECD7]/80 font-mono">
                <span className="w-3 h-3 rounded-full bg-[#141210] border border-[#C9A84C]/40 inline-block" />
                <span>Obsidian</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#141210] px-2.5 py-1 rounded-lg border border-[#C9A84C]/20 text-[11px] text-[#C9A84C] font-mono">
                <span className="w-3 h-3 rounded-full bg-[#C9A84C] inline-block" />
                <span>Gold</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#141210] px-2.5 py-1 rounded-lg border border-[#C9A84C]/20 text-[11px] text-[#F5ECD7] font-mono">
                <span className="w-3 h-3 rounded-full bg-[#F5ECD7] inline-block" />
                <span>Champagne</span>
              </div>
            </div>
          </div>
        </section>

        {/* Currency & Financials */}
        <section className="bg-[#141210] p-6 sm:p-7 rounded-2xl border border-[#C9A84C]/20 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#C9A84C]/15 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C9A84C] text-[20px]">payments</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5ECD7]">
                Currency & Fiscal Rules
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#F5ECD7] block mb-1.5">
                Display Currency
              </label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#0c0b09] px-3.5 py-2.5 rounded-xl border border-[#C9A84C]/25 text-sm text-[#F5ECD7] focus:outline-none focus:border-[#C9A84C] font-mono font-medium appearance-none cursor-pointer"
                >
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="CHF">CHF (Fr) — Swiss Franc</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A84C] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
              <span className="text-[11px] text-[#F5ECD7]/40 mt-1 block">
                Formats all guest order prices and totals
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#F5ECD7] block mb-1.5">
                Sales Tax / VAT Rate (%)
              </label>
              <div className="relative">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full bg-[#0c0b09] px-3.5 py-2.5 rounded-xl border border-[#C9A84C]/25 text-sm text-[#F5ECD7] focus:outline-none focus:border-[#C9A84C] font-mono font-medium pr-10"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#C9A84C]/70">
                  %
                </span>
              </div>
              <span className="text-[11px] text-[#F5ECD7]/40 mt-1 block">
                Applied automatically at checkout
              </span>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-5 rounded-xl bg-[#C9A84C] text-[#141210] font-bold text-xs shadow-[0_0_14px_rgba(201,168,76,0.12)] hover:bg-[#D4B553] disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">
              {saving ? "sync" : "save"}
            </span>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}


