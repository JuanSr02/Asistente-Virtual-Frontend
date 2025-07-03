import api from "./api"
import { API_ROUTES } from "../lib/config"
import { supabase } from "@/supabaseClient"
import type { ActualizarPerfilDTO } from "../types/perfil"

const perfilService = {
  /**
   * Actualiza el perfil de un usuario (estudiante o administrador)
   */
  actualizarPerfil: async (id: number, datos: ActualizarPerfilDTO, rolUsuario: string): Promise<any> => {
    try {
      const endpoint =
        rolUsuario === "ESTUDIANTE"
          ? `${API_ROUTES.SHARED.ACTUALIZAR_ESTUDIANTE}/${id}`
          : `${API_ROUTES.ADMIN.ACTUALIZAR_ADMINISTRADOR}/${id}`

      const response = await api.patch(endpoint, datos)

      // Si se actualizó el email, también actualizar en Supabase Auth
      if (datos.mail) {
        const { error: supabaseError } = await supabase.auth.updateUser({
          email: datos.mail,
        })

        if (supabaseError) {
          console.error("Error actualizando email en Supabase:", supabaseError)
          throw new Error("Error actualizando email en el sistema de autenticación")
        }
      }

      return response.data
    } catch (error) {
      console.error("Error actualizando perfil:", error)
      throw error
    }
  },

  /**
   * Elimina la cuenta de un usuario
   */
  eliminarCuenta: async (id: number, rolUsuario: string): Promise<void> => {
    try {
      // Primero eliminar de la base de datos
      const endpoint =
        rolUsuario === "ESTUDIANTE"
          ? `${API_ROUTES.SHARED.ELIMINAR_ESTUDIANTE}/${id}`
          : `${API_ROUTES.ADMIN.ELIMINAR_ADMINISTRADOR}/${id}`

      await api.delete(endpoint)

      // Luego eliminar de Supabase Auth
      const { error: supabaseError } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id || "",
      )

      if (supabaseError) {
        console.error("Error eliminando usuario de Supabase:", supabaseError)
      }

      // Cerrar sesión
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error eliminando cuenta:", error)
      throw error
    }
  },
}

export default perfilService
