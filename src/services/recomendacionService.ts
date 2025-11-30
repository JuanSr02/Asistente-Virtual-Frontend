import { API_ROUTES } from "@/lib/config";
import api from "./api";

export type OrdenFinales = "CORRELATIVAS" | "VENCIMIENTO" | "ESTADISTICAS";

export interface EstadisticasMateria {
  porcentajeAprobados: number;
  promedioNotas: number;
  promedioDiasEstudio: number;
  promedioHorasDiarias: number;
  promedioDificultad: number;
}

export interface FinalDTO {
  codigoMateria: string;
  nombreMateria: string;
  fechaRegularidad: string;
  fechaVencimiento: string;
  semanasParaVencimiento: number;
  vecesEsCorrelativa: number;
  estadisticas: EstadisticasMateria;
}

const recomendacionService = {
  /**
   * Obtiene las sugerencias de finales para un estudiante
   */
  obtenerFinalesParaRendir: async (
    estudianteId: number,
    orden: string = "CORRELATIVAS"
  ): Promise<FinalDTO[]> => {
    try {
      const response = await api.get(
        API_ROUTES.ESTUDIANTE.FINALES_PARA_RENDIR + estudianteId,
        {
          params: { orden },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener finales para rendir:", error);
      throw error;
    }
  },
};

export default recomendacionService;
