"use client"

import { useState } from "react"
import EstadisticasGenerales from "./EstadisticasGenerales"
import EstadisticasMateria from "./EstadisticasMateria"

export default function Estadisticas() {
  const [activeTab, setActiveTab] = useState("generales")

  return (
    <div className="estadisticas-container">
      <h2 className="section-title">Estadísticas del Sistema</h2>

      {/* Pestañas */}
      <div className="estadisticas-tabs">
        <button
          className={`tab-button ${activeTab === "generales" ? "active" : ""}`}
          onClick={() => setActiveTab("generales")}
        >
          Estadísticas Generales
        </button>
        <button
          className={`tab-button ${activeTab === "materia" ? "active" : ""}`}
          onClick={() => setActiveTab("materia")}
        >
          Estadísticas por Materia
        </button>
      </div>

      {/* Contenido */}
      <div className="estadisticas-content">
        {activeTab === "generales" ? <EstadisticasGenerales /> : <EstadisticasMateria />}
      </div>
    </div>
  )
}
