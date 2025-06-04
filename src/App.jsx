"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"
import Auth from "./components/Auth"
import Dashboard from "./components/Dashboard"
import "./App.css"

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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session)
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    )
  }

  return (
    <div className="App">
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
