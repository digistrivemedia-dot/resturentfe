import { create } from "zustand";
import api from "@/lib/api";

const useAdminBannerStore = create((set) => ({
  banners: [],
  isLoading: false,
  isSaving: false,
  error: null,

  fetchBanners: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") query.append(key, val);
      });
      const res = await api.get(`/admin/banners?${query.toString()}`);
      set({ banners: res.data.banners, isLoading: false });
      return res.data.banners;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  createBanner: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.post("/admin/banners", data);
      set((state) => ({
        banners: [...state.banners, res.data.banner],
        isSaving: false,
      }));
      return res.data.banner;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  updateBanner: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/admin/banners/${id}`, data);
      set((state) => ({
        banners: state.banners.map((b) => (b._id === id ? res.data.banner : b)),
        isSaving: false,
      }));
      return res.data.banner;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  deleteBanner: async (id) => {
    set({ isSaving: true, error: null });
    try {
      await api.delete(`/admin/banners/${id}`);
      set((state) => ({
        banners: state.banners.filter((b) => b._id !== id),
        isSaving: false,
      }));
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAdminBannerStore;
