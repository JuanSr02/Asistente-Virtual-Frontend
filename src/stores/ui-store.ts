import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface StatsNavigationParams {
  plan?: string;
  materia?: string;
  periodo?: string;
}

interface InscripcionNavigationParams {
  materiaCodigo: string;
}

interface UIState {
  activeTab: string;
  setActiveTab: (tab: string) => void;

  statsParams: StatsNavigationParams | null;
  setStatsParams: (params: StatsNavigationParams | null) => void;

  inscripcionParams: InscripcionNavigationParams | null;
  setInscripcionParams: (params: InscripcionNavigationParams | null) => void;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: "recomendacion",
      setActiveTab: (tab) => set({ activeTab: tab }),

      statsParams: null,
      setStatsParams: (params) => set({ statsParams: params }),

      inscripcionParams: null,
      setInscripcionParams: (params) => set({ inscripcionParams: params }),

      isSidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        statsParams: state.statsParams,
        inscripcionParams: state.inscripcionParams,
      }),
    },
  ),
);
