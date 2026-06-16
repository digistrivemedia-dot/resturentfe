import { create } from "zustand";
import api from "@/lib/api";

const useProfileStore = create((set) => ({
  isLoading: false,
  error: null,

  // Update profile
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put("/customer/profile", data);
      set({ isLoading: false });
      return res.data.user;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || err.message });
      throw err;
    }
  },

  // Add address
  addAddress: async (address) => {
    try {
      const res = await api.post("/customer/address", address);
      return res.data.addresses;
    } catch (err) {
      throw err;
    }
  },

  // Update address
  updateAddress: async (id, address) => {
    try {
      const res = await api.put(`/customer/address/${id}`, address);
      return res.data.addresses;
    } catch (err) {
      throw err;
    }
  },

  // Delete address
  deleteAddress: async (id) => {
    try {
      const res = await api.delete(`/customer/address/${id}`);
      return res.data.addresses;
    } catch (err) {
      throw err;
    }
  },

  // Notifications
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async (page = 1) => {
    try {
      const res = await api.get(`/customer/notifications?page=${page}`);
      set({
        notifications: res.data.notifications,
        unreadCount: res.data.unreadCount,
      });
      return res.data;
    } catch {
      return { notifications: [], unreadCount: 0 };
    }
  },

  markNotificationRead: async (id) => {
    try {
      await api.put(`/customer/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // silently fail
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await api.put("/customer/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // silently fail
    }
  },
}));

export default useProfileStore;
