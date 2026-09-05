import { create } from "zustand";
import usePlatformFeeStore from "./platformFeeStore";
import useAuthStore from "./authStore";
import api from "@/lib/api";

// Debounced mirror of the cart to the server — this IS the cart now (no local
// persistence). Every mutation only ever happens for a logged-in customer
// (addItem refuses otherwise), so this always has someone to sync for.
let syncTimer = null;
function scheduleSync(get) {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const { restaurant, items, coupon, tip, orderType, orderTypeLocked } = get();
    api.put("/customer/cart", { restaurant, items, coupon, tip, orderType, orderTypeLocked }).catch(() => {});
  }, 800);
}

const useCartStore = create(
    (set, get) => ({
      restaurant: null, // { _id, name, slug, deliveryFee, minOrderAmount }
      items: [],
      coupon: null, // { code, discount, type, value }
      tip: 0,
      orderType: "delivery", // delivery | dine_in | pickup | self_service
      // true once the order type was chosen up-front via the quick-order flow —
      // cart hides its own order-type picker in that case (already decided)
      orderTypeLocked: false,
      // False until the initial server fetch resolves (see CartSync) — lets the
      // cart page tell "still checking the server" apart from "genuinely empty".
      isHydrated: false,

      // Add item to cart. Cart is login-only — this is the single real entry
      // point for ever putting something in the cart, so it's the one place
      // that needs to enforce that, rather than every "Add" button doing it.
      // Returns "login_required" so the caller can redirect.
      addItem: (restaurant, item) => {
        if (!useAuthStore.getState().isAuthenticated) return "login_required";

        const { restaurant: currentRestaurant, items } = get();

        // If different restaurant, clear cart first
        if (currentRestaurant && currentRestaurant._id !== restaurant._id) {
          set({
            restaurant,
            items: [{ ...item, cartId: Date.now().toString() }],
            coupon: null,
            tip: 0,
            orderTypeLocked: false,
          });
          scheduleSync(get);
          return "switched"; // Signal that restaurant was switched
        }

        set({
          restaurant: restaurant,
          items: [...items, { ...item, cartId: Date.now().toString() }],
        });
        scheduleSync(get);
        return "added";
      },

      // Remove item by cartId
      removeItem: (cartId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.cartId !== cartId);
          const isEmpty = newItems.length === 0;
          return {
            items: newItems,
            restaurant: isEmpty ? null : state.restaurant,
            coupon: isEmpty ? null : state.coupon,
            orderTypeLocked: isEmpty ? false : state.orderTypeLocked,
          };
        });
        scheduleSync(get);
      },

      // Update quantity
      updateQuantity: (cartId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((i) => i.cartId !== cartId);
            const isEmpty = newItems.length === 0;
            return {
              items: newItems,
              restaurant: isEmpty ? null : state.restaurant,
              orderTypeLocked: isEmpty ? false : state.orderTypeLocked,
            };
          }
          return {
            items: state.items.map((i) =>
              i.cartId === cartId ? { ...i, quantity } : i
            ),
          };
        });
        scheduleSync(get);
      },

      // Update addons for an item
      updateAddons: (cartId, addons) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.cartId === cartId ? { ...i, addons } : i
          ),
        }));
        scheduleSync(get);
      },

      // Apply coupon
      applyCoupon: (coupon) => {
        set({ coupon });
        scheduleSync(get);
      },

      removeCoupon: () => {
        set({ coupon: null });
        scheduleSync(get);
      },

      // Set tip
      setTip: (tip) => {
        set({ tip });
        scheduleSync(get);
      },

      // Set order type (delivery, dine_in, pickup, self_service)
      setOrderType: (orderType) => {
        set((state) => ({
          orderType,
          tip: orderType === "delivery" ? state.tip : 0,
        }));
        scheduleSync(get);
      },

      // Set order type via the quick-order flow's dedicated selection page —
      // locks it in so the cart page doesn't ask again
      confirmQuickOrderType: (orderType) => {
        set((state) => ({
          orderType,
          tip: orderType === "delivery" ? state.tip : 0,
          orderTypeLocked: true,
        }));
        scheduleSync(get);
      },

      // Clear entire cart (also clears the server-side mirror — this is an
      // explicit "no active cart" action, e.g. after checkout)
      clearCart: () => {
        set({ restaurant: null, items: [], coupon: null, tip: 0, orderType: "delivery", orderTypeLocked: false });
        clearTimeout(syncTimer);
        if (useAuthStore.getState().isAuthenticated) {
          api.delete("/customer/cart").catch(() => {});
        }
      },

      // Local-only reset — used on logout, or when there's simply no one
      // logged in to have a cart for.
      resetLocalCart: () => {
        clearTimeout(syncTimer);
        set({ restaurant: null, items: [], coupon: null, tip: 0, orderType: "delivery", orderTypeLocked: false, isHydrated: true });
      },

      // Adopt the cart fetched from the server on login/mount — this is now
      // the only way the cart is ever populated after a page load, since
      // there's no local persistence to restore from.
      hydrateFromServer: (cart) => {
        if (!cart) { set({ isHydrated: true }); return; }
        set({
          restaurant: cart.restaurant || null,
          items: cart.items || [],
          coupon: cart.coupon || null,
          tip: cart.tip || 0,
          orderType: cart.orderType || "delivery",
          orderTypeLocked: !!cart.orderTypeLocked,
          isHydrated: true,
        });
      },

      // Computed values
      getItemCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.quantity || 1), 0);
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const itemPrice = item.variant?.price || item.price;
          const addonsPrice = (item.addons || []).reduce(
            (sum, addon) => sum + (addon.price || 0),
            0
          );
          return total + (itemPrice + addonsPrice) * (item.quantity || 1);
        }, 0);
      },

      getDeliveryFee: () => {
        const { restaurant, orderType } = get();
        if (orderType !== "delivery") return 0;
        const subtotal = get().getSubtotal();
        if (!restaurant) return 0;
        if (
          restaurant.freeDeliveryAbove &&
          subtotal >= restaurant.freeDeliveryAbove
        ) {
          return 0;
        }
        return restaurant.deliveryFee || 0;
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal();
        return Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
      },

      getCouponDiscount: () => {
        const { coupon } = get();
        if (!coupon) return 0;
        const subtotal = get().getSubtotal();
        if (coupon.type === "percentage") {
          const discount = (subtotal * coupon.value) / 100;
          return coupon.maxDiscount
            ? Math.min(discount, coupon.maxDiscount)
            : discount;
        }
        return coupon.value;
      },

      // Best-of preview across coupon/membership/new-customer discounts — same
      // precedence checkout uses server-side, so the number shown here on
      // "Proceed to Checkout" doesn't jump to something smaller one screen later.
      getBestDiscount: () => {
        const subtotal = get().getSubtotal();
        const rawCouponDiscount = get().getCouponDiscount();
        const user = useAuthStore.getState().user;
        const isMember = !!(user?.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date());
        const rawMembershipDiscount = isMember ? Math.round(subtotal * 0.20 * 100) / 100 : 0;
        const isFirstFourOrder = (user?.newCustomerOrdersUsed || 0) < 4;
        const rawNewCustomerDiscount = isFirstFourOrder ? Math.round(subtotal * 0.5 * 100) / 100 : 0;
        return Math.max(rawCouponDiscount, rawMembershipDiscount, rawNewCustomerDiscount);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const deliveryFee = get().getDeliveryFee();
        const tax = get().getTaxAmount();
        const bestDiscount = get().getBestDiscount();
        const { tip } = get();
        const { enabled: platformFeeEnabled, amount: platformFeeAmount } = usePlatformFeeStore.getState();
        const platformFee = platformFeeEnabled ? platformFeeAmount : 0;
        return Math.max(
          0,
          subtotal + deliveryFee + tax - bestDiscount + tip + platformFee
        );
      },
    })
);

export default useCartStore;
