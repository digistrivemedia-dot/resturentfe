"use client";

import { useState } from "react";
import { Navigation, Search, X } from "lucide-react";
import useLocationStore from "@/stores/locationStore";

export default function LocationSelector({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [detectLoading, setDetectLoading] = useState(false);
  const { setCurrentLocation } = useLocationStore();

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported in this browser.");
      return;
    }
    setDetectLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          area: "Current Location",
          city: "Nearby",
          fullAddress: "Using GPS location",
        };
        setCurrentLocation(loc);
        onSelect?.(loc);
        onClose?.();
        setDetectLoading(false);
      },
      () => {
        setDetectLoading(false);
        alert("Could not detect location. Please allow location access in browser settings.");
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-0" style={{ maxHeight: "80vh" }}>

      {/* Search bar */}
      <div className="px-1 pb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your area, street, city..."
            className="w-full h-11 pl-10 pr-10 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 focus:bg-white transition-colors placeholder:text-text-tertiary"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Detect location */}
        <button
          onClick={handleDetectLocation}
          disabled={detectLoading}
          className="w-full flex items-center gap-3 px-1 py-3 hover:bg-bg-hover rounded-[var(--radius-md)] transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
            <Navigation size={18} className={`text-primary ${detectLoading ? "animate-spin" : ""}`} />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-primary">
              {detectLoading ? "Detecting…" : "Use current location"}
            </div>
            <div className="text-xs text-text-tertiary">Enable GPS for accurate delivery</div>
          </div>
        </button>
      </div>
    </div>
  );
}
