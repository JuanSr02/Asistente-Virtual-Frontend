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
   * Obtiene las recomendaciones de finales para un estudiante
   */
  obtenerFinalesParaRendir: async (
    estudianteId: number,
    orden: OrdenFinales = "CORRELATIVAS"
  ): Promise<FinalDTO[]> => {
    try {
      const response = await api.get(`/api/shared/finales/${estudianteId}`, {
        params: { orden },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener finales para rendir:", error);
      throw error;
    }
  },
};

export default recomendacionService;
