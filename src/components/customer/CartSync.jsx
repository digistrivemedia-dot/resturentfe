"use client";

import { useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import useCartStore from "@/stores/cartStore";
import api from "@/lib/api";

// The cart has no local persistence anymore — the database is the only
// store, so this has to run on every mount (not just on a login transition)
// to actually load the cart at all, in addition to reacting to login/logout.
export default function CartSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get("/customer/cart")
        .then((res) => {
          useCartStore.getState().hydrateFromServer(res.data.cart);
        })
        .catch(() => {
          useCartStore.getState().resetLocalCart();
        });
    } else {
      // No one logged in — there is no cart to have.
      useCartStore.getState().resetLocalCart();
    }
  }, [isAuthenticated]);

  return null;
}
