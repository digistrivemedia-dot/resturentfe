import { create } from "zustand";
import api from "@/lib/api";

const useAdminOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  isSaving: false,
  error: null,

  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") query.append(key, val);
      });
      const res = await api.get(`/admin/orders?${query.toString()}`);
      set({
        orders: res.data.orders,
        pagination: res.data.pagination,
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  fetchOrderDetail: async (id) => {
    set({ isLoading: true, error: null, currentOrder: null });
    try {
      const res = await api.get(`/admin/orders/${id}`);
      set({ currentOrder: res.data.order, isLoading: false });
      return res.data.order;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  processRefund: async (id, data = {}) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/admin/orders/${id}/refund`, data);
      set((state) => ({
        orders: state.orders.map((o) => (o._id === id ? res.data.order : o)),
        currentOrder: state.currentOrder?._id === id ? res.data.order : state.currentOrder,
        isSaving: false,
      }));
      return res.data;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  clearCurrentOrder: () => set({ currentOrder: null }),
  clearError: () => set({ error: null }),
}));

export default useAdminOrderStore;
