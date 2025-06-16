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
    planes: [],  // Añade esto para guardar la lista de planes
    selectedPlan: null,
    showMateriasModal: false,
    lastUpdate: null,
    lastFetch: null  // Añade timestamp de última carga
  })

  // Función para limpiar toda la sesión
  const clearAllSession = () => {
    clearDashboardState()
    clearEstadisticasState()
    clearPlanesState()

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("estadisticasGenerales")
      sessionStorage.removeItem("estadisticasGeneralesTime")
      sessionStorage.removeItem("estadisticasMateria")
      sessionStorage.removeItem("estadisticasMateriaTime")
      sessionStorage.removeItem("savedMateriaCode")
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
