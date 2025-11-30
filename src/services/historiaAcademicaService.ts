import { API_ROUTES } from "@/lib/config";
import api from "./api";
import { supabase } from "@/supabaseClient";

export interface HistoriaAcademica {
  id: number;
  persona_id_estudiante: number;
  plan_de_estudio_codigo: string;
  estado: "ACTIVA" | "BAJA";
}

export interface HistoriaAcademicaResponseDTO {
  mensaje: string;
  cantidadMateriasActualizadas?: number;
  cantidadMateriasNuevas?: number;
  planDeEstudio?: string;
}

const historiaAcademicaService = {
  /**
   * Verifica si un estudiante tiene historia académica cargada
   */
  verificarHistoriaAcademica: async (
    personaId: number
  ): Promise<HistoriaAcademica | null> => {
    try {
      const { data, error } = await supabase
        .from("historia_academica")
        .select("*")
        .eq("persona_id_estudiante", personaId)
        .eq("estado", "ACTIVA")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No se encontró historia académica
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error al verificar historia académica:", error);
      throw error;
    }
  },

  /**
   * Carga la historia académica desde un archivo Excel
   */
  cargarHistoriaAcademica: async (
    file: File,
    estudianteId: number,
    codigoPlan: string
  ): Promise<HistoriaAcademicaResponseDTO> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        params: { codigoPlan },
        timeout: 20000, // 20 segundos
      };

      const response = await api.post(
        API_ROUTES.ESTUDIANTE.HISTORIA_ACADEMICA + estudianteId + "/carga",
        formData,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error al cargar historia académica:", error);
      throw error;
    }
  },

 

  /**
   * Elimina la historia académica de un estudiante
   */
  eliminarHistoriaAcademica: async (estudianteId: number): Promise<void> => {
    try {
      await api.delete(API_ROUTES.ESTUDIANTE.HISTORIA_ACADEMICA + estudianteId);
    } catch (error) {
      console.error("Error al eliminar historia académica:", error);
      throw error;
    }
  },
};

export default historiaAcademicaService;
