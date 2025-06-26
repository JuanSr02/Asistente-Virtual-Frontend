"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import { jwtDecode } from "jwt-decode"
import type { User } from "@supabase/supabase-js"

type UserRole = "ADMIN" | "ESTUDIANTE" | null
type JwtPayload = {
  rol_usuario?: UserRole
  [key: string]: any
}

const DEFAULT_ROLE: UserRole = "ESTUDIANTE"

/**
 * Hook para extraer el rol del usuario desde el JWT de Supabase
 * @param {User | null} user - Objeto de usuario provisto por Supabase (o null si no está logueado)
 * @returns {{
 *   role: UserRole,
 *   loading: boolean,
 *   error: string | null
 * }} - Objeto con el rol, estado de carga y posible error
 */
export function useUserRole(user: User | null): {
  role: UserRole
  loading: boolean
  error: string | null
} {
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setRole(null)
      setLoading(false)
      return
    }

    const getUserRoleFromToken = async (): Promise<void> => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw new Error("No se pudo obtener la sesión del usuario.")
        }

        const token = data?.session?.access_token
        if (!token) throw new Error("Token de sesión no disponible.")

        const decoded = jwtDecode<JwtPayload>(token)
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