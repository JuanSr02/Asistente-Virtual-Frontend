import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  // Estado del Dashboard
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Estado de Sidebar (preparado para futuro uso)
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: "recomendacion", // Valor por defecto inicial
      setActiveTab: (tab) => set({ activeTab: tab }),

      isSidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
    }),
    {
      name: "ui-storage", // Nombre de la key en localStorage
      storage: createJSONStorage(() => localStorage), // Usamos localStorage para persistencia entre sesiones
      // Solo persistimos la tab activa para mejorar la UX al recargar
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
