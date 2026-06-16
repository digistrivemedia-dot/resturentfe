import { create } from "zustand";
import api from "@/lib/api";

const useRestaurantDashboardStore = create((set, get) => ({
  // State
  stats: null,
  liveOrders: [],
  currentOrder: null,
  orderHistory: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  isStatsLoading: false,
  isUpdating: false,
  error: null,

  // Fetch dashboard stats
  fetchDashboardStats: async () => {
    set({ isStatsLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/dashboard");
      set({ stats: res.data.stats, isStatsLoading: false });
      return res.data.stats;
    } catch (err) {
      set({ isStatsLoading: false, error: err.message });
      throw err;
    }
  },

  // Fetch orders (live or history)
  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const res = await api.get(`/restaurant/orders?${query.toString()}`);
      const { orders, pagination } = res.data;

      if (params.filter === "history") {
        set({ orderHistory: orders, pagination, isLoading: false });
      } else {
        set({ liveOrders: orders, pagination, isLoading: false });
      }
      return { orders, pagination };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Fetch live orders (shorthand)
  fetchLiveOrders: async () => {
    return get().fetchOrders({ filter: "live" });
  },

  // Fetch order history (shorthand)
  fetchOrderHistory: async (params = {}) => {
    return get().fetchOrders({ filter: "history", ...params });
  },

  // Fetch single order
  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null, currentOrder: null });
    try {
      const res = await api.get(`/restaurant/orders/${id}`);
      set({ currentOrder: res.data.order, isLoading: false });
      return res.data.order;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Accept order
  acceptOrder: async (orderId) => {
    set({ isUpdating: true, error: null });
    try {
      const res = await api.put(`/restaurant/orders/${orderId}/accept`);
      const updated = res.data.order;
      set((state) => ({
        liveOrders: state.liveOrders.map((o) => (o._id === orderId ? updated : o)),
        currentOrder: state.currentOrder?._id === orderId ? updated : state.currentOrder,
        isUpdating: false,
      }));
      return updated;
    } catch (err) {
      set({ isUpdating: false, error: err.message });
      throw err;
    }
  },

  // Reject order
  rejectOrder: async (orderId, reason) => {
    set({ isUpdating: true, error: null });
    try {
      const res = await api.put(`/restaurant/orders/${orderId}/reject`, { reason });
      const updated = res.data.order;
      set((state) => ({
        liveOrders: state.liveOrders.filter((o) => o._id !== orderId),
        currentOrder: state.currentOrder?._id === orderId ? updated : state.currentOrder,
        isUpdating: false,
      }));
      return updated;
    } catch (err) {
      set({ isUpdating: false, error: err.message });
      throw err;
    }
  },

  // Update order status (preparing → ready → picked_up → etc.)
  updateOrderStatus: async (orderId, status) => {
    set({ isUpdating: true, error: null });
    try {
      const res = await api.put(`/restaurant/orders/${orderId}/status`, { status });
      const updated = res.data.order;

      // If delivered or beyond, remove from live
      const doneStatuses = ["picked_up", "out_for_delivery", "delivered"];
      set((state) => ({
        liveOrders: doneStatuses.includes(status)
          ? state.liveOrders.filter((o) => o._id !== orderId)
          : state.liveOrders.map((o) => (o._id === orderId ? updated : o)),
        currentOrder: state.currentOrder?._id === orderId ? updated : state.currentOrder,
        isUpdating: false,
      }));
      return updated;
    } catch (err) {
      set({ isUpdating: false, error: err.message });
      throw err;
    }
  },

  // Clear
  clearCurrentOrder: () => set({ currentOrder: null }),
  clearError: () => set({ error: null }),
}));

export default useRestaurantDashboardStore;
