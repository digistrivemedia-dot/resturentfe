import { create } from "zustand";
import api from "@/lib/api";
import { resolveDateRange } from "@/lib/analyticsDateRanges";

const DEFAULT_FILTERS = {
  preset: "This Week",
  customStart: "",
  customEnd: "",
  city: "all",
  restaurantId: "all",
  orderType: "all",
  paymentMethod: "all",
  compare: true, // frontend-only: show/hide "vs previous period" badges
  includeCancelled: false,
};

function buildParams(filters) {
  const { startDate, endDate } = resolveDateRange(filters.preset, filters.customStart, filters.customEnd);
  const params = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
  if (filters.city !== "all") params.city = filters.city;
  if (filters.restaurantId !== "all") params.restaurantId = filters.restaurantId;
  if (filters.orderType !== "all") params.orderType = filters.orderType;
  if (filters.paymentMethod !== "all") params.paymentMethod = filters.paymentMethod;
  if (filters.includeCancelled) params.includeCancelled = "true";
  return params;
}

const useAdminAnalyticsStore = create((set, get) => ({
  filters: DEFAULT_FILTERS,
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),

  filterOptions: null,
  overview: null,
  cities: null,
  restaurants: null,
  customers: null,
  orderMix: null,
  supportHealth: null,
  deliveryHealth: null,
  isLoading: false,
  error: null,

  fetchFilterOptions: async () => {
    if (get().filterOptions) return get().filterOptions;
    try {
      const res = await api.get("/admin/analytics/filter-options");
      set({ filterOptions: res.data });
      return res.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const params = buildParams(get().filters);
      const [overview, cities, restaurants, customers, orderMix, supportHealth, deliveryHealth] = await Promise.all([
        api.get("/admin/analytics/overview", { params }),
        api.get("/admin/analytics/cities", { params }),
        api.get("/admin/analytics/restaurants", { params }),
        api.get("/admin/analytics/customers", { params }),
        api.get("/admin/analytics/order-mix", { params }),
        api.get("/admin/analytics/support-health", { params }),
        api.get("/admin/analytics/delivery-health", { params }),
      ]);
      set({
        overview: overview.data,
        cities: cities.data,
        restaurants: restaurants.data,
        customers: customers.data,
        orderMix: orderMix.data,
        supportHealth: supportHealth.data,
        deliveryHealth: deliveryHealth.data,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },
}));

export default useAdminAnalyticsStore;
