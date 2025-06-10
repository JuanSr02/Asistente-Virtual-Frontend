"use client"

import { useState, useEffect } from "react"
import EstadisticasGenerales from "./EstadisticasGenerales"
import EstadisticasMateria from "./EstadisticasMateria"

export default function Estadisticas() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("estadisticasActiveTab") || "generales"
  })

  // Guardar la pestaña activa en localStorage
  useEffect(() => {
    localStorage.setItem("estadisticasActiveTab", activeTab)
  }, [activeTab])

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas del Sistema</h2>

      {/* Pestañas */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-2">
        <button
          className={`px-6 py-3 text-base font-medium cursor-pointer border-b-4 transition-all ${
            activeTab === "generales"
              ? "text-blue-500 border-blue-500 font-semibold"
              : "text-gray-600 border-transparent hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("generales")}
        >
          Estadísticas Generales
        </button>
        <button
          className={`px-6 py-3 text-base font-medium cursor-pointer border-b-4 transition-all ${
            activeTab === "materia"
              ? "text-blue-500 border-blue-500 font-semibold"
              : "text-gray-600 border-transparent hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("materia")}
        >
          Estadísticas por Materia
        </button>
      </div>

      {/* Contenido */}
      <div className="min-h-[25rem]">
        {activeTab === "generales" ? <EstadisticasGenerales /> : <EstadisticasMateria />}
      </div>
    </div>
  )
}
