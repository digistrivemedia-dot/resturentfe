"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker images don't resolve correctly under webpack/Next's
// bundler — divIcons with emoji sidestep that entirely and match the app's
// existing marker style (used previously in the CSS-only placeholder map).
function emojiIcon(emoji, { bg = "#fff", ring = "#FF6B35", size = 38 } = {}) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:9999px;background:${bg};
      border:2px solid ${ring};display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);font-size:${size * 0.5}px;line-height:1;
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const restaurantIcon = emojiIcon("🍽️", { ring: "#FF6B35" });
const destinationIcon = emojiIcon("📍", { ring: "#22C55E" });
const riderIcon = emojiIcon("🛵", { ring: "#FF6B35", size: 34 });

// OSRM's free public demo routing server — no API key needed. Good enough for
// low/medium traffic; if this app's order volume grows, swap FetchRoute's URL
// for a self-hosted OSRM instance or a paid routing provider (same GeoJSON
// response shape from OSRM-compatible providers, so the swap is contained here).
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

async function fetchRoute(from, to) {
  // OSRM expects lng,lat order — opposite of how this app stores lat/lng.
  const url = `${OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Route lookup failed");
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("No route found");
  return {
    positions: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    durationSec: route.duration,
    distanceMeters: route.distance,
  };
}

// Keeps the map framed on whatever points are currently relevant (restaurant,
// destination, and the rider once we have a live position) as they change.
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(points, { padding: [48, 48] });
  }, [map, points]);
  return null;
}

function hasCoords(point) {
  return typeof point?.lat === "number" && typeof point?.lng === "number" &&
    !Number.isNaN(point.lat) && !Number.isNaN(point.lng);
}

export default function TrackingMap({ restaurant, destination, riderLocation, restaurantName, onRouteInfo }) {
  const [routePositions, setRoutePositions] = useState([]);
  const hasBothCoords = hasCoords(restaurant) && hasCoords(destination);
  const onRouteInfoRef = useRef(onRouteInfo);
  useEffect(() => {
    onRouteInfoRef.current = onRouteInfo;
  }, [onRouteInfo]);

  useEffect(() => {
    if (!hasBothCoords) return;
    let cancelled = false;
    fetchRoute(restaurant, destination)
      .then(({ positions, durationSec, distanceMeters }) => {
        if (cancelled) return;
        setRoutePositions(positions);
        onRouteInfoRef.current?.({ durationSec, distanceMeters });
      })
      .catch(() => {
        if (!cancelled) setRoutePositions([]);
      });
    return () => { cancelled = true; };
    // Deliberately keyed on the raw coordinates, not the restaurant/destination
    // object references — those get new identities on every parent re-render,
    // which would refetch the route (and hit the public OSRM server) far more
    // than the actual location has changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.lat, restaurant?.lng, destination?.lat, destination?.lng]);

  if (!hasBothCoords) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-sm text-text-tertiary px-6 text-center">
        Map isn&apos;t available for this order — this restaurant hasn&apos;t set up its map location yet.
      </div>
    );
  }

  const points = [
    [restaurant.lat, restaurant.lng],
    [destination.lat, destination.lng],
    ...(hasCoords(riderLocation) ? [[riderLocation.lat, riderLocation.lng]] : []),
  ];

  return (
    <MapContainer
      center={[restaurant.lat, restaurant.lng]}
      zoom={14}
      scrollWheelZoom
      zoomControl={false}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {routePositions.length > 0 && (
        <Polyline positions={routePositions} pathOptions={{ color: "#FF5722", weight: 4, dashArray: "8,6" }} />
      )}

      <Marker position={[restaurant.lat, restaurant.lng]} icon={restaurantIcon}>
        {restaurantName && (
          <Tooltip direction="top" offset={[0, -18]} permanent>{restaurantName}</Tooltip>
        )}
      </Marker>
      <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
        <Tooltip direction="top" offset={[0, -18]} permanent>Your location</Tooltip>
      </Marker>
      {riderLocation && (
        <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon} />
      )}

      <FitBounds points={points} />
    </MapContainer>
  );
}
