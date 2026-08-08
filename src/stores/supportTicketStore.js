import { create } from "zustand";
import api from "@/lib/api";

const useSupportTicketStore = create((set, get) => ({
  categories: [],
  categoriesLoaded: false,
  ticketsByOrder: {}, // orderId -> ticket[]
  myTickets: [], // every ticket the customer has raised, across all orders
  currentTicket: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchMyTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/customer/support/tickets");
      set({ myTickets: res.data.tickets || [], isLoading: false });
      return res.data.tickets;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  fetchCategories: async () => {
    if (get().categoriesLoaded) return get().categories;
    try {
      const res = await api.get("/customer/support/categories");
      set({ categories: res.data.categories || [], categoriesLoaded: true });
      return res.data.categories;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchTicketsForOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/customer/support/tickets/order/${orderId}`);
      set((s) => ({
        ticketsByOrder: { ...s.ticketsByOrder, [orderId]: res.data.tickets || [] },
        isLoading: false,
      }));
      return res.data.tickets;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  fetchTicketById: async (ticketId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/customer/support/tickets/${ticketId}`);
      set({ currentTicket: res.data.ticket, isLoading: false });
      return res.data.ticket;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  createTicket: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.post("/customer/support/tickets", payload);
      const ticket = res.data.ticket;
      set((s) => ({
        isSubmitting: false,
        currentTicket: ticket,
        ticketsByOrder: {
          ...s.ticketsByOrder,
          [payload.orderId]: [ticket, ...(s.ticketsByOrder[payload.orderId] || [])],
        },
      }));
      return ticket;
    } catch (err) {
      set({ isSubmitting: false, error: err.response?.data?.message || err.message });
      throw err;
    }
  },

  sendMessage: async (ticketId, text) => {
    const res = await api.post(`/customer/support/tickets/${ticketId}/messages`, { text });
    const ticket = res.data.ticket;
    set({ currentTicket: ticket });
    return ticket;
  },

  setCurrentTicket: (ticket) => set({ currentTicket: ticket }),
  clearError: () => set({ error: null }),
}));

export default useSupportTicketStore;
