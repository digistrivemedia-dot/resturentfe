import { create } from "zustand";
import api from "@/lib/api";
import { setToken, clearToken } from "@/lib/tokenManager";
import { disconnectSocket } from "@/lib/socket";

const useAuthStore = create((set, get) => ({
  isInitialized: false, // true once AuthInitializer has read the cookie
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setInitialized: () => set({ isInitialized: true }),

  // Called by AuthInitializer on page load (cookie read, no API call)
  setUserFromCookie: (user) =>
    set({ user, isAuthenticated: true }),

  login: (user, token) => {
    if (token) setToken(token);
    set({ user, isAuthenticated: true, error: null });
  },

  logout: () => {
    clearToken();
    disconnectSocket();
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateProfile: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  hasRole: (role) => get().user?.role === role,

  // ─── API Actions ───────────────────────────────────────────────────────────

  sendOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/auth/send-otp", { email });
      set({ isLoading: false });
      return res;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      const { user, token, isNewUser } = res.data;
      setToken(token);
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return { user, isNewUser };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  googleLogin: async (accessToken) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/auth/google", { accessToken });
      const { user, token, isNewUser } = res.data;
      setToken(token);
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return { user, isNewUser };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  loginWithPassword: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, token } = res.data;
      setToken(token);
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return { user };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  fetchMe: async () => {
    try {
      const res = await api.get("/auth/me");
      const { user } = res.data;
      set({ user, isAuthenticated: true });
      return user;
    } catch {
      clearToken();
      set({ user: null, isAuthenticated: false });
      return null;
    }
  },

  // ── Optimistic restaurant favourite toggle ─────────────────────────────────
  optimisticToggleFavoriteRestaurant: (restaurantId) => {
    set((state) => {
      if (!state.user) return {};
      const current = state.user.favorites || [];
      const exists = current.some((r) => {
        const id = typeof r === "object" ? r._id : r;
        return id?.toString() === restaurantId?.toString();
      });
      const updated = exists
        ? current.filter((r) => {
            const id = typeof r === "object" ? r._id : r;
            return id?.toString() !== restaurantId?.toString();
          })
        : [...current, restaurantId];
      return { user: { ...state.user, favorites: updated } };
    });
  },

  // ── Optimistic dish favourite toggle ──────────────────────────────────────
  optimisticToggleFavoriteDish: (dish) => {
    set((state) => {
      if (!state.user) return {};
      const current = state.user.favoriteDishes || [];
      const exists = current.some((d) => {
        const id = typeof d === "object" ? d._id : d;
        return id?.toString() === dish._id?.toString();
      });
      const updated = exists
        ? current.filter((d) => {
            const id = typeof d === "object" ? d._id : d;
            return id?.toString() !== dish._id?.toString();
          })
        : [...current, dish];
      return { user: { ...state.user, favoriteDishes: updated } };
    });
  },

  completeProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put("/customer/profile", data);
      const { user } = res.data;
      set({ user, isLoading: false, error: null });
      return user;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  logoutUser: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore — clear local state regardless
    }
    clearToken();
    disconnectSocket();
    set({ user: null, isAuthenticated: false, error: null });
  },
}));

export default useAuthStore;
