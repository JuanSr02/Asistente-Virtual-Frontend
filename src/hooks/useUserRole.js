"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import jwt_decode, { jwtDecode } from "jwt-decode"


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

        if (sessionError || !data.session) {
          throw new Error("No se pudo obtener la sesión del usuario.")
        }

        const token = data.session.access_token
        const decoded = jwtDecode(token)
        const rol = decoded.rol_usuario

        if (rol) {
          console.log("Rol extraído del JWT:", rol)
          setRole(rol)
        } else {
          console.warn("El JWT no contiene el campo 'rol_usuario'. Asignando rol por defecto.")
          setRole("ESTUDIANTE")
        }
      } catch (err) {
        console.error("Error al obtener o decodificar el JWT:", err)
        setError("Error al obtener o decodificar el token")
        setRole("ESTUDIANTE") // Rol por defecto
      } finally {
        setLoading(false)
      }
    }

    getUserRoleFromToken()
  }, [user])

  return { role, loading, error }
}
