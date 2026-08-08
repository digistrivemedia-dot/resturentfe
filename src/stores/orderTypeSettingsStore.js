import { create } from "zustand";
import api from "@/lib/api";

// Superadmin-controlled per-order-type availability (delivery/dine_in/pickup/self_service).
// Fetched once (public, unauthenticated) and used to filter the order-type pickers.
const useOrderTypeSettingsStore = create((set, get) => ({
  enabledMap: { delivery: true, dine_in: true, pickup: true, self_service: true },
  loaded: false,

  fetchOrderTypeSettings: async () => {
    if (get().loaded) return;
    try {
      const res = await api.get("/settings/order-types");
      set({ enabledMap: { ...get().enabledMap, ...res.data }, loaded: true });
    } catch (err) {
      set({ loaded: true });
    }
  },
}));

export default useOrderTypeSettingsStore;
