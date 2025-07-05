import { supabase } from "@/supabaseClient";

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
      const { data, error } = await supabase
        .from("persona")
        .select("*")
        .eq("supabase_user_id", supabaseUserId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No se encontró la persona
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error al obtener persona por Supabase ID:", error);
      throw error;
    }
  },

  /**
   * Obtiene la información de una persona por su email
   */
  obtenerPersonaPorEmail: async (email: string): Promise<Persona | null> => {
    try {
      const { data, error } = await supabase
        .from("persona")
        .select("*")
        .eq("mail", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No se encontró la persona
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error al obtener persona por email:", error);
      throw error;
    }
  },
};

export default personaService;
