import { create } from "zustand";
import api from "@/lib/api";
import { resolveDateRange } from "@/lib/analyticsDateRanges";

const DEFAULT_FILTERS = {
  preset: "This Week",
  customStart: "",
  customEnd: "",
  orderType: "all",
  paymentMethod: "all",
  compare: true,
  includeCancelled: false,
};

function buildParams(filters, restaurantId) {
  const { startDate, endDate } = resolveDateRange(filters.preset, filters.customStart, filters.customEnd);
  const params = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    restaurantId,
  };
  if (filters.orderType !== "all") params.orderType = filters.orderType;
  if (filters.paymentMethod !== "all") params.paymentMethod = filters.paymentMethod;
  if (filters.includeCancelled) params.includeCancelled = "true";
  return params;
}

// Single-restaurant analytics for admin's per-restaurant report — reuses the same
// platform-wide endpoints as adminAnalyticsStore, just always scoped via restaurantId.
const useAdminRestaurantAnalyticsStore = create((set, get) => ({
  filters: DEFAULT_FILTERS,
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),

  overview: null,
  customers: null,
  orderMix: null,
  supportHealth: null,
  deliveryHealth: null,
  isLoading: false,
  error: null,

  fetchAll: async (restaurantId) => {
    set({ isLoading: true, error: null });
    try {
      const params = buildParams(get().filters, restaurantId);
      const [overview, customers, orderMix, supportHealth, deliveryHealth] = await Promise.all([
        api.get("/admin/analytics/overview", { params }),
        api.get("/admin/analytics/customers", { params }),
        api.get("/admin/analytics/order-mix", { params }),
        api.get("/admin/analytics/support-health", { params }),
        api.get("/admin/analytics/delivery-health", { params }),
      ]);
      set({
        overview: overview.data,
        // Membership fields on this response are platform-wide, not restaurant-scoped —
        // only newCustomers/returningCustomers/avgOrders/repeatRate are valid here.
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

export default useAdminRestaurantAnalyticsStore;
