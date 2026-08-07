import { create } from "zustand";
import api from "@/lib/api";

// Superadmin-controlled flat fee added to every order. Fetched once (public,
// unauthenticated) and cached here so cartStore's plain getTotal() and the
// checkout page can both read it without re-fetching.
const usePlatformFeeStore = create((set, get) => ({
  enabled: true,
  amount: 3,
  loaded: false,

  fetchPlatformFee: async () => {
    if (get().loaded) return;
    try {
      const res = await api.get("/settings/platform-fee");
      set({ enabled: !!res.data.enabled, amount: Number(res.data.amount) || 0, loaded: true });
    } catch (err) {
      set({ loaded: true });
    }
  },
}));

export default usePlatformFeeStore;
