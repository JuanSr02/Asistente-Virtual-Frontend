"use client"

import { useState } from "react"
import { supabase } from "../supabaseClient"

// Este componente se muestra cuando el usuario ya está autenticado
export default function Dashboard({ user }) {
  const [loading, setLoading] = useState(false)

  // Función para cerrar sesión
  const handleSignOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        alert("Error al cerrar sesión: " + error.message)
      }
    } catch (error) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>¡Bienvenido!</h1>
        <button onClick={handleSignOut} disabled={loading} className="auth-button secondary">
          {loading ? "Cerrando..." : "Cerrar Sesión"}
        </button>
      </div>

      <div className="user-info">
        <h2>Información del Usuario</h2>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Último acceso:</strong> {new Date(user.last_sign_in_at).toLocaleString()}
        </p>
      </div>

      <div className="dashboard-content">
        <h3>Aquí puedes agregar el contenido de tu aplicación</h3>
        <p>Este es el área principal donde los usuarios autenticados verán el contenido de tu app.</p>
        <p>Desde aquí puedes hacer llamadas a tu backend en Java Spring.</p>
      </div>
    </div>
  )
}
