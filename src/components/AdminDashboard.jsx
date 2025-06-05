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
        return <div>Seleccione una opción del menú</div>
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Barra de navegación horizontal */}
      <nav className="admin-nav">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "planes" ? "active" : ""}`}
            onClick={() => setActiveTab("planes")}
          >
            Planes de Estudio
          </button>
          <button
            className={`nav-tab ${activeTab === "estadisticas" ? "active" : ""}`}
            onClick={() => setActiveTab("estadisticas")}
          >
            Estadísticas
          </button>
        </div>
        <div className="user-profile">
          <span className="user-email">{user.email}</span>
          <span className="user-role">Administrador</span>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="admin-content">{renderContent()}</div>
    </div>
  )
}
