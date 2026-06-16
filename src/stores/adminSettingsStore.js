import { create } from "zustand";
import api from "@/lib/api";

const useAdminSettingsStore = create((set) => ({
  settings: {},
  isLoading: false,
  isSaving: false,
  error: null,

  fetchSettings: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const url = category ? `/admin/settings?category=${category}` : "/admin/settings";
      const res = await api.get(url);
      set({ settings: res.data.settings, isLoading: false });
      return res.data.settings;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  updateSettings: async (settings) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put("/admin/settings", { settings });
      // Merge updated keys into existing settings
      set((state) => {
        const merged = { ...state.settings };
        res.data.settings.forEach((s) => {
          merged[s.key] = { value: s.value, category: s.category, description: s.description };
        });
        return { settings: merged, isSaving: false };
      });
      return res.data.settings;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAdminSettingsStore;
