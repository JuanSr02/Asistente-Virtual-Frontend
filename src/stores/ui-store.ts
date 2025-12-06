import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Interfaz para los parámetros de navegación hacia estadísticas
interface StatsNavigationParams {
  plan?: string;
  materia?: string;
  periodo?: string;
}

interface UIState {
  // Estado del Dashboard
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Parámetros de navegación (El "chiche")
  statsParams: StatsNavigationParams | null;
  setStatsParams: (params: StatsNavigationParams | null) => void;

  // Estado de Sidebar (preparado para futuro uso)
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: "recomendacion",
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Inicialmente nulo
      statsParams: null,
      setStatsParams: (params) => set({ statsParams: params }),

      isSidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
      // Persistimos params también por si el usuario recarga justo después del clic
      partialize: (state) => ({
        activeTab: state.activeTab,
        statsParams: state.statsParams,
      }),
    }
  )
);
