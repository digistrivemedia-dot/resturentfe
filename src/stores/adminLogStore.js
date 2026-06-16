import { create } from "zustand";
import api from "@/lib/api";

const useAdminLogStore = create((set) => ({
  logs: [],
  pagination: { page: 1, limit: 50, total: 0, pages: 0 },
  isLoading: false,
  error: null,

  fetchLogs: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") query.append(key, val);
      });
      const res = await api.get(`/admin/logs?${query.toString()}`);
      set({
        logs: res.data.logs,
        pagination: res.data.pagination,
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAdminLogStore;
