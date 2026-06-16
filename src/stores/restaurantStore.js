import { create } from "zustand";
import api from "@/lib/api";

const useRestaurantStore = create((set, get) => ({
  // State
  restaurants: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
  filters: {},
  selectedRestaurant: null,
  menu: [],
  categories: [],
  searchResults: { restaurants: [], dishes: [] },
  suggestions: [],
  isLoading: false,
  error: null,

  // Fetch restaurants list with filters
  fetchRestaurants: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const res = await api.get(`/restaurants?${query.toString()}`);
      const { restaurants, pagination } = res.data;
      set({
        restaurants,
        pagination,
        filters: params,
        isLoading: false,
      });
      return { restaurants, pagination };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Load more (append to existing list)
  loadMoreRestaurants: async () => {
    const { pagination, filters, restaurants } = get();
    if (pagination.page >= pagination.totalPages) return;

    set({ isLoading: true });
    try {
      const nextPage = pagination.page + 1;
      const query = new URLSearchParams({ ...filters, page: nextPage });
      const res = await api.get(`/restaurants?${query.toString()}`);
      set({
        restaurants: [...restaurants, ...res.data.restaurants],
        pagination: res.data.pagination,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  // Fetch single restaurant by slug
  fetchRestaurantBySlug: async (slug) => {
    set({ isLoading: true, error: null, selectedRestaurant: null });
    try {
      const res = await api.get(`/restaurants/${slug}`);
      set({ selectedRestaurant: res.data.restaurant, isLoading: false });
      return res.data.restaurant;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Fetch restaurant menu
  fetchMenu: async (restaurantId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/restaurants/${restaurantId}/menu`);
      set({
        menu: res.data.menu,
        categories: res.data.categories,
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Toggle favorite
  toggleFavorite: async (restaurantId) => {
    try {
      const res = await api.post(`/restaurants/${restaurantId}/favorite`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Search restaurants & dishes
  searchRestaurants: async (query, params = {}) => {
    if (!query || query.trim().length < 2) {
      set({ searchResults: { restaurants: [], dishes: [] } });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const searchParams = new URLSearchParams({ q: query, ...params });
      const res = await api.get(`/search?${searchParams.toString()}`);
      set({
        searchResults: {
          restaurants: res.data.restaurants,
          dishes: res.data.dishes,
        },
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // Search suggestions (autocomplete)
  fetchSuggestions: async (query) => {
    if (!query || query.trim().length < 1) {
      set({ suggestions: [] });
      return;
    }
    try {
      const res = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      set({ suggestions: res.data.suggestions });
    } catch {
      set({ suggestions: [] });
    }
  },

  // Clear states
  clearSelectedRestaurant: () => set({ selectedRestaurant: null, menu: [], categories: [] }),
  clearSearch: () => set({ searchResults: { restaurants: [], dishes: [] }, suggestions: [] }),
}));

export default useRestaurantStore;
