"use client";

import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Loader2 } from "lucide-react";

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }; // Bangalore — used only when no location is set yet

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:34px;height:34px;border-radius:9999px 9999px 9999px 0;background:#FF5722;
    transform:rotate(45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  );
  if (!res.ok) throw new Error("Reverse geocode failed");
  const data = await res.json();
  const addr = data.address || {};
  return {
    fullAddress: data.display_name || "",
    city: addr.city || addr.town || addr.village || addr.county || "",
    state: addr.state || "",
    pincode: addr.postcode || "",
  };
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationMapPicker({ lat, lng, onLocationChange }) {
  const hasLocation = typeof lat === "number" && typeof lng === "number";
  const [isResolving, setIsResolving] = useState(false);
  const [locateError, setLocateError] = useState("");

  const handlePick = useCallback(
    async (newLat, newLng) => {
      setIsResolving(true);
      setLocateError("");
      onLocationChange({ lat: newLat, lng: newLng });
      try {
        const geo = await reverseGeocode(newLat, newLng);
        onLocationChange({ lat: newLat, lng: newLng, ...geo });
      } catch {
        // Marker/coordinates are already updated — reverse geocode is just a
        // convenience autofill, so a failure here shouldn't block the pin drop.
      } finally {
        setIsResolving(false);
      }
    },
    [onLocationChange]
  );

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Your browser doesn't support location detection");
      return;
    }
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => handlePick(pos.coords.latitude, pos.coords.longitude),
      () => setLocateError("Couldn't get your location — check browser permissions"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const center = hasLocation ? { lat, lng } : DEFAULT_CENTER;

  return (
    <div className="space-y-2">
      <div className="relative w-full h-64 rounded-[var(--radius-lg)] overflow-hidden border border-border-light">
        <MapContainer center={center} zoom={hasLocation ? 16 : 12} scrollWheelZoom className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          {hasLocation && (
            <Marker
              position={{ lat, lng }}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat: dLat, lng: dLng } = e.target.getLatLng();
                  handlePick(dLat, dLng);
                },
              }}
            />
          )}
        </MapContainer>

        <button
          type="button"
          onClick={useMyLocation}
          className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 bg-white shadow-md border border-border-light rounded-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-bg-secondary transition-colors"
        >
          <Crosshair size={13} className="text-[#FF5722]" /> Use my location
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-text-tertiary min-h-[16px]">
        <span>
          {isResolving ? (
            <span className="flex items-center gap-1.5"><Loader2 size={11} className="animate-spin" /> Looking up address…</span>
          ) : hasLocation ? (
            `Pin set at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
          ) : (
            "Click on the map (or drag the pin) to set your restaurant's exact location"
          )}
        </span>
      </div>
      {locateError && <p className="text-xs text-red-500">{locateError}</p>}
    </div>
  );
}
