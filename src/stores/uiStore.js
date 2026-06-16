import { create } from "zustand";

const useUiStore = create((set) => ({
  // Global loading state
  isPageLoading: false,
  setPageLoading: (isPageLoading) => set({ isPageLoading }),

  // Sidebar state (restaurant & admin portals)
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  // Mobile menu
  isMobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // Search overlay
  isSearchOpen: false,
  setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),

  // Confirm dialog
  confirmDialog: null,
  showConfirm: ({ title, message, onConfirm, onCancel, confirmText, cancelText }) =>
    set({
      confirmDialog: {
        title,
        message,
        onConfirm,
        onCancel,
        confirmText: confirmText || "Confirm",
        cancelText: cancelText || "Cancel",
      },
    }),
  closeConfirm: () => set({ confirmDialog: null }),
}));

export default useUiStore;
