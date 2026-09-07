import { create } from "zustand";
import api from "@/lib/api";

const useAdminDashboardStore = create((set, get) => ({
  stats: null,
  isLoading: false,
  error: null,

  revenueTrend: null,
  isTrendLoading: false,

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

  // Reuses the same platform analytics endpoint the Analytics page uses —
  // just fixed to a trailing 14-day window with no filters, since the
  // dashboard is meant to be an at-a-glance view, not the filterable report.
  fetchRevenueTrend: async () => {
    set({ isTrendLoading: true });
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 13);
      const res = await api.get("/admin/analytics/overview", {
        params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      });
      // Trend only returns GMV per day (not subtotal), so this is an estimate
      // using the real saved commission % against GMV rather than subtotal —
      // the authoritative subtotal-based figure is the dashboard stat card.
      const commissionPct = get().stats?.commissionPct ?? 18;
      const trend = (res.data.trend || []).map((t) => ({
        day: t.bucket,
        gmv: t.gmv || 0,
        commission: Math.round((t.gmv || 0) * (commissionPct / 100)),
      }));
      set({ revenueTrend: trend, isTrendLoading: false });
      return trend;
    } catch (err) {
      set({ isTrendLoading: false, error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAdminDashboardStore;
