import { create } from "zustand";
import api from "@/lib/api";

const useRestaurantReviewStore = create((set, get) => ({
  // State
  reviews: [],
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  isLoading: false,
  isSaving: false,
  error: null,

  // Fetch reviews with optional filters
  fetchReviews: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all") {
          query.append(key, val);
        }
      });
      const res = await api.get(`/restaurant/reviews?${query.toString()}`);
      set({
        reviews: res.data.reviews,
        pagination: res.data.pagination,
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Reply to a review
  replyToReview: async (reviewId, text) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.post(`/restaurant/reviews/${reviewId}/reply`, { text });
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r._id === reviewId ? res.data.review : r
        ),
        isSaving: false,
      }));
      return res.data.review;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  // Clear
  clearError: () => set({ error: null }),
}));

export default useRestaurantReviewStore;
