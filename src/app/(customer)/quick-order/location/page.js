"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Navigation, Loader2, CheckCircle2,
  ChevronRight, AlertCircle, Home, Briefcase,
} from "lucide-react";
import useAuthStore from "@/stores/authStore";
import useLocationStore from "@/stores/locationStore";
import RestaurantCard from "@/components/customer/RestaurantCard";
import { CardSkeleton } from "@/components/ui";
import api from "@/lib/api";

const LABEL_ICONS = { home: Home, work: Briefcase };

const getPincode = (address = {}) => {
  const match = String(address.postcode || "").match(/\d{6}/);
  return match?.[0] || "";
};

export default function QuickOrderLocationPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { setCurrentLocation } = useLocationStore();

  const [status, setStatus] = useState("idle"); // idle | detecting | detected | denied | error
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [selected, setSelected] = useState(null); // { type: "current" | "saved" | "manual", data }
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualPincode, setManualPincode] = useState("");
  const [manualError, setManualError] = useState("");

  const [restaurants, setRestaurants] = useState([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);

  const savedAddresses = user?.addresses || [];

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const a = data.address || {};
          const pincode = getPincode(a);
          const area = [
            a.road || a.pedestrian || a.suburb,
            a.city_district || a.neighbourhood,
          ].filter(Boolean).join(", ");
          const city = a.city || a.town || a.village || "";

          const loc = {
            lat: latitude,
            lng: longitude,
            area: area || data.display_name || "Current Location",
            city,
            pincode,
            fullAddress: data.display_name || "",
          };
          setDetectedLocation(loc);
          setSelected({ type: "current", data: loc });
          setStatus("detected");
        } catch {
          const loc = { lat: latitude, lng: longitude, area: "Current Location", city: "", pincode: "", fullAddress: "" };
          setDetectedLocation(loc);
          setSelected({ type: "current", data: loc });
          setStatus("detected");
        }
      },
      (err) => {
        setStatus(err.code === 1 ? "denied" : "error");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectSaved = (addr) => {
    setSelected({ type: "saved", data: addr });
  };

  const handleManualSubmit = () => {
    const trimmed = manualPincode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setManualError("Enter a valid 6-digit pincode");
      return;
    }
    setManualError("");
    setSelected({ type: "manual", data: { pincode: trimmed, area: `Pincode ${trimmed}`, city: "", lat: null, lng: null, fullAddress: "" } });
    setShowManualEntry(false);
  };

  const fetchNearbyRestaurants = async (lat, lng) => {
    setIsLoadingRestaurants(true);
    try {
      const params = new URLSearchParams();
      if (lat) params.set("lat", lat);
      if (lng) params.set("lng", lng);
      const res = await api.get(`/home/feed?${params.toString()}`);
      setRestaurants(res.data.restaurants || []);
    } catch {
      setRestaurants([]);
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  // As soon as a location is picked (current/saved/manual) — save it and show restaurants
  // right on this page, no extra "Continue" step.
  useEffect(() => {
    if (!selected) return;
    const { type, data } = selected;

    const location = type === "saved"
      ? {
          lat: data.lat ?? null,
          lng: data.lng ?? null,
          area: data.fullAddress || data.label,
          city: "",
          pincode: data.pincode || "",
          fullAddress: data.fullAddress || "",
        }
      : {
          lat: data.lat ?? null,
          lng: data.lng ?? null,
          area: data.area,
          city: data.city || "",
          pincode: data.pincode || "",
          fullAddress: data.fullAddress || data.area,
        };

    setCurrentLocation(location);
    fetchNearbyRestaurants(location.lat, location.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const isSelected = (type, key) => selected?.type === type && (type !== "saved" || selected.data._id === key);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="pt-8 pb-6 px-5 text-center">
        <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3">
          <Image src="/logo.png" alt="Sri Isha Cafe" width={56} height={56} className="w-full h-full object-cover" priority />
        </div>
        <h1 className="text-xl font-extrabold text-text-primary">Where should we deliver?</h1>
        <p className="text-sm text-text-secondary mt-1">We need your location to show food near you</p>
      </div>

      <div className="flex-1 px-5 max-w-md w-full mx-auto space-y-5 pb-8">
        {/* Current location detection */}
        <div>
          {status !== "detected" && (
            <button
              onClick={detectLocation}
              disabled={status === "detecting"}
              className="w-full flex items-center gap-3 p-4 rounded-[var(--radius-xl)] border-2 border-primary bg-primary-50 hover:bg-primary-50/70 transition-colors disabled:opacity-70"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                {status === "detecting" ? (
                  <Loader2 size={18} className="text-white animate-spin" />
                ) : (
                  <Navigation size={18} className="text-white" />
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-bold text-primary">
                  {status === "detecting" ? "Detecting your location…" : "Use my current location"}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">Fastest way to get started</p>
              </div>
            </button>
          )}

          {status === "detected" && detectedLocation && (
            <button
              onClick={() => setSelected({ type: "current", data: detectedLocation })}
              className={`w-full flex items-center gap-3 p-4 rounded-[var(--radius-xl)] border-2 transition-colors ${
                isSelected("current") ? "border-primary bg-primary-50" : "border-border-light hover:border-border-default"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Navigation size={18} className="text-white" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary">Current Location</p>
                <p className="text-xs text-text-secondary mt-0.5 truncate">
                  {detectedLocation.area}{detectedLocation.pincode ? ` · ${detectedLocation.pincode}` : ""}
                </p>
              </div>
              {isSelected("current") && <CheckCircle2 size={20} className="text-primary shrink-0" />}
            </button>
          )}

          {status === "denied" && (
            <div className="flex items-start gap-2.5 bg-warning-light border border-warning/20 rounded-[var(--radius-lg)] px-4 py-3 mt-2">
              <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-text-primary">Location permission denied</p>
                <p className="text-xs text-text-secondary mt-0.5">Allow location access in your browser settings, or enter your pincode manually below.</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-2.5 bg-error-light border border-error/20 rounded-[var(--radius-lg)] px-4 py-3 mt-2">
              <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary">Couldn&apos;t detect your location. Try again, or enter your pincode manually below.</p>
            </div>
          )}
        </div>

        {/* Restaurants for the selected location — appears right here, same screen */}
        {selected && (
          <div>
            <p className="text-xs font-bold text-text-tertiary uppercase tracking-wide mb-2">
              Restaurants near you
            </p>
            {isLoadingRestaurants ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-10 border border-border-light rounded-[var(--radius-xl)] bg-bg-secondary">
                <div className="text-3xl mb-2">🏪</div>
                <p className="text-text-primary font-semibold text-sm">No restaurants found nearby</p>
              </div>
            ) : (
              <div className="space-y-3">
                {restaurants.map((r) => (
                  <RestaurantCard key={r._id} restaurant={r} variant="horizontal" linkHref={`/quick-order/order-type?restaurant=${r.slug}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved addresses */}
        {isAuthenticated && savedAddresses.length > 0 && (
          <div>
            <p className="text-xs font-bold text-text-tertiary uppercase tracking-wide mb-2">Saved Addresses</p>
            <div className="space-y-2">
              {savedAddresses.map((addr) => {
                const Icon = LABEL_ICONS[addr.label] || MapPin;
                return (
                  <button
                    key={addr._id}
                    onClick={() => handleSelectSaved(addr)}
                    className={`w-full flex items-center gap-3 p-4 rounded-[var(--radius-xl)] border-2 transition-colors ${
                      isSelected("saved", addr._id) ? "border-primary bg-primary-50" : "border-border-light hover:border-border-default"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-text-secondary" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary capitalize">{addr.label}</p>
                      <p className="text-xs text-text-secondary mt-0.5 truncate">
                        {addr.fullAddress}{addr.pincode ? ` · ${addr.pincode}` : ""}
                      </p>
                    </div>
                    {isSelected("saved", addr._id) && <CheckCircle2 size={20} className="text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-center text-xs text-text-tertiary">
            <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link> to use a saved address
          </p>
        )}

        {/* Manual pincode entry */}
        <div>
          {!showManualEntry ? (
            <button
              onClick={() => setShowManualEntry(true)}
              className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline py-1"
            >
              Enter pincode manually <ChevronRight size={14} />
            </button>
          ) : (
            <div className="border border-border-light rounded-[var(--radius-xl)] p-4">
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Delivery Pincode</label>
              <div className="flex gap-2">
                <input
                  value={manualPincode}
                  onChange={(e) => setManualPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="e.g. 560087"
                  inputMode="numeric"
                  className="flex-1 h-11 px-3 text-sm border border-border-light rounded-[var(--radius-lg)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                <button
                  onClick={handleManualSubmit}
                  className="h-11 px-4 bg-primary text-white text-sm font-bold rounded-[var(--radius-lg)] hover:bg-primary-dark transition-colors shrink-0"
                >
                  Use
                </button>
              </div>
              {manualError && <p className="text-xs text-error mt-1.5">{manualError}</p>}
              {selected?.type === "manual" && (
                <p className="text-xs text-success font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Using pincode {selected.data.pincode}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
