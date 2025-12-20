import { API_ROUTES } from "@/lib/config";
import api from "./api";

export interface Persona {
  id: number;
  mail: string;
  nombre_apellido: string;
  rol_usuario: string;
  supabase_user_id: string;
  telefono?: string;
}

const personaService = {
  /**
   * Obtiene la información de una persona por su Supabase User ID
   */
  obtenerPersonaPorSupabaseId: async (
    supabaseUserId: string
  ): Promise<Persona | null> => {
    try {
      const response = await api.get(`
        ${API_ROUTES.SHARED.OBTENER_PERSONA}/usuario/${supabaseUserId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener persona por supabaseId", error);
      throw error;
    }
  },

  /**
   * Obtiene la información de una persona por su email
   */
  obtenerPersonaPorEmail: async (email: string): Promise<Persona | null> => {
    try {
      const response = await api.get(
        `
        ${API_ROUTES.SHARED.OBTENER_PERSONA}/buscar`,
        {
          params: { email },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener persona por mail", error);
      throw error;
    }
  },
};

export default personaService;
