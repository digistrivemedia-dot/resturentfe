import { create } from "zustand";
import api from "@/lib/api";

const useAdminNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  isLoading: false,

  // status: "all" | "unread" | "read"
  fetchNotifications: async (page = 1, status = "all") => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({ page });
      if (status && status !== "all") params.set("status", status);
      const res = await api.get(`/admin/notifications?${params.toString()}`);
      set({
        notifications: res.data.notifications,
        unreadCount: res.data.unreadCount,
        pagination: res.data.pagination,
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
      await api.put(`/admin/notifications/${id}/read`);
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
      await api.put("/admin/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // silently fail
    }
  },
}));

export default useAdminNotificationStore;
