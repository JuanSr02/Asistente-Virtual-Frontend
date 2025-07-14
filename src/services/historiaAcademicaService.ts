import api from "./api";
import { supabase } from "@/supabaseClient";
import axios from "axios";

export interface HistoriaAcademica {
  id: number;
  persona_id_estudiante: number;
  plan_de_estudio_codigo: string;
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

      const response = await axios.post(
        "https://webhook.site/66e46dee-2854-43f8-b7aa-d28d32ac6324", // <-- tu URL
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error al cargar historia académica:", error);
      throw error;
    }
  },

  /**
   * Actualiza la historia académica con nuevos datos
   */
  actualizarHistoriaAcademica: async (
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

      const response = await api.patch(
        `/api/shared/historia-academica/${estudianteId}/actualizacion`,
        formData,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar historia académica:", error);
      throw error;
    }
  },

  /**
   * Elimina la historia académica de un estudiante
   */
  eliminarHistoriaAcademica: async (estudianteId: number): Promise<void> => {
    try {
      await api.delete(`/api/shared/historia-academica/${estudianteId}`);
    } catch (error) {
      console.error("Error al eliminar historia académica:", error);
      throw error;
    }
  },
};

export default historiaAcademicaService;
