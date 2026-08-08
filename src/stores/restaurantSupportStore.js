import { create } from "zustand";
import api from "@/lib/api";

const useRestaurantSupportStore = create((set, get) => ({
  tickets: [],
  isLoading: false,
  isSending: false,
  error: null,

  fetchTickets: async (status) => {
    set({ isLoading: true, error: null });
    try {
      const query = status && status !== "all" ? `?status=${status}` : "";
      const res = await api.get(`/restaurant/support/tickets${query}`);
      set({ tickets: res.data.tickets || [], isLoading: false });
      return res.data.tickets;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Merge a real-time ticket push (new or updated) into the list without a refetch
  upsertTicket: (ticket) =>
    set((s) => {
      const exists = s.tickets.some((t) => t._id === ticket._id);
      return {
        tickets: exists
          ? s.tickets.map((t) => (t._id === ticket._id ? ticket : t))
          : [ticket, ...s.tickets],
      };
    }),

  sendMessage: async (ticketId, text) => {
    set({ isSending: true });
    try {
      const res = await api.post(`/restaurant/support/tickets/${ticketId}/messages`, { text });
      const ticket = res.data.ticket;
      get().upsertTicket(ticket);
      set({ isSending: false });
      return ticket;
    } catch (err) {
      set({ isSending: false, error: err.message });
      throw err;
    }
  },

  resolveTicket: async (ticketId) => {
    const res = await api.put(`/restaurant/support/tickets/${ticketId}/resolve`);
    const ticket = res.data.ticket;
    get().upsertTicket(ticket);
    return ticket;
  },
}));

export default useRestaurantSupportStore;
