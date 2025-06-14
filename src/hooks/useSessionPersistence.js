"use client"

import { usePersistentStateGroup } from "./usePersistentState"

/**
 * Hook principal para manejar toda la persistencia de la sesión del usuario
 */
export function useSessionPersistence() {
  // Estado principal del dashboard
  const [dashboardState, setDashboardState, clearDashboardState] = usePersistentStateGroup("dashboard", {
    activeTab: "planes",
    lastVisited: new Date().toISOString(),
  })

  // Estado de estadísticas
  const [estadisticasState, setEstadisticasState, clearEstadisticasState] = usePersistentStateGroup("estadisticas", {
    activeTab: "generales",
    planSeleccionado: "",
    materiaSeleccionada: "",
    lastUpdate: null,
  })

  // Estado de planes de estudio
  const [planesState, setPlanesState, clearPlanesState] = usePersistentStateGroup("planes", {
    selectedPlan: null,
    lastUpdate: null,
  })

  // Función para limpiar toda la sesión
  const clearAllSession = () => {
    clearDashboardState()
    clearEstadisticasState()
    clearPlanesState()

    // Limpiar otros datos relacionados
    if (typeof window !== "undefined") {
      localStorage.removeItem("estadisticasGenerales")
      localStorage.removeItem("estadisticasGeneralesTime")
      localStorage.removeItem("estadisticasMateria")
      localStorage.removeItem("estadisticasMateriaTime")
      localStorage.removeItem("savedMateriaCode")
    }
  }

  // Función para actualizar la última visita
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
