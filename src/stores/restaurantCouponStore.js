import { create } from "zustand";
import api from "@/lib/api";

const useRestaurantCouponStore = create((set, get) => ({
  // State
  coupons: [],
  isLoading: false,
  isSaving: false,
  error: null,

  // Fetch all restaurant coupons
  fetchCoupons: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/coupons");
      set({ coupons: res.data.coupons, isLoading: false });
      return res.data.coupons;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Create coupon (maps frontend field names to backend)
  createCoupon: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const payload = mapCouponToBackend(data);
      const res = await api.post("/restaurant/coupons", payload);
      set((state) => ({
        coupons: [res.data.coupon, ...state.coupons],
        isSaving: false,
      }));
      return res.data.coupon;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  // Update coupon
  updateCoupon: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const payload = mapCouponToBackend(data);
      const res = await api.put(`/restaurant/coupons/${id}`, payload);
      set((state) => ({
        coupons: state.coupons.map((c) => (c._id === id ? res.data.coupon : c)),
        isSaving: false,
      }));
      return res.data.coupon;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  // Delete coupon
  deleteCoupon: async (id) => {
    set({ isSaving: true, error: null });
    try {
      await api.delete(`/restaurant/coupons/${id}`);
      set((state) => ({
        coupons: state.coupons.filter((c) => c._id !== id),
        isSaving: false,
      }));
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  // Toggle coupon active/paused
  toggleCoupon: async (id, isActive) => {
    set({ error: null });
    try {
      const res = await api.put(`/restaurant/coupons/${id}`, { isActive });
      set((state) => ({
        coupons: state.coupons.map((c) => (c._id === id ? res.data.coupon : c)),
      }));
      return res.data.coupon;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Clear
  clearError: () => set({ error: null }),
}));

// Map frontend field names to backend field names
function mapCouponToBackend(data) {
  const payload = { ...data };

  // minOrder → minOrderAmount
  if ("minOrder" in payload) {
    payload.minOrderAmount = payload.minOrder;
    delete payload.minOrder;
  }

  // validTo → validUntil
  if ("validTo" in payload) {
    payload.validUntil = payload.validTo;
    delete payload.validTo;
  }

  // status string → isActive boolean
  if ("status" in payload) {
    payload.isActive = payload.status === "active";
    delete payload.status;
  }

  // Frontend type names → backend type names
  const TYPE_MAP = {
    percent: "percentage",
    freeDelivery: "free_delivery",
    // "flat" matches backend already
  };
  if (payload.type && TYPE_MAP[payload.type]) {
    payload.type = TYPE_MAP[payload.type];
  }

  return payload;
}

const TYPE_MAP_REVERSE = {
  percentage: "percent",
  free_delivery: "freeDelivery",
  // "flat" matches frontend already
};

// Map backend coupon to frontend shape (for display)
export function mapCouponFromBackend(coupon) {
  if (!coupon) return coupon;
  return {
    ...coupon,
    id: coupon._id,
    type: TYPE_MAP_REVERSE[coupon.type] || coupon.type,
    minOrder: coupon.minOrderAmount,
    validTo: coupon.validUntil,
    status: coupon.isActive === false ? "paused" : (new Date(coupon.validUntil) < new Date() ? "expired" : "active"),
  };
}

export default useRestaurantCouponStore;
