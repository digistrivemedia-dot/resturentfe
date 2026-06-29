"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Clock, CheckCircle2, UtensilsCrossed, Bike, Package } from "lucide-react";
import useOrderStore from "@/stores/orderStore";
import useAuthStore from "@/stores/authStore";
import { connectSocket } from "@/lib/socket";

const STATUS_CONFIG = {
  placed:           { label: "Order placed",       icon: Package,         color: "bg-warning",  pulse: true  },
  confirmed:        { label: "Restaurant accepted", icon: CheckCircle2,    color: "bg-primary",  pulse: true  },
  preparing:        { label: "Preparing your food", icon: UtensilsCrossed, color: "bg-primary",  pulse: true  },
  ready:            { label: "Ready for pickup",    icon: CheckCircle2,    color: "bg-success",  pulse: false },
  picked_up:        { label: "Out for delivery",    icon: Bike,            color: "bg-primary",  pulse: true  },
  out_for_delivery: { label: "Out for delivery",    icon: Bike,            color: "bg-primary",  pulse: true  },
};

const HIDE_PATHS = [
  "/login", "/verify-otp", "/complete-profile",
  "/checkout", "/payment",
];

export default function LiveOrderBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { activeOrders, fetchActiveOrders } = useOrderStore();

  // Fetch active orders on mount, on auth change, and on every page navigation
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, pathname]);

  // Real-time socket updates
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = connectSocket();
    if (!socket) return;

    const handler = ({ order }) => {
      if (order.status === "delivered" || order.status === "cancelled") {
        // Remove from active orders
        useOrderStore.setState((s) => ({
          activeOrders: s.activeOrders.filter((o) => o._id !== order._id),
        }));
      } else {
        // Update or add to active orders
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

  // Hide on certain pages
  const shouldHide =
    HIDE_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.match(/\/order\/.*\/track/) ||
    !isAuthenticated ||
    activeOrders.length === 0;

  if (shouldHide) return null;

  // Show the most recent active order
  const order = activeOrders[0];
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const Icon = cfg.icon;

  return (
    <>
      {/* Mobile — sits above bottom nav */}
      <div
        className="md:hidden fixed left-0 right-0 z-40 px-3 pb-1"
        style={{ bottom: "var(--bottom-nav-height)" }}
      >
        <button
          onClick={() => router.push(`/order/confirmed?orderNumber=${order.orderNumber}&orderId=${order._id}`)}
          className="w-full flex items-center gap-3 bg-text-primary text-white rounded-[var(--radius-xl)] px-4 py-3 shadow-[var(--shadow-xl)]"
        >
          <div className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
            {cfg.pulse && <span className={`absolute inset-0 rounded-full ${cfg.color} opacity-50 animate-ping`} />}
            <Icon size={16} className="text-white relative z-10" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-extrabold text-white truncate">{cfg.label}</p>
            <p className="text-[11px] text-white/60 truncate">
              {order.restaurant?.name || "Your order"} · {order.orderNumber}
            </p>
          </div>
          {activeOrders.length > 1 && (
            <span className="shrink-0 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
              +{activeOrders.length - 1} more
            </span>
          )}
          <ChevronRight size={16} className="text-white/60 shrink-0" />
        </button>
      </div>

      {/* Desktop — compact card fixed at bottom right */}
      <div className="hidden md:block fixed bottom-5 right-5 z-40">
        <button
          onClick={() => router.push(`/order/confirmed?orderNumber=${order.orderNumber}&orderId=${order._id}`)}
          className="flex items-center gap-3 bg-text-primary text-white rounded-[var(--radius-xl)] px-4 py-3 shadow-[var(--shadow-xl)] hover:opacity-90 transition-opacity"
        >
          <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
            {cfg.pulse && <span className={`absolute inset-0 rounded-full ${cfg.color} opacity-50 animate-ping`} />}
            <Icon size={15} className="text-white relative z-10" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs font-extrabold text-white">{cfg.label}</p>
            <p className="text-[11px] text-white/60 truncate max-w-[160px]">
              {order.restaurant?.name || "Your order"} · {order.orderNumber}
            </p>
          </div>
          {activeOrders.length > 1 && (
            <span className="shrink-0 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
              +{activeOrders.length - 1}
            </span>
          )}
          <ChevronRight size={15} className="text-white/60 shrink-0" />
        </button>
      </div>
    </>
  );
}
