"use client";

import { useEffect, useRef } from "react";
import useAuthStore from "@/stores/authStore";
import useCartStore from "@/stores/cartStore";
import api from "@/lib/api";

// Bridges auth transitions to the cart store without cartStore <-> authStore
// importing each other directly (cartStore already imports authStore to
// check auth state before syncing — this component owns the other direction).
export default function CartSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated === wasAuthenticated.current) return;
    wasAuthenticated.current = isAuthenticated;

    if (isAuthenticated) {
      // Logged in — recover a cart started on another device, unless this
      // device already has one in progress (that wins; push it to the server).
      api
        .get("/customer/cart")
        .then((res) => {
          const serverCart = res.data.cart;
          const { restaurant, items, coupon, tip, orderType, orderTypeLocked, hydrateFromServer } = useCartStore.getState();
          if (items.length === 0 && serverCart?.items?.length > 0) {
            hydrateFromServer(serverCart);
          } else if (items.length > 0) {
            // Local cart takes precedence — mirror it to the server.
            api.put("/customer/cart", { restaurant, items, coupon, tip, orderType, orderTypeLocked }).catch(() => {});
          }
        })
        .catch(() => {});
    } else {
      // Logged out — this device's cart is no longer "whoever was using it a
      // moment ago". Clear locally only; the server-side record for that
      // account stays intact.
      useCartStore.getState().resetLocalCart();
    }
  }, [isAuthenticated]);

  return null;
}
