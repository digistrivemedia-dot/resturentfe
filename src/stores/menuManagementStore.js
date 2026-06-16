import { create } from "zustand";
import api from "@/lib/api";

const useMenuManagementStore = create((set, get) => ({
  // State
  menu: [], // [{category, items[]}]
  categories: [], // [{name, itemCount}]
  addonGroups: [],
  isLoading: false,
  isSaving: false,
  error: null,

  // ─── Menu ────────────────────────────────────────────────────────────

  fetchMenu: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/menu");
      set({ menu: res.data.menu, isLoading: false });
      return res.data.menu;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  addMenuItem: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.post("/restaurant/menu", data);
      // Refetch menu to get updated grouped data
      await get().fetchMenu();
      set({ isSaving: false });
      return res.data.menuItem;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  updateMenuItem: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/restaurant/menu/${id}`, data);
      await get().fetchMenu();
      set({ isSaving: false });
      return res.data.menuItem;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  deleteMenuItem: async (id, hard = false) => {
    set({ isSaving: true, error: null });
    try {
      const url = hard ? `/restaurant/menu/${id}?hard=true` : `/restaurant/menu/${id}`;
      await api.delete(url);
      await get().fetchMenu();
      set({ isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  toggleAvailability: async (id) => {
    set({ error: null });
    try {
      const res = await api.put(`/restaurant/menu/${id}/toggle`);
      // Update in-place within menu groups
      set((state) => ({
        menu: state.menu.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item._id === id ? { ...item, isAvailable: res.data.menuItem.isAvailable } : item
          ),
        })),
      }));
      return res.data.menuItem;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  bulkToggle: async (ids, isAvailable) => {
    set({ isSaving: true, error: null });
    try {
      await api.put("/restaurant/menu/bulk-toggle", { ids, isAvailable });
      // Update in-place
      set((state) => ({
        menu: state.menu.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            ids.includes(item._id) ? { ...item, isAvailable } : item
          ),
        })),
        isSaving: false,
      }));
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  // Helper: get flat list of all menu items
  getAllItems: () => {
    return get().menu.flatMap((group) => group.items);
  },

  // ─── Categories ──────────────────────────────────────────────────────

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/categories");
      set({ categories: res.data.categories, isLoading: false });
      return res.data.categories;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  addCategory: async (name) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.post("/restaurant/categories", { name });
      await get().fetchCategories();
      set({ isSaving: false });
      return res.data;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  updateCategory: async (oldName, newName) => {
    set({ isSaving: true, error: null });
    try {
      await api.put(`/restaurant/categories/${encodeURIComponent(oldName)}`, { name: newName });
      await get().fetchCategories();
      set({ isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  reorderCategories: async (orderedNames) => {
    set({ isSaving: true, error: null });
    try {
      await api.put("/restaurant/categories/reorder", { categories: orderedNames });
      await get().fetchCategories();
      set({ isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  deleteCategory: async (name) => {
    set({ isSaving: true, error: null });
    try {
      await api.delete(`/restaurant/categories/${encodeURIComponent(name)}`);
      await get().fetchCategories();
      set({ isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  // ─── Addon Groups ───────────────────────────────────────────────────

  fetchAddons: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/restaurant/addons");
      set({ addonGroups: res.data.addonGroups, isLoading: false });
      return res.data.addonGroups;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  addAddonGroup: async (menuItemId, group) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.post("/restaurant/addons", { menuItemId, group });
      await get().fetchAddons();
      set({ isSaving: false });
      return res.data;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  updateAddonGroup: async (groupId, menuItemId, group) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/restaurant/addons/${groupId}`, { menuItemId, group });
      await get().fetchAddons();
      set({ isSaving: false });
      return res.data;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  deleteAddonGroup: async (groupId, menuItemId) => {
    set({ isSaving: true, error: null });
    try {
      await api.delete(`/restaurant/addons/${groupId}`, { data: { menuItemId } });
      await get().fetchAddons();
      set({ isSaving: false });
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  // Clear
  clearError: () => set({ error: null }),
}));

export default useMenuManagementStore;
