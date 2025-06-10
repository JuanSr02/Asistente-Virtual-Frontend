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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-600">Verificando permisos de usuario...</p>
        <p className="text-sm text-gray-500">Usuario: {user?.email}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 text-center p-8 bg-white rounded-xl shadow-md border-l-4 border-red-500">
        <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Error al cargar el dashboard</h2>
        <p className="mb-2 text-gray-600">
          <strong>Error:</strong> {error}
        </p>
        <p className="mb-6 text-gray-600">
          <strong>Usuario:</strong> {user?.email}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            🔄 Reintentar
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    )
  }

  // Renderizar el dashboard según el rol
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 shadow-lg">
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sistema Académico</h1>
          <div className="flex items-center gap-4">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              {role}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {role === "ADMINISTRADOR" ? <AdminDashboard user={user} /> : <StudentDashboard user={user} />}
      </main>
    </div>
  )
}
