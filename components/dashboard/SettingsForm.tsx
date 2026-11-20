"use client";

import { useEffect, useRef, useState } from "react";
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
  const [address, setAddress] = useState(restaurant.address || "15 Place Vendôme, 75001 Paris, France");
  const [latitude, setLatitude] = useState(String(restaurant.latitude ?? 48.8675));
  const [longitude, setLongitude] = useState(String(restaurant.longitude ?? 2.3294));
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addressContainerRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (addressContainerRef.current && !addressContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** Browser GPS → auto-fill lat/lng + reverse geocode physical address */
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast("Geolocation is not supported by your browser", "error");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);

        // Reverse geocode to resolve street address automatically
        try {
          const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
          const res = await fetch(revUrl, { headers: { "Accept-Language": "en" } });
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            toast("Location & full address detected!", "success");
          } else {
            toast("Coordinates detected! You can enter street address.", "success");
          }
        } catch {
          toast("Coordinates detected! You can enter street address.", "success");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        toast("Could not get location. Please allow browser location access.", "error");
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  }

  /** Handle typing address with debounced suggestions */
  function handleAddressInput(value: string) {
    setAddress(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingSuggestions(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value.trim())}&format=json&limit=5`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch {
        // ignore suggestion fetch errors silently
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 400);
  }

  function handleSelectSuggestion(item: { display_name: string; lat: string; lon: string }) {
    setAddress(item.display_name);
    setLatitude(parseFloat(item.lat).toFixed(6));
    setLongitude(parseFloat(item.lon).toFixed(6));
    setShowSuggestions(false);
    setSuggestions([]);
    toast("Address selected & coordinates updated!", "success");
  }

  /** Nominatim geocode: address → lat/lng (no API key) */
  async function handleGeocodeAddress() {
    if (!address.trim()) {
      toast("Please enter an address first", "error");
      return;
    }
    setGeocodeLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data && data.length > 0) {
        setLatitude(parseFloat(data[0].lat).toFixed(6));
        setLongitude(parseFloat(data[0].lon).toFixed(6));
        toast("Coordinates found and map updated!", "success");
      } else {
        toast("Address not found. Try a more specific address.", "error");
      }
    } catch {
      toast("Failed to geocode address. Check your internet connection.", "error");
    } finally {
      setGeocodeLoading(false);
    }
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
        address: address.trim() || null,
        latitude: parseFloat(latitude) || null,
        longitude: parseFloat(longitude) || null,
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

        {/* Venue Location & Google Maps */}
        <section className="bg-[#141210] p-6 sm:p-7 rounded-2xl border border-[#C9A84C]/20 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#C9A84C]/15 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C9A84C] text-[20px]">
                pin_drop
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5ECD7]">
                Restaurant Venue & Google Maps
              </h2>
            </div>
            <span className="text-xs text-[#C9A84C] font-mono">Live Navigation</span>
          </div>

          <div className="flex flex-col gap-4">
            <div ref={addressContainerRef} className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#F5ECD7] block">
                  Physical Address
                </label>
                {isSearchingSuggestions && (
                  <span className="text-[11px] text-[#C9A84C] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span>
                    Searching places...
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  value={address}
                  onChange={(e) => handleAddressInput(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="e.g. 15 Place Vendôme, 75001 Paris, France"
                  className="w-full bg-[#0c0b09] px-3.5 py-2.5 rounded-xl border border-[#C9A84C]/25 text-sm text-[#F5ECD7] focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#F5ECD7]/25"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-40 left-0 right-0 top-full mt-1.5 bg-[#141210] border border-[#C9A84C]/35 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                  <div className="px-3 py-1.5 bg-[#0c0b09]/80 border-b border-[#C9A84C]/15 text-[10px] uppercase font-bold tracking-wider text-[#C9A84C]">
                    Suggested Locations (Click to Select)
                  </div>
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left p-3 hover:bg-[#C9A84C]/15 transition-colors border-b border-[#C9A84C]/10 last:border-b-0 flex items-start gap-2.5 group cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[#C9A84C] text-[16px] shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        location_on
                      </span>
                      <span className="text-xs text-[#F5ECD7] group-hover:text-[#F5ECD7] line-clamp-2">
                        {item.display_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-detect Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={geoLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-xs font-bold text-[#C9A84C] hover:bg-[#C9A84C]/25 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {geoLoading ? "sync" : "my_location"}
                </span>
                {geoLoading ? "Detecting..." : "Use My Location"}
              </button>
              <button
                type="button"
                onClick={handleGeocodeAddress}
                disabled={geocodeLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c0b09] border border-[#C9A84C]/25 text-xs font-bold text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {geocodeLoading ? "sync" : "search"}
                </span>
                {geocodeLoading ? "Finding..." : "Find on Map"}
              </button>
            </div>

            {/* Quick City Presets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-[#F5ECD7]/60">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { city: "Paris (Place Vendôme)", lat: "48.8675", lng: "2.3294", addr: "15 Place Vendôme, 75001 Paris, France" },
                  { city: "Dubai (Downtown)", lat: "25.1972", lng: "55.2744", addr: "Downtown Dubai, UAE" },
                  { city: "London (Mayfair)", lat: "51.5098", lng: "-0.1478", addr: "Mayfair, London W1J 8AJ, UK" },
                  { city: "New York (SoHo)", lat: "40.7233", lng: "-74.0030", addr: "SoHo, New York, NY 10012, USA" },
                  { city: "Mumbai (Bandra)", lat: "19.0596", lng: "72.8295", addr: "Bandra West, Mumbai 400050, India" },
                ].map((preset) => (
                  <button
                    key={preset.city}
                    type="button"
                    onClick={() => {
                      setAddress(preset.addr);
                      setLatitude(preset.lat);
                      setLongitude(preset.lng);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0c0b09] border border-[#C9A84C]/25 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
                  >
                    {preset.city}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#F5ECD7] block mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-[#0c0b09] px-3.5 py-2.5 rounded-xl border border-[#C9A84C]/25 text-sm text-[#F5ECD7] focus:outline-none focus:border-[#C9A84C] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#F5ECD7] block mb-1.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-[#0c0b09] px-3.5 py-2.5 rounded-xl border border-[#C9A84C]/25 text-sm text-[#F5ECD7] focus:outline-none focus:border-[#C9A84C] font-mono"
                />
              </div>
            </div>

            {/* Live Interactive Map Preview */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[11px] font-semibold text-[#F5ECD7]/70">
                Live Google Maps Preview
              </span>
              <div className="w-full h-52 rounded-xl overflow-hidden border border-[#C9A84C]/25 bg-[#0c0b09]">
                <iframe
                  title="Google Maps Preview"
                  src={`https://maps.google.com/maps?q=${latitude || 48.8675},${longitude || 2.3294}&hl=en&z=15&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
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


