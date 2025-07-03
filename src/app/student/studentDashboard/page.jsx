"use client"

import { useState, useEffect } from "react"
import Recomendacion from "../recomendacion/page"
import EstadisticasMateria from "@/app/estadisticasMateria/page"
import Inscripcion from "../inscripcion/page"
import { useSessionPersistence } from "@/hooks/useSessionPersistence"
import ExperienciasExamen from "../experiencias-examen/page"

// Dashboard específico para estudiantes
export default function StudentDashboard({ user }) {
  const { dashboardState, setDashboardState, updateLastVisited } = useSessionPersistence()

  // Estado inicial específico para estudiantes (por defecto "recomendacion")
  const [activeTab, setActiveTab] = useState(
    dashboardState?.activeTab === "planes" ? "recomendacion" : dashboardState?.activeTab || "recomendacion",
  )

  // Actualizar la última visita cuando el componente se monta
  useEffect(() => {
    updateLastVisited()
  }, [])

  // Sincronizar el estado local con el persistente
  useEffect(() => {
    // Si viene de admin dashboard, cambiar a recomendacion por defecto
    if (dashboardState?.activeTab === "planes") {
      setActiveTab("recomendacion")
      setDashboardState("activeTab", "recomendacion")
    } else {
      setActiveTab(dashboardState?.activeTab || "recomendacion")
    }
  }, [dashboardState?.activeTab])

  // Manejar cambio de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setDashboardState("activeTab", tab)
    updateLastVisited()
  }

  // Escuchar eventos de cambio de pestaña desde otros componentes
  useEffect(() => {
    const handleChangeTab = (event) => {
      const newTab = event.detail
      if (newTab && newTab !== activeTab) {
        handleTabChange(newTab)
      }
    }

    window.addEventListener("changeTab", handleChangeTab)
    return () => window.removeEventListener("changeTab", handleChangeTab)
  }, [activeTab])

  // Renderizar el contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case "recomendacion":
        return <Recomendacion user={user} />
      case "inscripcion":
        return <Inscripcion user={user} />
      case "estadisticas":
        return <EstadisticasMateria />
      case "experiencias":
        return <ExperienciasExamen user={user} />
      default:
        return <div className="text-center py-8 text-gray-500">Seleccione una opción del menú</div>
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Barra de navegación horizontal */}
      <nav className="bg-white px-8 py-2 border-b border-gray-200 flex justify-between items-center">
        <div className="flex gap-4">
          <button
            className={`px-6 py-3 text-base font-medium cursor-pointer border-b-2 transition-all ${
              activeTab === "recomendacion"
                ? "text-blue-500 border-blue-500 font-semibold"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
            onClick={() => handleTabChange("recomendacion")}
          >
            📚 Recomendación
          </button>
          <button
            className={`px-6 py-3 text-base font-medium cursor-pointer border-b-2 transition-all ${
              activeTab === "experiencias"
                ? "text-blue-500 border-blue-500 font-semibold"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
            onClick={() => handleTabChange("experiencias")}
          >
            💭 Experiencias de Examen
          </button>
          <button
            className={`px-6 py-3 text-base font-medium cursor-pointer border-b-2 transition-all ${
              activeTab === "inscripcion"
                ? "text-blue-500 border-blue-500 font-semibold"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
            onClick={() => handleTabChange("inscripcion")}
          >
            ✏️ Inscripción
          </button>
          <button
            className={`px-6 py-3 text-base font-medium cursor-pointer border-b-2 transition-all ${
              activeTab === "estadisticas"
                ? "text-blue-500 border-blue-500 font-semibold"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
            onClick={() => handleTabChange("estadisticas")}
          >
            📊 Estadísticas por Materia
          </button>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">Usuario: {user.email}</span>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full">{renderContent()}</div>
    </div>
  )
}
