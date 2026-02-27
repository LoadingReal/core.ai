import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
}

export const useSidebarState = create<SidebarState>()(
  persist(
    (set) => ({
    isOpen: true,
    toggle: () =>
      set((state) => ({
        isOpen: !state.isOpen,
      })),
  }), {
    name: "sidebar-storage",
  }),
);
