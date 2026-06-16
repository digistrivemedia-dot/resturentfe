import { create } from "zustand";
import api from "@/lib/api";

const useAdminCouponStore = create((set) => ({
  coupons: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  isSaving: false,
  error: null,

  fetchCoupons: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") query.append(key, val);
      });
      const res = await api.get(`/admin/coupons?${query.toString()}`);
      set({
        coupons: res.data.coupons,
        pagination: res.data.pagination,
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  createCoupon: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.post("/admin/coupons", data);
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

  updateCoupon: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/admin/coupons/${id}`, data);
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

  deleteCoupon: async (id) => {
    set({ isSaving: true, error: null });
    try {
      await api.delete(`/admin/coupons/${id}`);
      set((state) => ({
        coupons: state.coupons.filter((c) => c._id !== id),
        isSaving: false,
      }));
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAdminCouponStore;
