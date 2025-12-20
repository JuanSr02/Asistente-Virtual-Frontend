import { API_ROUTES } from "@/lib/config";
import api from "./api";

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
          const response = await api.get(
            `${API_ROUTES.ESTUDIANTE.HISTORIA_ACADEMICA}${personaId}`
          );
          return response.data;
        } catch (error) {
          console.error("Error al obtener historia academica", error);
          throw error;
        }
  },

  /**
   * Carga la historia académica desde un archivo Excel/PDF
   */
  cargarHistoriaAcademica: async (
    file: File,
    estudianteId: number,
    codigoPlan: string
  ): Promise<HistoriaAcademicaResponseDTO> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // CORRECCIÓN: Eliminamos el header manual Content-Type
      // Aumentamos el timeout porque el procesamiento de archivos puede tardar
      const config = {
        params: { codigoPlan },
        timeout: 60000, // 60 segundos
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
