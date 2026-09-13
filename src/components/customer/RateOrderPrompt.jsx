"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/authStore";
import api from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import RateOrderModal from "@/components/customer/RateOrderModal";

// Persisted per-order (localStorage, not sessionStorage) so the count survives
// closing the browser entirely — sessionStorage was the actual bug: it resets
// on every fresh session, so the prompt reappeared forever for the same order.
// Shows on the 1st and 2nd open after delivery; after that we stop asking —
// the customer can still rate from their Orders page whenever they want.
const MAX_PROMPTS_PER_ORDER = 2;
const promptCountKey = (orderId) => `sic_rating_prompt_count_${orderId}`;

function getPromptCount(orderId) {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(promptCountKey(orderId))) || 0;
}

function recordPromptShown(orderId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(promptCountKey(orderId), String(getPromptCount(orderId) + 1));
}

function needsRating(order) {
  return order?.status === "delivered" && !(order.rating?.itemRatings?.length > 0);
}

export default function RateOrderPrompt() {
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [open, setOpen] = useState(false);

  // Once-per-app-open reminder: check for an existing unrated delivered order
  // on first mount, but only ones that haven't already used up their 2 prompts.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === "undefined") return;

    (async () => {
      try {
        const res = await api.get("/orders?status=delivered&limit=5");
        const pending = res.data.orders?.find(
          (o) => needsRating(o) && getPromptCount(o._id) < MAX_PROMPTS_PER_ORDER
        );
        if (pending) {
          recordPromptShown(pending._id);
          setOrder(pending);
          setOpen(true);
        }
      } catch {}
    })();
  }, [isAuthenticated]);

  // Real-time trigger: order flips to delivered while the app is open. Waits
  // for isInitialized, not just isAuthenticated — see LiveOrderBar.jsx for why
  // connecting on isAuthenticated alone races AuthInitializer's token refresh
  // and silently never joins this customer's room.
  useEffect(() => {
    if (!isAuthenticated || !isInitialized || !user) return;
    const socket = connectSocket();
    if (!socket) return;

    const handler = ({ order: updated }) => {
      // Defense in depth — never act on a payload without confirming it's
      // actually this account's order (see LiveOrderBar for why).
      if (String(updated.customer) !== String(user._id)) return;
      if (needsRating(updated) && getPromptCount(updated._id) < MAX_PROMPTS_PER_ORDER) {
        recordPromptShown(updated._id);
        setOrder(updated);
        setOpen(true);
      }
    };
    socket.on("order_status_updated", handler);
    return () => socket.off("order_status_updated", handler);
  }, [isAuthenticated, isInitialized, user]);

  return <RateOrderModal order={order} isOpen={open} onClose={() => setOpen(false)} />;
}
