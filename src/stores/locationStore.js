import { create } from "zustand";
import { persist } from "zustand/middleware";

const useLocationStore = create(
  persist(
    (set) => ({
      currentLocation: null, // { lat, lng, address, city, area }
      savedAddresses: [],
      isLocationLoading: false,

      setCurrentLocation: (location) =>
        set({ currentLocation: location }),

      clearLocation: () =>
        set({ currentLocation: null }),

      setSavedAddresses: (addresses) =>
        set({ savedAddresses: addresses }),

      addAddress: (address) =>
        set((state) => ({
          savedAddresses: [...state.savedAddresses, address],
        })),

      updateAddress: (id, updates) =>
        set((state) => ({
          savedAddresses: state.savedAddresses.map((addr) =>
            addr._id === id ? { ...addr, ...updates } : addr
          ),
        })),

      removeAddress: (id) =>
        set((state) => ({
          savedAddresses: state.savedAddresses.filter(
            (addr) => addr._id !== id
          ),
        })),

      setDefaultAddress: (id) =>
        set((state) => ({
          savedAddresses: state.savedAddresses.map((addr) => ({
            ...addr,
            isDefault: addr._id === id,
          })),
        })),

      setLocationLoading: (isLocationLoading) =>
        set({ isLocationLoading }),
    }),
    {
      name: "location-storage",
      partialize: (state) => ({
        currentLocation: state.currentLocation,
      }),
    }
  )
);

export default useLocationStore;
