import { create } from "zustand";
import api from "@/lib/api";

const useRestaurantCustomerStore = create((set) => ({
  customers: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  error: null,

  fetchCustomers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") query.append(key, val);
      });
      const res = await api.get(`/restaurant/customers?${query.toString()}`);
      set({
        customers: res.data.customers,
        pagination: res.data.pagination,
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Merge only the field that actually changed — res.data.customer is the raw
  // User document and lacks the totalOrders/lastOrderAt stats that getCustomers()
  // computes separately, so replacing the whole row would wipe them from the UI.
  sendMembershipPopup: async (id) => {
    const res = await api.post(`/restaurant/customers/${id}/send-membership-popup`);
    const { membershipPopupRequestedAt } = res.data.customer;
    set((state) => ({
      customers: state.customers.map((c) => (c._id === id ? { ...c, membershipPopupRequestedAt } : c)),
    }));
    return res.data.customer;
  },

  clearError: () => set({ error: null }),
}));

export default useRestaurantCustomerStore;
