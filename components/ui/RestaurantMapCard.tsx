"use client";

import React from "react";

type Props = {
  name?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
  className?: string;
};

export function RestaurantMapCard({
  name = "Maison Aurelia",
  address = "15 Place Vendôme, 75001 Paris, France",
  latitude = 48.8675,
  longitude = 2.3294,
  title = "Visit Us & Directions",
  className = "",
}: Props) {
  const displayAddress = address || "15 Place Vendôme, 75001 Paris, France";
  const lat = latitude ?? 48.8675;
  const lng = longitude ?? 2.3294;

  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div
      className={`rounded-2xl bg-surface-container-low border border-outline-variant/30 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            location_on
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            {title}
          </h3>
        </div>
        <span className="text-[11px] font-bold text-primary font-mono">
          Google Maps
        </span>
      </div>

      {/* Interactive Map Embed (Keyless) */}
      <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container">
        <iframe
          title={`${name} Map`}
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          loading="lazy"
          className="border-0 w-full h-full"
          allowFullScreen={false}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Address & 1-Click Directions Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-start gap-2 min-w-0">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0 mt-0.5">
            storefront
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-on-surface truncate">
              {name}
            </span>
            <span className="text-[11px] text-on-surface-variant leading-snug">
              {displayAddress}
            </span>
          </div>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:brightness-110 active:scale-[0.98] transition-all shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            directions
          </span>
          <span>Get Directions</span>
        </a>
      </div>
    </div>
  );
}
