import { create } from "zustand";
import api from "@/lib/api";

const useOrderStore = create((set, get) => ({
  // State
  orders: [],
  activeOrders: [],
  currentOrder: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  isLoading: false,
  isPlacing: false,
  error: null,

  // Place order
  placeOrder: async (orderData) => {
    set({ isPlacing: true, error: null });
    try {
      const res = await api.post("/orders", orderData);
      const { order } = res.data;
      set({ currentOrder: order, isPlacing: false });
      return order;
    } catch (err) {
      set({ isPlacing: false, error: err.response?.data?.message || err.message });
      throw err;
    }
  },

  // Fetch my orders
  fetchMyOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const res = await api.get(`/orders?${query.toString()}`);
      const { orders, pagination } = res.data;
      set({ orders, pagination, isLoading: false });
      return { orders, pagination };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Fetch active orders
  fetchActiveOrders: async () => {
    try {
      const res = await api.get("/orders?status=active");
      set({ activeOrders: res.data.orders });
      return res.data.orders;
    } catch {
      return [];
    }
  },

  // Fetch single order
  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null, currentOrder: null });
    try {
      const res = await api.get(`/orders/${id}`);
      set({ currentOrder: res.data.order, isLoading: false });
      return res.data.order;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Cancel order
  cancelOrder: async (id, reason) => {
    try {
      const res = await api.post(`/orders/${id}/cancel`, { reason });
      const { order } = res.data;
      // Update in lists
      set((state) => ({
        orders: state.orders.map((o) => (o._id === id ? order : o)),
        activeOrders: state.activeOrders.filter((o) => o._id !== id),
        currentOrder: state.currentOrder?._id === id ? order : state.currentOrder,
      }));
      return order;
    } catch (err) {
      throw err;
    }
  },

  // Rate order
  rateOrder: async (id, ratingData) => {
    try {
      const res = await api.post(`/orders/${id}/rate`, ratingData);
      const { order } = res.data;
      set((state) => ({
        orders: state.orders.map((o) => (o._id === id ? order : o)),
        currentOrder: state.currentOrder?._id === id ? order : state.currentOrder,
      }));
      return order;
    } catch (err) {
      throw err;
    }
  },

  // Clear
  clearCurrentOrder: () => set({ currentOrder: null }),
}));

export default useOrderStore;
