"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import useLocationStore from "@/stores/locationStore";
import useAuthStore from "@/stores/authStore";

const LABEL_ICONS = { home: Home, work: Briefcase, other: MapPin };
const LABEL_COLORS = {
  home: "bg-primary-50 text-primary",
  work: "bg-success-light text-success",
  other: "bg-warning-light text-warning",
};

const getPincode = (address = {}) => {
  const match = String(address.pincode || address.postcode || "").match(/\d{6}/);
  return match?.[0] || "";
};

const getArea = (address = {}) =>
  [
    address.road || address.pedestrian || address.suburb,
    address.city_district || address.neighbourhood,
    address.city || address.town || address.village,
    address.state,
  ]
    .filter(Boolean)
    .join(", ");

const getPosition = () =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      enableHighAccuracy: true,
    });
  });

const toLocation = (addr) => ({
  _id: addr._id,
  label: addr.label,
  lat: addr.lat,
  lng: addr.lng,
  area: addr.pincode || addr.fullAddress,
  fullAddress: addr.fullAddress,
  landmark: addr.landmark || "",
  pincode: addr.pincode || "",
  source: "saved_address",
});

export default function LocationSelector({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [detectLoading, setDetectLoading] = useState(false);
  const [detectError, setDetectError] = useState("");
  const [detectedLocation, setDetectedLocation] = useState(null);
  const {
    currentLocation,
    savedAddresses,
    setCurrentLocation,
    setSavedAddresses,
  } = useLocationStore();
  const { user, isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    fetchMe()
      .then((freshUser) => {
        if (!cancelled && Array.isArray(freshUser?.addresses)) {
          setSavedAddresses(freshUser.addresses);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [fetchMe, isAuthenticated, setSavedAddresses]);

  const addresses = useMemo(() => {
    const userAddresses = user?.addresses || [];
    const userIds = new Set(userAddresses.map((addr) => addr._id));
    return [
      ...userAddresses,
      ...(savedAddresses || []).filter((addr) => !userIds.has(addr._id)),
    ];
  }, [savedAddresses, user?.addresses]);

  const filteredAddresses = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return addresses;

    return addresses.filter((addr) =>
      [
        addr.label,
        addr.fullAddress,
        addr.landmark,
        addr.pincode,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text))
    );
  }, [addresses, query]);

  const handleSelectAddress = (address) => {
    const loc = toLocation(address);
    setCurrentLocation(loc);
    onSelect?.(loc);
    onClose?.();
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setDetectError("GPS is not supported in this browser.");
      return;
    }

    setDetectLoading(true);
    setDetectError("");
    setDetectedLocation(null);

    try {
      const pos = await getPosition();
      const { latitude, longitude } = pos.coords;

      let fullAddress = `Latitude ${latitude.toFixed(5)}, Longitude ${longitude.toFixed(5)}`;
      let area = "Current Location";
      let pincode = "";

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        if (res.ok) {
          const data = await res.json();
          const address = data.address || {};
          area = getArea(address) || data.display_name || area;
          fullAddress = data.display_name || area || fullAddress;
          pincode = getPincode(address);
        }
      } catch {
        // Coordinates are still usable; show the fallback address above.
      }

      const loc = {
        lat: latitude,
        lng: longitude,
        area: pincode || area,
        city: area,
        fullAddress,
        pincode,
        source: "gps",
      };

      setDetectedLocation(loc);
      setCurrentLocation(loc);
      onSelect?.(loc);

      if (!pincode) {
        setDetectError("Location detected, but pincode was not found. You can still use this location.");
      }
    } catch (err) {
      if (err?.code === 1) {
        setDetectError("Location permission denied. Please allow access in browser settings.");
      } else {
        setDetectError("Could not detect location. Please try again.");
      }
    } finally {
      setDetectLoading(false);
    }
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
            placeholder="Search saved addresses..."
            className="w-full h-11 pl-10 pr-10 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 focus:bg-white transition-colors placeholder:text-text-tertiary"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 space-y-4">
        {/* Detect location */}
        <button
          onClick={handleDetectLocation}
          disabled={detectLoading}
          className="w-full flex items-center gap-3 px-1 py-3 hover:bg-bg-hover rounded-[var(--radius-md)] transition-colors group disabled:opacity-70"
        >
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
            {detectLoading ? (
              <Loader2 size={18} className="text-primary animate-spin" />
            ) : (
              <Navigation size={18} className="text-primary" />
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-primary">
              {detectLoading ? "Fetching your location..." : "Get current location"}
            </div>
            <div className="text-xs text-text-tertiary">Uses GPS and shows the detected pincode</div>
          </div>
        </button>

        {detectedLocation && (
          <div className="rounded-[var(--radius-lg)] border border-success/25 bg-success-light px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={17} className="text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-text-primary">Current location selected</p>
                  {detectedLocation.pincode && (
                    <span className="text-[11px] font-bold text-success bg-white px-2 py-0.5 rounded-full">
                      {detectedLocation.pincode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {detectedLocation.fullAddress}
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 h-8 px-3 text-xs font-bold text-white bg-success rounded-[var(--radius-md)] hover:bg-success-dark transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {detectError && (
          <div className="flex items-start gap-2 rounded-[var(--radius-md)] bg-warning-light border border-warning/20 px-3 py-2">
            <AlertCircle size={15} className="text-warning mt-0.5 shrink-0" />
            <p className="text-xs text-text-secondary leading-relaxed">{detectError}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-text-tertiary uppercase tracking-wide">
              Saved locations
            </p>
            {addresses.length > 0 && (
              <span className="text-[11px] text-text-tertiary">
                {addresses.length}
              </span>
            )}
          </div>

          {filteredAddresses.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-border-default px-4 py-6 text-center">
              <MapPin size={22} className="mx-auto text-text-tertiary mb-2" />
              <p className="text-sm font-semibold text-text-primary">
                {addresses.length === 0 ? "No saved locations yet" : "No saved location found"}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {addresses.length === 0
                  ? "Saved addresses will appear here after you add them."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAddresses.map((addr) => {
                const Icon = LABEL_ICONS[addr.label] || MapPin;
                const isSelected =
                  currentLocation?._id === addr._id ||
                  (
                    currentLocation?.source === "saved_address" &&
                    currentLocation?.fullAddress === addr.fullAddress
                  );

                return (
                  <button
                    key={addr._id}
                    onClick={() => handleSelectAddress(addr)}
                    className={`w-full text-left rounded-[var(--radius-lg)] border px-3 py-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary-50"
                        : "border-border-light hover:border-primary/50 hover:bg-bg-hover"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${LABEL_COLORS[addr.label] || LABEL_COLORS.other}`}>
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-text-primary capitalize">
                            {addr.label || "Address"}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold text-primary bg-white px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                          {addr.pincode && (
                            <span className="text-[10px] font-bold text-text-secondary bg-bg-secondary px-2 py-0.5 rounded-full">
                              {addr.pincode}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">
                          {addr.fullAddress}
                        </p>
                        {!addr.pincode && (
                          <p className="text-[11px] text-warning mt-1">
                            Pincode not added
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
