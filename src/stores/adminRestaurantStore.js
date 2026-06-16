import { create } from "zustand";
import api from "@/lib/api";

const useAdminRestaurantStore = create((set, get) => ({
  restaurants: [],
  currentRestaurant: null,
  orderCount: 0,
  recentOrders: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  isSaving: false,
  error: null,

  fetchRestaurants: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") query.append(key, val);
      });
      const res = await api.get(`/admin/restaurants?${query.toString()}`);
      set({
        restaurants: res.data.restaurants,
        pagination: res.data.pagination,
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  fetchRestaurantDetail: async (id) => {
    set({ isLoading: true, error: null, currentRestaurant: null });
    try {
      const res = await api.get(`/admin/restaurants/${id}`);
      set({
        currentRestaurant: res.data.restaurant,
        orderCount: res.data.orderCount,
        recentOrders: res.data.recentOrders,
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  onboardRestaurant: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.post("/admin/restaurants", data);
      set({ isSaving: false });
      return res.data;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  updateRestaurant: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/admin/restaurants/${id}`, data);
      set((state) => ({
        restaurants: state.restaurants.map((r) => (r._id === id ? res.data.restaurant : r)),
        currentRestaurant: state.currentRestaurant?._id === id ? res.data.restaurant : state.currentRestaurant,
        isSaving: false,
      }));
      return res.data.restaurant;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  verifyRestaurant: async (id) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/admin/restaurants/${id}/verify`);
      set((state) => ({
        restaurants: state.restaurants.map((r) => (r._id === id ? res.data.restaurant : r)),
        currentRestaurant: state.currentRestaurant?._id === id ? res.data.restaurant : state.currentRestaurant,
        isSaving: false,
      }));
      return res.data.restaurant;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  suspendRestaurant: async (id, reason) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/admin/restaurants/${id}/suspend`, { reason });
      set((state) => ({
        restaurants: state.restaurants.map((r) => (r._id === id ? res.data.restaurant : r)),
        currentRestaurant: state.currentRestaurant?._id === id ? res.data.restaurant : state.currentRestaurant,
        isSaving: false,
      }));
      return res.data.restaurant;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  clearCurrentRestaurant: () => set({ currentRestaurant: null }),
  clearError: () => set({ error: null }),
}));

export default useAdminRestaurantStore;
