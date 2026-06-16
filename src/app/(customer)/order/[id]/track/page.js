"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, MessageCircle, MapPin, Clock,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Navigation, Star, Shield, Loader2,
} from "lucide-react";
import useOrderStore from "@/stores/orderStore";

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

// Fake rider position that "moves" over time
function useRiderPosition(order) {
  const [position, setPosition] = useState({ lat: 19.1150, lng: 72.8410 });
  useEffect(() => {
    if (!["out_for_delivery", "picked_up"].includes(order?.status)) return;
    const iv = setInterval(() => {
      setPosition((p) => ({
        lat: p.lat + (Math.random() - 0.5) * 0.0005,
        lng: p.lng + (Math.random() - 0.5) * 0.0005,
      }));
    }, 3000);
    return () => clearInterval(iv);
  }, [order]);
  return position;
}

export default function TrackOrderPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentOrder: order, isLoading, fetchOrderById } = useOrderStore();
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [countdown, setCountdown] = useState(12 * 60); // 12 mins remaining

  useEffect(() => {
    fetchOrderById(id);
  }, [id, fetchOrderById]);

  const riderPos = useRiderPosition(order);
  const currentStepIdx = getStepIndex(order.status);

  useEffect(() => {
    const iv = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  if (isLoading || !order) {
    return (
      <div className="fixed inset-0 bg-bg-secondary flex items-center justify-center" style={{ zIndex: 40 }}>
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  const isDelivered = order.status === "delivered";
  const isLive = ["out_for_delivery", "picked_up"].includes(order.status);

  const mockRider = {
    name: "Rahul Sharma",
    phone: "9876512345",
    rating: 4.8,
    totalDeliveries: 1240,
    photo: null,
  };

  return (
    <div className="fixed inset-0 bg-bg-secondary flex flex-col" style={{ zIndex: 40 }}>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Gradient map placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-blue-50">
          {/* Grid lines to simulate map */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Simulated roads */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="40%" x2="100%" y2="45%" stroke="#e2e8f0" strokeWidth="6" />
            <line x1="0" y1="65%" x2="100%" y2="60%" stroke="#e2e8f0" strokeWidth="4" />
            <line x1="30%" y1="0" x2="35%" y2="100%" stroke="#e2e8f0" strokeWidth="8" />
            <line x1="65%" y1="0" x2="60%" y2="100%" stroke="#e2e8f0" strokeWidth="5" />
            <line x1="0" y1="20%" x2="100%" y2="22%" stroke="#f1f5f9" strokeWidth="3" />
          </svg>

          {/* Restaurant marker */}
          <div className="absolute top-[38%] left-[30%] -translate-x-1/2 -translate-y-full">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-lg">🍽️</span>
              </div>
              <div className="bg-white text-xs font-semibold text-text-primary px-2 py-0.5 rounded-full shadow mt-1 whitespace-nowrap">
                {order.restaurant.name}
              </div>
              <div className="w-0.5 h-2 bg-primary mt-0.5" />
            </div>
          </div>

          {/* Destination marker */}
          <div className="absolute top-[62%] left-[65%] -translate-x-1/2 -translate-y-full">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin size={20} className="text-white" />
              </div>
              <div className="bg-white text-xs font-semibold text-text-primary px-2 py-0.5 rounded-full shadow mt-1">
                Your location
              </div>
              <div className="w-0.5 h-2 bg-success mt-0.5" />
            </div>
          </div>

          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polyline
              points="30%,38% 45%,40% 55%,45% 60%,50% 65%,62%"
              fill="none"
              stroke="#FF5722"
              strokeWidth="3"
              strokeDasharray="8,5"
              strokeLinecap="round"
            />
          </svg>

          {/* Rider marker (animated) */}
          {isLive && (
            <div
              className="absolute transition-all duration-3000"
              style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
            >
              <div className="relative">
                <div className="absolute -inset-3 bg-primary/20 rounded-full animate-ping" />
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-primary z-10 relative">
                  <span className="text-xl">🛵</span>
                </div>
              </div>
            </div>
          )}
        </div>

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
        {!isDelivered && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white rounded-[var(--radius-full)] shadow-lg px-4 py-2 flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-extrabold text-text-primary tabular-nums">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
            <span className="text-xs text-text-tertiary">mins away</span>
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
            <Link href={`/orders/${order._id}`} className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
              Details <ChevronDown size={12} className="-rotate-90" />
            </Link>
          </div>

          {/* Rider info (shown when out for delivery) */}
          {isLive && (
            <div className="flex items-center gap-3 bg-bg-secondary rounded-[var(--radius-xl)] px-4 py-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold shrink-0">
                {mockRider.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary">{mockRider.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star size={11} className="text-warning fill-warning" />
                  <span className="text-xs text-text-secondary font-medium">{mockRider.rating}</span>
                  <span className="text-text-tertiary text-xs">· {mockRider.totalDeliveries.toLocaleString()} deliveries</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${mockRider.phone}`}
                  className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Phone size={16} className="text-primary" />
                </a>
                <button className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <MessageCircle size={16} className="text-primary" />
                </button>
              </div>
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
