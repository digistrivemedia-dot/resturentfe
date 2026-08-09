import { create } from "zustand";
import api from "@/lib/api";
import { resolveDateRange } from "@/lib/analyticsDateRanges";

const DEFAULT_FILTERS = {
  preset: "This Week",
  customStart: "",
  customEnd: "",
  orderType: "all",
  paymentMethod: "all",
  category: "all",
  compare: true, // frontend-only: show/hide "vs previous period" badges
  includeCancelled: false,
};

function buildParams(filters) {
  const { startDate, endDate } = resolveDateRange(filters.preset, filters.customStart, filters.customEnd);
  const params = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
  if (filters.orderType !== "all") params.orderType = filters.orderType;
  if (filters.paymentMethod !== "all") params.paymentMethod = filters.paymentMethod;
  if (filters.category && filters.category !== "all") params.category = filters.category;
  if (filters.includeCancelled) params.includeCancelled = "true";
  return params;
}

const useRestaurantAnalyticsStore = create((set, get) => ({
  filters: DEFAULT_FILTERS,
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  overview: null,
  overviewLoading: false,
  sales: null,
  salesLoading: false,
  orders: null,
  ordersLoading: false,
  items: null,
  itemsLoading: false,
  customers: null,
  customersLoading: false,
  error: null,

  fetchOverview: async () => {
    set({ overviewLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/analytics/overview", { params: buildParams(get().filters) });
      set({ overview: res.data, overviewLoading: false });
      return res.data;
    } catch (err) {
      set({ overviewLoading: false, error: err.message });
      throw err;
    }
  },

  fetchSales: async () => {
    set({ salesLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/analytics/sales", { params: buildParams(get().filters) });
      set({ sales: res.data, salesLoading: false });
      return res.data;
    } catch (err) {
      set({ salesLoading: false, error: err.message });
      throw err;
    }
  },

  fetchOrders: async () => {
    set({ ordersLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/analytics/orders", { params: buildParams(get().filters) });
      set({ orders: res.data, ordersLoading: false });
      return res.data;
    } catch (err) {
      set({ ordersLoading: false, error: err.message });
      throw err;
    }
  },

  fetchItems: async () => {
    set({ itemsLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/analytics/items", { params: buildParams(get().filters) });
      set({ items: res.data, itemsLoading: false });
      return res.data;
    } catch (err) {
      set({ itemsLoading: false, error: err.message });
      throw err;
    }
  },

  fetchCustomers: async () => {
    set({ customersLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/analytics/customers", { params: buildParams(get().filters) });
      set({ customers: res.data, customersLoading: false });
      return res.data;
    } catch (err) {
      set({ customersLoading: false, error: err.message });
      throw err;
    }
  },
}));

export default useRestaurantAnalyticsStore;
