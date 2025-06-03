"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"
import Auth from "./components/Auth"
import Dashboard from "./components/Dashboard"
import "./App.css"

// Componente principal de la aplicación
function App() {
  // Estado para almacenar la sesión del usuario
  const [session, setSession] = useState(null)
  // Estado para controlar la carga inicial
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener la sesión actual al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Escuchar cambios en la autenticación
    // Esto se ejecuta cuando el usuario inicia/cierra sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    // Limpiar el listener cuando el componente se desmonte
    return () => subscription.unsubscribe()
  }, [])

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
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
