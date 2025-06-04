"use client"

import { useUserRole } from "../hooks/useUserRole"
import NavBar from "./NavBar"
import StudentDashboard from "./StudentDashboard"
import AdminDashboard from "./AdminDashboard"
import { supabase } from "../supabaseClient" // Import supabase

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
        <details className="error-details">
          <summary>Información técnica</summary>
          <pre>{JSON.stringify({ user: user?.email, role, error }, null, 2)}</pre>
        </details>
      </div>
    )
  }

  return (
    <div className="app-layout">
      {/* Barra de navegación superior */}
      <NavBar user={user} role={role} />

      {/* Dashboard específico según el rol */}
      <div className="dashboard-content">
        {role === "ADMINISTRADOR" ? <AdminDashboard user={user} /> : <StudentDashboard user={user} />}
      </div>
    </div>
  )
}
