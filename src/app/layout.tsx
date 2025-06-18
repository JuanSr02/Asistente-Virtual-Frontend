"use client"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/src/supabaseClient"
import Auth from "../app/auth/page"
import Dashboard from "../app/dashboard/page"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../styles/globals.css"

const publicRoutes = ["/reset-password", "/about", "/terms", "/privacy", "/auth"]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error("Error al obtener sesión:", error)
          setSession(null)
        } else {
          setSession(data.session)
        }
      } catch (error) {
        console.error("Error en initAuth:", error)
        setSession(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Listener para cambios de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      console.log("Auth state changed:", _event, newSession?.user?.email)
      setSession(newSession)
    })

    initAuth()

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, []) // Solo se ejecuta una vez al montar

  // Agregar esto temporalmente en tu componente
useEffect(() => {
  console.log("Estado actual:", { session, loading, pathname })
}, [session, loading, pathname])

  // Manejo de redirecciones
  useEffect(() => {
    if (loading) return // No redirigir mientras está cargando

    const isPublicRoute = publicRoutes.includes(pathname || '')

    if (!session && !isPublicRoute) {
      router.replace("/auth")
    } else if (session && pathname === "/auth") {
      router.replace("/dashboard")
    }
  }, [session, pathname, loading, router])

  // Loading state
  if (loading) {
    return (
      <html lang="es">
        <body>
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Verificando autenticación...</p>
          </div>
        </body>
      </html>
    )
  }

  const isPublicRoute = publicRoutes.includes(pathname || '')

  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground">
        {!isPublicRoute && !session ? (
          <Auth />
        ) : session && !isPublicRoute ? (
          <Dashboard user={session.user} />
        ) : (
          children
        )}
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  )
}