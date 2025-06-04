"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"

// Hook personalizado para obtener el rol del usuario
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

    const getUserRole = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Obteniendo rol para usuario:", user.email)

        // Primero intentamos obtener el rol del JWT
        if (user.app_metadata?.rol_usuario) {
          console.log("Rol encontrado en app_metadata:", user.app_metadata.rol_usuario)
          setRole(user.app_metadata.rol_usuario)
          setLoading(false)
          return
        }

        // Si no está en app_metadata, intentamos user_metadata
        if (user.user_metadata?.rol_usuario) {
          console.log("Rol encontrado en user_metadata:", user.user_metadata.rol_usuario)
          setRole(user.user_metadata.rol_usuario)
          setLoading(false)
          return
        }

        // Si no está en los metadatos, consultamos la tabla persona
        console.log("Consultando tabla persona para:", user.email)

        // Usar comillas simples para el valor y especificar el tipo de dato
        const { data, error } = await supabase.from("persona").select("rol_usuario").eq("mail", user.email).single()

        if (error) {
          console.error("Error obteniendo rol de la tabla:", error)

          if (error.code === "PGRST116") {
            // No se encontró el usuario en la tabla
            console.log("Usuario no encontrado en tabla persona, creando registro con rol ESTUDIANTE")

            // Intentar crear el usuario en la tabla con rol por defecto
            const { data: insertData, error: insertError } = await supabase
              .from("persona")
              .insert([
                {
                  mail: user.email,
                  nombre: user.user_metadata?.full_name || user.email.split("@")[0],
                  rol_usuario: "ESTUDIANTE",
                },
              ])
              .select()
              .single()

            if (insertError) {
              console.error("Error creando usuario:", insertError)
              setRole("ESTUDIANTE") // Rol por defecto si falla la inserción
            } else {
              console.log("Usuario creado exitosamente:", insertData)
              setRole("ESTUDIANTE")
            }
          } else {
            console.error("Error de base de datos:", error)
            setError(`Error de base de datos: ${error.message}`)
            setRole("ESTUDIANTE") // Rol por defecto
          }
        } else {
          console.log("Rol encontrado en tabla:", data?.rol_usuario)
          setRole(data?.rol_usuario || "ESTUDIANTE")
        }
      } catch (err) {
        console.error("Error procesando rol:", err)
        setError(`Error: ${err.message}`)
        setRole("ESTUDIANTE") // Rol por defecto
      } finally {
        setLoading(false)
      }
    }

    getUserRole()
  }, [user])

  return { role, loading, error }
}
