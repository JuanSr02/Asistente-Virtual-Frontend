import api from "./api";
import { API_ROUTES } from "../lib/config";
import { supabase } from "@/supabaseClient";
import type { ActualizarPerfilDTO } from "../lib/types/perfil";

const perfilService = {
  /**
   * Actualiza el perfil de un usuario (estudiante o administrador)
   */
  actualizarPerfil: async (
    id: number,
    datos: ActualizarPerfilDTO,
    rolUsuario: string
  ): Promise<any> => {
    try {
      const endpoint =
        rolUsuario === "ESTUDIANTE"
          ? `${API_ROUTES.SHARED.ACTUALIZAR_ESTUDIANTE}/${id}`
          : `${API_ROUTES.ADMIN.ACTUALIZAR_ADMINISTRADOR}/${id}`;

      const response = await api.patch(endpoint, datos);

      return response.data;
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      throw error;
    }
  },

  /**
   * Elimina la cuenta de un usuario
   */
  eliminarCuenta: async (id: number, rolUsuario: string): Promise<void> => {
    try {
      const endpoint =
        rolUsuario === "ESTUDIANTE"
          ? `${API_ROUTES.SHARED.ELIMINAR_ESTUDIANTE}/${id}`
          : `${API_ROUTES.ADMIN.ELIMINAR_ADMINISTRADOR}/${id}`;

      await api.delete(endpoint);

      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error eliminando cuenta:", error);
      throw error;
    }
  },
};

export default perfilService;
