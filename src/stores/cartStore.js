import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      restaurant: null, // { _id, name, slug, deliveryFee, minOrderAmount }
      items: [],
      coupon: null, // { code, discount, type, value }
      tip: 0,

      // Add item to cart
      addItem: (restaurant, item) => {
        const { restaurant: currentRestaurant, items } = get();

        // If different restaurant, clear cart first
        if (currentRestaurant && currentRestaurant._id !== restaurant._id) {
          set({
            restaurant,
            items: [{ ...item, cartId: Date.now().toString() }],
            coupon: null,
            tip: 0,
          });
          return "switched"; // Signal that restaurant was switched
        }

        set({
          restaurant: restaurant,
          items: [...items, { ...item, cartId: Date.now().toString() }],
        });
        return "added";
      },

      // Remove item by cartId
      removeItem: (cartId) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.cartId !== cartId);
          return {
            items: newItems,
            restaurant: newItems.length === 0 ? null : state.restaurant,
            coupon: newItems.length === 0 ? null : state.coupon,
          };
        }),

      // Update quantity
      updateQuantity: (cartId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((i) => i.cartId !== cartId);
            return {
              items: newItems,
              restaurant: newItems.length === 0 ? null : state.restaurant,
            };
          }
          return {
            items: state.items.map((i) =>
              i.cartId === cartId ? { ...i, quantity } : i
            ),
          };
        }),

      // Update addons for an item
      updateAddons: (cartId, addons) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.cartId === cartId ? { ...i, addons } : i
          ),
        })),

      // Apply coupon
      applyCoupon: (coupon) =>
        set({ coupon }),

      removeCoupon: () =>
        set({ coupon: null }),

      // Set tip
      setTip: (tip) =>
        set({ tip }),

      // Clear entire cart
      clearCart: () =>
        set({ restaurant: null, items: [], coupon: null, tip: 0 }),

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
        const { restaurant } = get();
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

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const deliveryFee = get().getDeliveryFee();
        const tax = get().getTaxAmount();
        const couponDiscount = get().getCouponDiscount();
        const { tip } = get();
        const platformFee = 3; // Fixed platform fee
        return Math.max(
          0,
          subtotal + deliveryFee + tax - couponDiscount + tip + platformFee
        );
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

export default useCartStore;
