import { create } from "zustand";
import api from "@/lib/api";

const useRestaurantNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/restaurant/notifications");
      set({
        notifications: res.data.notifications,
        unreadCount: res.data.unreadCount,
        isLoading: false,
      });
      return res.data;
    } catch {
      set({ isLoading: false });
      return { notifications: [], unreadCount: 0 };
    }
  },

  markNotificationRead: async (id) => {
    try {
      await api.put(`/restaurant/notifications/${id}/read`);
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
      await api.put("/restaurant/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // silently fail
    }
  },
}));

export default useRestaurantNotificationStore;
