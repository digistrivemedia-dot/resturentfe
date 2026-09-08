"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Loader2, Maximize2, Minimize2 } from "lucide-react";

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
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
  );
  if (!res.ok) throw new Error("Reverse geocode failed");
  const data = await res.json();
  const addr = data.address || {};
  // Road/neighbourhood-level breakdown — more useful as a delivery address's
  // "area" line than the plain city/state pair below, which callers that
  // don't need that granularity can keep ignoring.
  const area = [
    addr.road || addr.pedestrian || addr.suburb,
    addr.city_district || addr.neighbourhood,
    addr.city || addr.town || addr.village,
    addr.state,
  ].filter(Boolean).join(", ");
  return {
    fullAddress: data.display_name || "",
    area,
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

// Leaflet renders into a fixed-size canvas at mount time — resizing the
// container afterwards (e.g. the expand/collapse toggle below) leaves the
// map visually stuck at the old size until something calls invalidateSize().
function ResizeHandler({ watch }) {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 260);
    return () => clearTimeout(id);
  }, [watch, map]);
  return null;
}

// MapContainer's center/zoom props are only ever read once, inside Leaflet's
// own mount callback — changing them on a later render does nothing (confirmed
// against react-leaflet's MapContainer source). Pages that start with no saved
// location (like a brand-new address) mount the map centered on DEFAULT_CENTER;
// without this, the very first pin the user places (GPS or a click) would be
// dropped correctly but the viewport would never move to show it — for anyone
// far from that default, the pin renders off-screen. Recenters exactly once,
// the first time a real lat/lng shows up; later drags/clicks are already
// within the visible viewport by definition, so re-centering on every change
// would just fight the user's own panning.
function RecenterOnFirstLocation({ lat, lng }) {
  const map = useMap();
  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (!hasCenteredRef.current && typeof lat === "number" && typeof lng === "number") {
      hasCenteredRef.current = true;
      map.setView([lat, lng], 16);
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationMapPicker({
  lat,
  lng,
  onLocationChange,
  resizable = false,
  hint = "Click on the map (or drag the pin) to set your restaurant's exact location",
}) {
  const hasLocation = typeof lat === "number" && typeof lng === "number";
  const [isResolving, setIsResolving] = useState(false);
  const [locateError, setLocateError] = useState("");
  const [expanded, setExpanded] = useState(false);

  // Guards against a slow, stale reverse-geocode response landing after a
  // newer one — without this, clicking/dragging the pin twice in quick
  // succession could let the FIRST click's (slower) response overwrite the
  // area/pincode fields after the second click's (faster) response already
  // filled them in correctly.
  const requestIdRef = useRef(0);

  const handlePick = useCallback(
    async (newLat, newLng) => {
      const requestId = ++requestIdRef.current;
      setIsResolving(true);
      setLocateError("");
      onLocationChange({ lat: newLat, lng: newLng });
      try {
        const geo = await reverseGeocode(newLat, newLng);
        if (requestId === requestIdRef.current) {
          onLocationChange({ lat: newLat, lng: newLng, ...geo });
        }
      } catch {
        // Marker/coordinates are already updated — reverse geocode is just a
        // convenience autofill, so a failure here shouldn't block the pin drop.
      } finally {
        if (requestId === requestIdRef.current) {
          setIsResolving(false);
        }
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
      <div
        className={`relative w-full rounded-[var(--radius-lg)] overflow-hidden border border-border-light transition-[height] duration-200 ${
          expanded ? "h-[480px]" : "h-64"
        }`}
      >
        <MapContainer center={center} zoom={hasLocation ? 16 : 12} scrollWheelZoom className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          <RecenterOnFirstLocation lat={lat} lng={lng} />
          {resizable && <ResizeHandler watch={expanded} />}
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

        {resizable && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="absolute top-3 right-3 z-[1000] flex items-center justify-center w-8 h-8 bg-white shadow-md border border-border-light rounded-full text-text-primary hover:bg-bg-secondary transition-colors"
            title={expanded ? "Minimize map" : "Maximize map"}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        )}

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
            hint
          )}
        </span>
      </div>
      {locateError && <p className="text-xs text-red-500">{locateError}</p>}
    </div>
  );
}
