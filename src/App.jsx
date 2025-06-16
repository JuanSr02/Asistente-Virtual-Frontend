"use client"

import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
<ToastContainer position="top-right" autoClose={3000} />

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) console.error("Error obteniendo sesión:", error)
        setSession(data?.session || null)
      } catch (err) {
        console.error("Error inesperado al obtener sesión:", err)
      } finally {
        setLoading(false)
      }
    }

    initSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => listener?.subscription?.unsubscribe?.()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground">Verificando autenticación...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {!session ? <Auth /> : <Dashboard user={session.user} />}
    </main>
  )
}
