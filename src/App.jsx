"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"
import Auth from "./components/Auth"
import Dashboard from "./components/Dashboard"

// Componente principal de la aplicación
function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener la sesión actual al cargar la app
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Error obteniendo sesión:", error)
        }
        setSession(session)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Solo actualizar el estado si realmente hay un cambio en la sesión
      if (JSON.stringify(session) !== JSON.stringify(session)) {
        console.log("Auth state changed:", _event, session)
        setSession(session)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-600">Verificando autenticación...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Si no hay sesión, mostrar el formulario de auth */}
      {!session ? (
        <Auth />
      ) : (
        /* Si hay sesión, mostrar el dashboard */
        <Dashboard user={session.user} />
      )}
    </div>
  )
}

export default App
