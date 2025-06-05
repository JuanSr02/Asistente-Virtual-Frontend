"use client"

import { useUserRole } from "../hooks/useUserRole"
import AdminDashboard from "./AdminDashboard"
import StudentDashboard from "./StudentDashboard"
import { supabase } from "../supabaseClient"

// Componente principal del dashboard que decide qué vista mostrar
export default function Dashboard({ user }) {
  const { role, loading, error } = useUserRole(user)

  console.log("Dashboard - Usuario:", user?.email, "Rol:", role, "Loading:", loading, "Error:", error)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verificando permisos de usuario...</p>
        <p className="loading-detail">Usuario: {user?.email}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>⚠️ Error al cargar el dashboard</h2>
        <p>
          <strong>Error:</strong> {error}
        </p>
        <p>
          <strong>Usuario:</strong> {user?.email}
        </p>
        <div className="error-actions">
          <button onClick={() => window.location.reload()} className="action-button">
            🔄 Reintentar
          </button>
          <button onClick={() => supabase.auth.signOut()} className="action-button secondary">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    )
  }

  // Renderizar el dashboard según el rol
  return (
    <div className="dashboard-wrapper">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Sistema Académico</h1>
          <div className="header-actions">
            <span className="user-badge">{role}</span>
            <button onClick={() => supabase.auth.signOut()} className="logout-button">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {role === "ADMINISTRADOR" ? <AdminDashboard user={user} /> : <StudentDashboard user={user} />}
      </main>
    </div>
  )
}
