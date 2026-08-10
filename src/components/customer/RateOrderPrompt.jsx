"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/authStore";
import api from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import RateOrderModal from "@/components/customer/RateOrderModal";

const SESSION_KEY = "sic_rating_prompt_shown";

function needsRating(order) {
  return order?.status === "delivered" && !(order.rating?.itemRatings?.length > 0);
}

export default function RateOrderPrompt() {
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [open, setOpen] = useState(false);

  // Once-per-app-open reminder: check for an existing unrated delivered order
  // on first mount of this browser session only.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    (async () => {
      try {
        const res = await api.get("/orders?status=delivered&limit=5");
        const pending = res.data.orders?.find(needsRating);
        if (pending) {
          sessionStorage.setItem(SESSION_KEY, "1");
          setOrder(pending);
          setOpen(true);
        }
      } catch {}
    })();
  }, [isAuthenticated]);

  // Real-time trigger: order flips to delivered while the app is open.
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = connectSocket();
    if (!socket) return;

    const handler = ({ order: updated }) => {
      if (needsRating(updated)) {
        if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, "1");
        setOrder(updated);
        setOpen(true);
      }
    };
    socket.on("order_status_updated", handler);
    return () => socket.off("order_status_updated", handler);
  }, [isAuthenticated]);

  return <RateOrderModal order={order} isOpen={open} onClose={() => setOpen(false)} />;
}
