"use client"

import { useEffect, useState, ReactNode } from "react"
import { supabase } from "@/src/supabaseClient"
import Auth from "../app/auth/page"
import Dashboard from "../app/dashboard/page"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../styles/globals.css"


interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [session, setSession] = useState<any>(null)
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

    return () => {
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  if (loading) {
    return (
      <html lang="es">
        <body>
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Verificando autenticación...</p>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </body>
      </html>
    )
  }

  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground">
        {session ? <Dashboard user={session.user} /> : <Auth />}
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  )
}
