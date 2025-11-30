import api from "./api";
import { API_ROUTES } from "@/lib/config";

const estadisticasService = {
  obtenerEstadisticasPorCarrera: async (codigoPlan, periodo) => {
    try {
      const Response = await api.get(
        API_ROUTES.SHARED.ESTADISTICAS_POR_CARRERA,
        {
          params: { plan: codigoPlan, periodo: periodo },
        }
      );
      return Response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas por carrera:", error);
      throw error;
    }
  },

  obtenerEstadisticasMateriaPorPeriodo: async (codigoMateria, periodo) => {
    try {
      const response = await api.get(
        API_ROUTES.SHARED.ESTADISTICAS_MATERIA + codigoMateria,
        {
          params: { periodo: periodo },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error al obtener estadísticas de materia por período:",
        error
      );
      throw error;
    }
  },

  obtenerEstadisticasGenerales: async () => {
    try {
      const response = await api.get(API_ROUTES.SHARED.ESTADISTICAS_GENERALES);
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas generales:", error);
      throw error;
    }
  },
  recalcularEstadisticas: async () => {
    try {
      const response = await api.get(API_ROUTES.SHARED.RECALCULAR_ESTADISTICAS);
      return response.data;
    } catch (error) {
      console.error("Error al recalcular estadisticas:", error);
      throw error;
    }
  },
};
export default estadisticasService;
