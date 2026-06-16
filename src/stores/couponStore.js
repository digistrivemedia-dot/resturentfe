import { create } from "zustand";
import api from "@/lib/api";

const useCouponStore = create((set) => ({
  coupons: [],
  isLoading: false,
  error: null,

  // Fetch available coupons
  fetchCoupons: async (restaurantId) => {
    set({ isLoading: true, error: null });
    try {
      const query = restaurantId ? `?restaurantId=${restaurantId}` : "";
      const res = await api.get(`/coupons${query}`);
      set({ coupons: res.data.coupons, isLoading: false });
      return res.data.coupons;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return [];
    }
  },

  // Validate coupon
  validateCoupon: async (code, restaurantId, subtotal) => {
    try {
      const res = await api.post("/coupons/validate", {
        code,
        restaurantId,
        subtotal,
      });
      return res.data.coupon;
    } catch (err) {
      throw err;
    }
  },
}));

export default useCouponStore;
