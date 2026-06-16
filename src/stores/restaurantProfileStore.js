import { create } from "zustand";
import api from "@/lib/api";

const useRestaurantProfileStore = create((set, get) => ({
  // State
  restaurant: null,
  payouts: [],
  isLoading: false,
  isSaving: false,
  error: null,

  // Fetch restaurant profile
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/profile");
      set({ restaurant: res.data.restaurant, isLoading: false });
      return res.data.restaurant;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put("/restaurant/profile", data);
      set({ restaurant: res.data.restaurant, isSaving: false });
      return res.data.restaurant;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  // Update settings (delivery settings etc.)
  updateSettings: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put("/restaurant/settings", data);
      set({ restaurant: res.data.restaurant, isSaving: false });
      return res.data.restaurant;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  // Fetch payouts
  fetchPayouts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/payouts");
      set({ payouts: res.data.payouts, isLoading: false });
      return res.data.payouts;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Clear
  clearError: () => set({ error: null }),
}));

export default useRestaurantProfileStore;
