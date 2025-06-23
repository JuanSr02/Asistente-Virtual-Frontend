"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import { jwtDecode } from "jwt-decode"

const DEFAULT_ROLE = "ESTUDIANTE"

/**
 * Hook para extraer el rol del usuario desde el JWT de Supabase.
 * @param {object|null} user - Objeto de usuario provisto por Supabase (o null si no está logueado)
 * @returns {{ role: string|null, loading: boolean, error: string|null }}
 */
export function useUserRole(user) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setRole(null)
      setLoading(false)
      return
    }

    const getUserRoleFromToken = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw new Error("No se pudo obtener la sesión del usuario.")
        }

        const token = data?.session?.access_token
        if (!token) throw new Error("Token de sesión no disponible.")

        const decoded = jwtDecode(token)
        const userRole = decoded?.rol_usuario

        if (userRole) {
          console.log("✅ Rol extraído del JWT:", userRole)
          setRole(userRole)
        } else {
          console.warn("⚠️ JWT sin 'rol_usuario'. Usando rol por defecto.")
          setRole(DEFAULT_ROLE)
        }
      } catch (err) {
        console.error("❌ Error al obtener o decodificar el JWT:", err)
        setError("Error al obtener o decodificar el token.")
        setRole(DEFAULT_ROLE)
      } finally {
        setLoading(false)
      }
    }

    getUserRoleFromToken()
  }, [user])

  return { role, loading, error }
}
