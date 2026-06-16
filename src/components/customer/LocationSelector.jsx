"use client";

import { useState } from "react";
import { MapPin, Navigation, Search, X, Home, Briefcase, CheckCircle2 } from "lucide-react";
import useLocationStore from "@/stores/locationStore";

const SAVED_ADDRESSES = [
  { _id: "addr_001", label: "home", fullAddress: "B-204, Sunrise Apartments, Andheri West", area: "Andheri West", city: "Mumbai" },
  { _id: "addr_002", label: "work", fullAddress: "5th Floor, Tech Park, BKC", area: "BKC", city: "Mumbai" },
];

const POPULAR_CITIES = [
  { city: "Mumbai", area: "All of Mumbai", lat: 19.076, lng: 72.8777 },
  { city: "Delhi", area: "All of Delhi", lat: 28.6139, lng: 77.209 },
  { city: "Bangalore", area: "All of Bangalore", lat: 12.9716, lng: 77.5946 },
  { city: "Hyderabad", area: "All of Hyderabad", lat: 17.385, lng: 78.4867 },
  { city: "Chennai", area: "All of Chennai", lat: 13.0827, lng: 80.2707 },
  { city: "Pune", area: "All of Pune", lat: 18.5204, lng: 73.8567 },
];

const labelIcons = { home: Home, work: Briefcase };

export default function LocationSelector({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [detectLoading, setDetectLoading] = useState(false);
  const { currentLocation, setCurrentLocation } = useLocationStore();

  const handleDetectLocation = () => {
    setDetectLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          area: "Current Location",
          city: "Detected",
          fullAddress: "Using GPS location",
        };
        setCurrentLocation(loc);
        onSelect?.(loc);
        onClose?.();
        setDetectLoading(false);
      },
      () => {
        setDetectLoading(false);
        alert("Could not detect location. Please allow location access.");
      }
    );
  };

  const handleSelectCity = (city) => {
    const loc = { ...city, fullAddress: city.area + ", " + city.city };
    setCurrentLocation(loc);
    onSelect?.(loc);
    onClose?.();
  };

  const handleSelectSaved = (addr) => {
    const loc = { lat: 19.076, lng: 72.8777, area: addr.area, city: addr.city, fullAddress: addr.fullAddress };
    setCurrentLocation(loc);
    onSelect?.(loc);
    onClose?.();
  };

  const filtered = POPULAR_CITIES.filter(
    (c) => !query || c.city.toLowerCase().includes(query.toLowerCase())
  );

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
            <div className="text-sm font-semibold text-primary">Use current location</div>
            <div className="text-xs text-text-tertiary">Enable GPS for accurate delivery</div>
          </div>
        </button>

        {/* Saved addresses */}
        {!query && (
          <>
            <div className="mt-4 mb-2">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-1">Saved Addresses</p>
            </div>
            {SAVED_ADDRESSES.map((addr) => {
              const Icon = labelIcons[addr.label] || MapPin;
              const isActive = currentLocation?.fullAddress === addr.fullAddress;
              return (
                <button
                  key={addr._id}
                  onClick={() => handleSelectSaved(addr)}
                  className="w-full flex items-center gap-3 px-1 py-3 hover:bg-bg-hover rounded-[var(--radius-md)] transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-primary-100" : "bg-bg-secondary group-hover:bg-bg-tertiary"} transition-colors`}>
                    <Icon size={18} className={isActive ? "text-primary" : "text-text-secondary"} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className={`text-sm font-semibold capitalize ${isActive ? "text-primary" : "text-text-primary"}`}>
                      {addr.label}
                    </div>
                    <div className="text-xs text-text-tertiary truncate">{addr.fullAddress}</div>
                  </div>
                  {isActive && <CheckCircle2 size={18} className="text-primary shrink-0" />}
                </button>
              );
            })}
          </>
        )}

        {/* Popular cities / search results */}
        <div className="mt-4 mb-2">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-1">
            {query ? "Search Results" : "Popular Cities"}
          </p>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-6">No results for &quot;{query}&quot;</p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.city}
              onClick={() => handleSelectCity(c)}
              className="w-full flex items-center gap-3 px-1 py-3 hover:bg-bg-hover rounded-[var(--radius-md)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center shrink-0 group-hover:bg-bg-tertiary transition-colors">
                <MapPin size={18} className="text-text-secondary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-text-primary">{c.city}</div>
                <div className="text-xs text-text-tertiary">{c.area}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
