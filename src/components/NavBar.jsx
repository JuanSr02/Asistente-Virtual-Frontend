"use client"

import { useState } from "react"
import { supabase } from "../supabaseClient"

// Componente de navegación que cambia según el rol del usuario
export default function NavBar({ user, role }) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  // Configuración de navegación según el rol
  const navigationConfig = {
    ESTUDIANTE: [
      { name: "Historia Académica", icon: "📚" },
      { name: "Estadísticas", icon: "📊" },
      { name: "Experiencias", icon: "🎓" },
      { name: "Inscripciones", icon: "📝" },
    ],
    ADMINISTRADOR: [
      { name: "Usuarios", icon: "👥" },
      { name: "Plan de Estudio", icon: "📋" },
      { name: "Estadísticas", icon: "📈" },
    ],
  }

  const navItems = navigationConfig[role] || navigationConfig.ESTUDIANTE

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error al cerrar sesión:", error)
        alert("Error al cerrar sesión: " + error.message)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo y título */}
        <div className="navbar-brand">
          <h2>🎓 Sistema Académico</h2>
          <span className={`role-badge role-badge-${role.toLowerCase()}`}>
            {role === "ADMINISTRADOR" ? "Admin" : "Estudiante"}
          </span>
        </div>

        {/* Navegación principal */}
        <div className="navbar-nav">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`nav-item ${activeTab === index ? "active" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Información del usuario y logout */}
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <span className="user-role">{role}</span>
          </div>
          <button onClick={handleSignOut} disabled={loading} className="logout-button">
            {loading ? "Cerrando..." : "🚪 Salir"}
          </button>
        </div>
      </div>
    </nav>
  )
}
