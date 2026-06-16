"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, MapPin, Clock, Phone, ChevronRight,
  Home, Package, Star, Share2, Download,
} from "lucide-react";

const ESTIMATED_MINUTES = 35;

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get("orderNumber") || "ORD-000";
  const orderId = searchParams.get("orderId");

  const [animStage, setAnimStage] = useState(0);
  const [countdown, setCountdown] = useState(ESTIMATED_MINUTES * 60);

  // Trigger entrance animations in sequence
  useEffect(() => {
    const t1 = setTimeout(() => setAnimStage(1), 100);
    const t2 = setTimeout(() => setAnimStage(2), 600);
    const t3 = setTimeout(() => setAnimStage(3), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Live countdown
  useEffect(() => {
    const iv = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const eta = new Date(Date.now() + countdown * 1000);
  const etaStr = eta.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const ORDER_STEPS = [
    { label: "Order Placed", done: true, active: false },
    { label: "Restaurant Accepted", done: false, active: true },
    { label: "Preparing", done: false, active: false },
    { label: "Out for Delivery", done: false, active: false },
    { label: "Delivered", done: false, active: false },
  ];

  return (
    <div className="py-6 max-w-lg mx-auto space-y-5">

      {/* Success Hero */}
      <div
        className={`text-center transition-all duration-700 ${
          animStage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Animated checkmark ring */}
        <div className="relative w-28 h-28 mx-auto mb-5">
          {/* Outer pulse rings */}
          <span className="absolute inset-0 rounded-full bg-success/10 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-success/15" />
          <div className="absolute inset-0 rounded-full bg-success flex items-center justify-center shadow-[0_0_32px_rgba(34,197,94,0.4)]">
            <CheckCircle2 size={52} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-text-primary mb-1">Order Placed!</h1>
        <p className="text-text-secondary text-sm">
          Your order has been confirmed and is being prepared
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-bg-secondary px-4 py-2 rounded-[var(--radius-full)]">
          <Package size={14} className="text-primary" />
          <span className="text-sm font-bold text-text-primary">{orderNumber}</span>
        </div>
      </div>

      {/* ETA Card */}
      <div
        className={`bg-primary rounded-[var(--radius-xl)] px-5 py-5 text-white transition-all duration-700 delay-100 ${
          animStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70 font-medium">Estimated Delivery</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black tabular-nums">{String(mins).padStart(2, "0")}</span>
              <span className="text-2xl font-bold text-white/60">:</span>
              <span className="text-4xl font-black tabular-nums">{String(secs).padStart(2, "0")}</span>
            </div>
            <p className="text-xs text-white/60 mt-1">Minutes remaining</p>
          </div>
          <div className="text-right">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2">
              <span className="text-3xl">🛵</span>
            </div>
            <p className="text-xs text-white/70">Arriving by</p>
            <p className="text-sm font-bold">{etaStr}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${((ESTIMATED_MINUTES * 60 - countdown) / (ESTIMATED_MINUTES * 60)) * 100}%` }}
          />
        </div>
      </div>

      {/* Order Status Steps */}
      <div
        className={`bg-white rounded-[var(--radius-xl)] border border-border-light px-5 py-5 transition-all duration-700 delay-200 ${
          animStage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h3 className="text-sm font-bold text-text-primary mb-4">Order Status</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border-light" />

          <div className="space-y-5">
            {ORDER_STEPS.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 relative">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all ${
                    step.done
                      ? "bg-success border-success"
                      : step.active
                        ? "bg-white border-primary animate-pulse"
                        : "bg-white border-border-light"
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                  ) : step.active ? (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-border-default" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step.done
                      ? "text-success"
                      : step.active
                        ? "text-primary font-semibold"
                        : "text-text-tertiary"
                  }`}
                >
                  {step.label}
                </span>
                {step.active && (
                  <span className="ml-auto text-[10px] bg-primary-50 text-primary font-bold px-2 py-0.5 rounded-full">
                    In Progress
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <MapPin size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-text-primary">Delivery Address</p>
            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
              B-204, 3rd Floor, Andheri West, Mumbai - 400058
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0 cursor-pointer hover:bg-primary/20 transition-colors">
            <Phone size={15} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={orderId ? `/orders/${orderId}` : "/orders"}
          className="flex items-center justify-center gap-2 h-12 bg-primary text-white font-semibold text-sm rounded-[var(--radius-xl)] hover:bg-primary-dark transition-colors"
        >
          <Package size={16} /> Track Order
        </Link>
        <Link
          href="/home"
          className="flex items-center justify-center gap-2 h-12 bg-bg-secondary text-text-primary font-semibold text-sm rounded-[var(--radius-xl)] hover:bg-bg-hover transition-colors border border-border-light"
        >
          <Home size={16} /> Back to Home
        </Link>
      </div>

      {/* Rate & Share */}
      <div className="flex items-center gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 h-11 border border-border-light rounded-[var(--radius-xl)] text-sm font-medium text-text-secondary hover:bg-bg-hover hover:border-border-default transition-colors">
          <Star size={15} className="text-warning" /> Rate Restaurant
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 h-11 border border-border-light rounded-[var(--radius-xl)] text-sm font-medium text-text-secondary hover:bg-bg-hover hover:border-border-default transition-colors">
          <Share2 size={15} /> Share Order
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 h-11 border border-border-light rounded-[var(--radius-xl)] text-sm font-medium text-text-secondary hover:bg-bg-hover hover:border-border-default transition-colors">
          <Download size={15} /> Invoice
        </button>
      </div>

      {/* Support note */}
      <p className="text-center text-xs text-text-tertiary pb-2">
        Need help?{" "}
        <Link href="/support" className="text-primary font-semibold hover:underline">
          Contact Support
        </Link>
      </p>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense>
      <OrderConfirmedContent />
    </Suspense>
  );
}
