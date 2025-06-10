"use client"

import { useState } from "react"
import PlanesEstudio from "./admin/PlanesEstudio"
import Estadisticas from "./admin/Estadisticas"

// Dashboard específico para administradores
export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("planes")

  // Renderizar el contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case "planes":
        return <PlanesEstudio />
      case "estadisticas":
        return <Estadisticas />
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
              activeTab === "planes"
                ? "text-blue-500 border-blue-500 font-semibold"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("planes")}
          >
            Planes de Estudio
          </button>
          <button
            className={`px-6 py-3 text-base font-medium cursor-pointer border-b-2 transition-all ${
              activeTab === "estadisticas"
                ? "text-blue-500 border-blue-500 font-semibold"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("estadisticas")}
          >
            Estadísticas
          </button>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">{user.email}</span>
          <span className="text-xs text-gray-500">Administrador</span>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full">{renderContent()}</div>
    </div>
  )
}
