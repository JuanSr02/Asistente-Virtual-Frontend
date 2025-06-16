"use client"

import { usePersistentStateGroup } from "./usePersistentState"

/**
 * Hook principal para manejar toda la persistencia de la sesión del usuario
 */
export function useSessionPersistence() {
  // Nombres consistentes para las claves de sesión
  const DASHBOARD_NS = "dashboard"
  const ESTADISTICAS_NS = "estadisticas"
  const PLANES_NS = "planes"

  // Dashboard
  const [dashboardState, setDashboardState, clearDashboardState] = usePersistentStateGroup(DASHBOARD_NS, {
    activeTab: "planes",
    lastVisited: new Date().toISOString(),
  })

  // Estadísticas
  const [estadisticasState, setEstadisticasState, clearEstadisticasState] = usePersistentStateGroup(ESTADISTICAS_NS, {
    activeTab: "generales",
    planSeleccionado: "",
    materiaSeleccionada: "",
    lastUpdate: null,
  })

  // Planes de estudio
  const [planesState, setPlanesState, clearPlanesState] = usePersistentStateGroup(PLANES_NS, {
    planes: [],
    selectedPlan: null,
    showMateriasModal: false,
    lastUpdate: null,
    lastFetch: null,
  })

  /**
   * Limpia todos los estados persistidos, incluyendo algunos extras manuales.
   */
  const clearAllSession = () => {
    clearDashboardState()
    clearEstadisticasState()
    clearPlanesState()

    if (typeof window !== "undefined") {
      const sessionKeysToClear = [
        "estadisticasGenerales",
        "estadisticasGeneralesTime",
        "estadisticasMateria",
        "estadisticasMateriaTime",
        "savedMateriaCode",
      ]

      sessionKeysToClear.forEach((key) => sessionStorage.removeItem(key))
    }
  }

  /**
   * Actualiza la fecha de última visita en el estado del dashboard.
   */
  const updateLastVisited = () => {
    setDashboardState("lastVisited", new Date().toISOString())
  }

  return {
    // Estados
    dashboardState,
    estadisticasState,
    planesState,

    // Setters
    setDashboardState,
    setEstadisticasState,
    setPlanesState,

    // Utilidades
    clearAllSession,
    updateLastVisited,
  }
}
