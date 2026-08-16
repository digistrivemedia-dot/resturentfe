"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft, Phone, MapPin, Clock,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Shield, Loader2, ExternalLink, HelpCircle,
} from "lucide-react";
import useOrderStore from "@/stores/orderStore";
import { connectSocket } from "@/lib/socket";

// Leaflet touches `window` at import time, so it can only run client-side —
// ssr: false keeps Next from trying to render it on the server.
const TrackingMap = dynamic(() => import("@/components/customer/TrackingMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-bg-secondary animate-pulse" />,
});

// Location older than this is treated as stale (Flash task likely gone stale
// or webhook stopped) rather than shown as if it were current.
const LOCATION_STALE_MS = 10 * 60 * 1000;

const STATUS_STEPS = [
  { key: "placed",           label: "Order Placed",         desc: "We received your order" },
  { key: "confirmed",        label: "Restaurant Accepted",  desc: "Restaurant confirmed your order" },
  { key: "preparing",        label: "Preparing Your Food",  desc: "Chef is cooking your meal" },
  { key: "ready",            label: "Ready for Pickup",     desc: "Waiting for delivery partner" },
  { key: "out_for_delivery", label: "Out for Delivery",     desc: "On the way to your location" },
  { key: "delivered",        label: "Delivered",            desc: "Enjoy your meal! 🎉" },
];

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key);

function getStepIndex(status) {
  const normalized = ["ready", "picked_up"].includes(status) ? "ready" : status;
  return STATUS_ORDER.indexOf(normalized);
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function TrackOrderPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentOrder: order, isLoading, fetchOrderById } = useOrderStore();
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null); // { durationSec, distanceMeters } from the real driving route

  // A single ticking clock, re-rendered every second. Countdown/elapsed time
  // are DERIVED from it below (not their own stateful counters) — this avoids
  // an entire class of "the interval silently stopped updating" bugs, since
  // there's nothing to get out of sync: every render recomputes both values
  // fresh from `now` and the order's real timestamps.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    fetchOrderById(id);
  }, [id, fetchOrderById]);

  // Socket: real-time order status + rider location updates
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const statusHandler = ({ order: updated }) => {
      if (updated._id === id || updated._id?.toString() === id) {
        useOrderStore.setState({ currentOrder: updated });
      }
    };
    const locationHandler = ({ orderId, location }) => {
      if (orderId === id || orderId?.toString() === id) {
        useOrderStore.setState((s) => s.currentOrder ? {
          currentOrder: {
            ...s.currentOrder,
            deliveryTracking: { ...s.currentOrder.deliveryTracking, currentLocation: location },
          },
        } : {});
      }
    };

    socket.on("order_status_updated", statusHandler);
    socket.on("order_location_updated", locationHandler);
    return () => {
      socket.off("order_status_updated", statusHandler);
      socket.off("order_location_updated", locationHandler);
    };
  }, [id]);

  // Countdown/elapsed time — derived fresh from `now` on every tick. Prefers
  // the real driving-route duration (from the map's OSRM lookup) once it's
  // loaded, falls back to the order's stored estimate until then.
  const isDeliveredNow = order?.status === "delivered";
  let countdown = null;
  let elapsedTime = null;
  if (order && isDeliveredNow) {
    const placed = new Date(order.createdAt).getTime();
    const delivered = order.deliveryTracking?.deliveredAt
      ? new Date(order.deliveryTracking.deliveredAt).getTime()
      : now;
    elapsedTime = Math.round((delivered - placed) / 60000);
    countdown = 0;
  } else if (order) {
    const estimatedMins = routeInfo?.durationSec
      ? Math.ceil(routeInfo.durationSec / 60)
      : order.estimatedDeliveryTime || 35;
    const deadline = new Date(order.createdAt).getTime() + estimatedMins * 60 * 1000;
    countdown = Math.max(0, Math.floor((deadline - now) / 1000));
  }

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  // Date.now() belongs in an effect, not render — a render must be pure.
  const rawLocation = order?.deliveryTracking?.currentLocation;
  const [riderLocation, setRiderLocation] = useState(null);
  useEffect(() => {
    Promise.resolve().then(() => {
      const isFresh = rawLocation?.lat && rawLocation?.updatedAt &&
        Date.now() - new Date(rawLocation.updatedAt).getTime() < LOCATION_STALE_MS;
      setRiderLocation(isFresh ? { lat: rawLocation.lat, lng: rawLocation.lng } : null);
    });
  }, [rawLocation?.lat, rawLocation?.lng, rawLocation?.updatedAt]);

  const mins = countdown ? Math.floor(countdown / 60) : 0;
  const secs = countdown ? countdown % 60 : 0;
  if (isLoading || !order) {
    return (
      <div className="fixed inset-0 bg-bg-secondary flex items-center justify-center" style={{ zIndex: 40 }}>
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  const isDelivered = order.status === "delivered";
  const isLive = ["out_for_delivery", "picked_up"].includes(order.status);
  const flash = order.deliveryTracking?.flash;
  const riderAssigned = !!flash?.riderName;
  const dispatchFailed = !!flash?.dispatchFailedReason;

  return (
    <div className="fixed inset-0 bg-bg-secondary flex flex-col" style={{ zIndex: 40 }}>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        <TrackingMap
          restaurant={{ lat: order.restaurant.address?.lat, lng: order.restaurant.address?.lng }}
          restaurantName={order.restaurant.name}
          destination={{ lat: order.deliveryAddress.lat, lng: order.deliveryAddress.lng }}
          riderLocation={isLive ? riderLocation : null}
          onRouteInfo={setRouteInfo}
        />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-bg-hover transition-colors"
          >
            <ArrowLeft size={18} className="text-text-primary" />
          </button>
        </div>

        {/* Live badge */}
        {isLive && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-white text-xs font-bold text-error px-3 py-1.5 rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            LIVE
          </div>
        )}

        {/* ETA floating card */}
        {!isDelivered && countdown !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white rounded-[var(--radius-full)] shadow-lg px-4 py-2 flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-extrabold text-text-primary tabular-nums">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
            <span className="text-xs text-text-tertiary">mins away</span>
          </div>
        )}
        {isDelivered && elapsedTime !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-success text-white rounded-[var(--radius-full)] shadow-lg px-4 py-2 flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span className="text-sm font-extrabold tabular-nums">Delivered in {elapsedTime} mins</span>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className={`bg-white rounded-t-[var(--radius-2xl)] shadow-[var(--shadow-xl)] transition-all duration-300 ${
        sheetExpanded ? "max-h-[75vh] overflow-y-auto" : "max-h-[50vh]"
      }`}>

        {/* Sheet handle + toggle */}
        <button
          onClick={() => setSheetExpanded(!sheetExpanded)}
          className="w-full flex flex-col items-center pt-3 pb-1 hover:bg-bg-hover/30 transition-colors rounded-t-[var(--radius-2xl)]"
        >
          <div className="w-10 h-1 bg-border-default rounded-full" />
          <div className="flex items-center gap-1 mt-1 text-text-tertiary">
            {sheetExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            <span className="text-xs">{sheetExpanded ? "Show less" : "Show more"}</span>
          </div>
        </button>

        <div className="px-4 pb-6">

          {/* Current status headline */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-text-primary">
                {STATUS_STEPS[currentStepIdx]?.label || "Processing"}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {STATUS_STEPS[currentStepIdx]?.desc}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href={`/orders/${order._id}/support`} className="text-xs text-text-secondary font-semibold hover:text-primary flex items-center gap-1">
                <HelpCircle size={13} /> Help
              </Link>
              <Link href={`/orders/${order._id}`} className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
                Details <ChevronDown size={12} className="-rotate-90" />
              </Link>
            </div>
          </div>

          {/* Rider info (shown when out for delivery) */}
          {isLive && riderAssigned && (
            <div className="flex items-center gap-3 bg-bg-secondary rounded-[var(--radius-xl)] px-4 py-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold shrink-0">
                {flash.riderName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary">{flash.riderName}</p>
                <p className="text-xs text-text-tertiary mt-0.5">Your delivery partner</p>
              </div>
              <div className="flex gap-2">
                {flash.riderContact && (
                  <a
                    href={`tel:${flash.riderContact}`}
                    className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Phone size={16} className="text-primary" />
                  </a>
                )}
                {flash.trackingUrl && (
                  <a
                    href={flash.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                    title="View live map"
                  >
                    <ExternalLink size={16} className="text-primary" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Waiting for rider assignment */}
          {isLive && !riderAssigned && !dispatchFailed && (
            <div className="flex items-center gap-3 bg-bg-secondary rounded-[var(--radius-xl)] px-4 py-3 mb-4">
              <Loader2 size={18} className="text-primary animate-spin shrink-0" />
              <p className="text-sm text-text-secondary">Finding a delivery partner for you...</p>
            </div>
          )}

          {/* Dispatch failed */}
          {dispatchFailed && !riderAssigned && (
            <div className="flex items-center gap-3 bg-error-light rounded-[var(--radius-xl)] px-4 py-3 mb-4">
              <AlertCircle size={18} className="text-error shrink-0" />
              <p className="text-sm text-error-dark">No delivery partner available right now. The restaurant has been notified.</p>
            </div>
          )}

          {/* Status timeline (expanded) */}
          {sheetExpanded && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Order Timeline</p>
              <div className="relative">
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border-light" />
                <div className="space-y-4">
                  {STATUS_STEPS.map((step, idx) => {
                    const done = idx < currentStepIdx;
                    const active = idx === currentStepIdx;
                    const histEntry = order.statusHistory.find((h) =>
                      h.status === step.key || (step.key === "out_for_delivery" && ["out_for_delivery", "picked_up"].includes(h.status))
                    );

                    return (
                      <div key={step.key} className="flex items-start gap-3 relative">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                          done ? "bg-success border-success" :
                          active ? "bg-white border-primary" :
                          "bg-white border-border-light"
                        }`}>
                          {done ? <CheckCircle2 size={12} className="text-white" strokeWidth={3} /> :
                           active ? <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> : null}
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-semibold ${done ? "text-success" : active ? "text-primary" : "text-text-tertiary"}`}>
                              {step.label}
                            </p>
                            {histEntry && (
                              <span className="text-xs text-text-tertiary">{formatTime(histEntry.timestamp)}</span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${active ? "text-text-secondary" : "text-text-tertiary"}`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Delivery address */}
          <div className="flex items-start gap-3 bg-bg-secondary rounded-[var(--radius-lg)] px-3 py-3 mb-4">
            <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">Delivering to</p>
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{order.deliveryAddress.fullAddress}</p>
              {order.deliveryAddress.landmark && (
                <p className="text-xs text-text-tertiary mt-0.5">Near {order.deliveryAddress.landmark}</p>
              )}
            </div>
          </div>

          {/* Trust note */}
          <div className="flex items-center justify-center gap-2 text-xs text-text-tertiary">
            <Shield size={12} className="text-success" />
            Contactless delivery available
          </div>
        </div>
      </div>
    </div>
  );
}
