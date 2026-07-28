"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, CheckCircle2, UtensilsCrossed, Bike, Package } from "lucide-react";
import useOrderStore from "@/stores/orderStore";
import useAuthStore from "@/stores/authStore";
import { connectSocket } from "@/lib/socket";

const STATUS_CONFIG = {
  placed:           { label: "Order placed",        icon: Package,         color: "bg-warning",  pulse: true  },
  confirmed:        { label: "Restaurant accepted",  icon: CheckCircle2,    color: "bg-primary",  pulse: true  },
  preparing:        { label: "Preparing your food",  icon: UtensilsCrossed, color: "bg-primary",  pulse: true  },
  ready:            { label: "Ready for pickup",     icon: CheckCircle2,    color: "bg-success",  pulse: false },
  picked_up:        { label: "Out for delivery",     icon: Bike,            color: "bg-primary",  pulse: true  },
  out_for_delivery: { label: "Out for delivery",     icon: Bike,            color: "bg-primary",  pulse: true  },
};

const HIDE_PATHS = [
  "/login", "/verify-otp", "/complete-profile",
  "/checkout", "/payment", "/quick-order/location",
];

function OrderCard({ order, onClick, compact = false }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const Icon = cfg.icon;

  return (
    <button
      onClick={() => onClick(order)}
      className={`w-full flex items-center gap-3 bg-text-primary text-white rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] hover:opacity-90 transition-opacity ${
        compact ? "px-3 py-2.5" : "px-4 py-3"
      }`}
    >
      <div className={`relative ${compact ? "w-7 h-7" : "w-9 h-9"} rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
        {cfg.pulse && (
          <span className={`absolute inset-0 rounded-full ${cfg.color} opacity-50 animate-ping`} />
        )}
        <Icon size={compact ? 13 : 16} className="text-white relative z-10" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className={`font-extrabold text-white truncate ${compact ? "text-[11px]" : "text-xs"}`}>
          {cfg.label}
        </p>
        <p className={`text-white/60 truncate ${compact ? "text-[10px]" : "text-[11px]"}`}>
          {order.restaurant?.name || "Your order"} · {order.orderNumber}
        </p>
      </div>
      <ChevronRight size={compact ? 13 : 16} className="text-white/60 shrink-0" />
    </button>
  );
}

export default function LiveOrderBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { activeOrders, fetchActiveOrders } = useOrderStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = connectSocket();
    if (!socket) return;

    const handler = ({ order }) => {
      if (order.status === "delivered" || order.status === "cancelled") {
        useOrderStore.setState((s) => ({
          activeOrders: s.activeOrders.filter((o) => o._id !== order._id),
        }));
      } else {
        useOrderStore.setState((s) => {
          const exists = s.activeOrders.find((o) => o._id === order._id);
          if (exists) {
            return { activeOrders: s.activeOrders.map((o) => o._id === order._id ? order : o) };
          }
          return { activeOrders: [order, ...s.activeOrders] };
        });
      }
    };

    socket.on("order_status_updated", handler);
    return () => socket.off("order_status_updated", handler);
  }, [isAuthenticated]);

  const shouldHide =
    HIDE_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.match(/\/order\/.*\/track/) ||
    !isAuthenticated ||
    activeOrders.length === 0;

  if (shouldHide) return null;

  const handleTrack = (order) => {
    router.push(`/order/confirmed?orderNumber=${order.orderNumber}&orderId=${order._id}`);
  };

  const isMultiple = activeOrders.length > 1;

  return (
    <>
      {/* Mobile — stacked above bottom nav */}
      <div
        className="md:hidden fixed left-0 right-0 z-40 px-3 flex flex-col gap-1.5 pb-1"
        style={{ bottom: "var(--bottom-nav-height)" }}
      >
        {activeOrders.map((order, idx) => (
          <OrderCard
            key={order._id}
            order={order}
            onClick={handleTrack}
            compact={isMultiple && idx > 0}
          />
        ))}
      </div>

      {/* Desktop — stacked cards at bottom right */}
      <div className="hidden md:flex flex-col gap-2 fixed bottom-5 right-5 z-40">
        {activeOrders.map((order, idx) => (
          <OrderCard
            key={order._id}
            order={order}
            onClick={handleTrack}
            compact={isMultiple && idx > 0}
          />
        ))}
      </div>
    </>
  );
}
