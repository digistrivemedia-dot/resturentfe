import { create } from "zustand";
import api from "@/lib/api";

const useAdminDashboardStore = create((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/admin/dashboard");
      set({ stats: res.data.stats, isLoading: false });
      return res.data.stats;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAdminDashboardStore;
