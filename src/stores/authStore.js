import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setToken: (token) =>
        set({ token }),

      login: (user, token) =>
        set({ user, token, isAuthenticated: true, error: null }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, error: null }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error }),

      // Check if user has a specific role
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      // ─── API Actions ───

      // Send OTP to email (customer login)
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

      // Verify OTP and login
      verifyOtp: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("/auth/verify-otp", { email, otp });
          const { user, token, isNewUser } = res.data;
          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
          return { user, isNewUser };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      // Google OAuth login
      googleLogin: async (idToken) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("/auth/google", { idToken });
          const { user, token, isNewUser } = res.data;
          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
          return { user, isNewUser };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      // Email + password login (restaurant owners & admins)
      loginWithPassword: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("/auth/login", { email, password });
          const { user, token } = res.data;
          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
          return { user };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      // Get current user profile
      fetchMe: async () => {
        try {
          const res = await api.get("/auth/me");
          const { user } = res.data;
          set({ user, isAuthenticated: true });
          return user;
        } catch {
          // Token invalid — clear auth
          set({ user: null, token: null, isAuthenticated: false });
          return null;
        }
      },

      // Update profile (name, email, phone)
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

      // Logout
      logoutUser: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // Ignore error — clear local state regardless
        }
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
