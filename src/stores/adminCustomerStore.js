import { create } from "zustand";
import api from "@/lib/api";

const useAdminCustomerStore = create((set) => ({
  customers: [],
  currentCustomer: null,
  customerOrders: [],
  totalOrders: 0,
  totalSpent: 0,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  isSaving: false,
  error: null,

  fetchCustomers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") query.append(key, val);
      });
      const res = await api.get(`/admin/customers?${query.toString()}`);
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

  fetchCustomerDetail: async (id) => {
    set({ isLoading: true, error: null, currentCustomer: null });
    try {
      const res = await api.get(`/admin/customers/${id}`);
      set({
        currentCustomer: res.data.customer,
        customerOrders: res.data.orders,
        totalOrders: res.data.totalOrders,
        totalSpent: res.data.totalSpent,
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  blockCustomer: async (id) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/admin/customers/${id}/block`);
      set((state) => ({
        customers: state.customers.map((c) => (c._id === id ? res.data.customer : c)),
        currentCustomer: state.currentCustomer?._id === id ? res.data.customer : state.currentCustomer,
        isSaving: false,
      }));
      return res.data.customer;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  clearCurrentCustomer: () => set({ currentCustomer: null }),
  clearError: () => set({ error: null }),
}));

export default useAdminCustomerStore;
