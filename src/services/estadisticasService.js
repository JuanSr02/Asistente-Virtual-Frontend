import api from "./api";
import { API_ROUTES } from "@/lib/config";

const fetchWithFallback = async (
  fastEndpoint,
  fallbackEndpoint,
  contextDesc = ""
) => {
  try {
    console.log(`Intentando obtener ${contextDesc} (rápido)...`);
    const response = await api.get(fastEndpoint);
    console.log(`✅ ${contextDesc} rápidas obtenidas exitosamente`);
    return response.data;
  } catch (error) {
    console.warn(`⚠️ Error al obtener ${contextDesc} rápidas:`, error);

    if (error.response?.status === 404) {
      console.log(
        `🔄 Datos cacheados no disponibles, usando endpoint normal como fallback...`
      );
      try {
        const fallbackResponse = await api.get(fallbackEndpoint);
        console.log(`✅ ${contextDesc} obtenidas desde endpoint normal`);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error(
          `❌ Error en endpoint normal de ${contextDesc}:`,
          fallbackError
        );
        throw fallbackError;
      }
    }
    throw error;
  }
};

const estadisticasService = {
  obtenerEstadisticasGeneralesRapido: () =>
    fetchWithFallback(
      API_ROUTES.SHARED.ESTADISTICAS_GENERALES_RAPIDO,
      API_ROUTES.SHARED.ESTADISTICAS_GENERALES,
      "estadísticas generales"
    ),

  obtenerEstadisticasPorCarrera: async (codigoPlan, periodo) => {
    try {
      const response = await api.get(
        "/api/shared/estadisticas/generales/carrera",
        {
          params: { plan: codigoPlan, periodo: periodo },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas por carrera:", error);
      throw error;
    }
  },

  obtenerEstadisticasMateriaPorPeriodo: async (codigoMateria, periodo) => {
    try {
      const response = await api.get(
        `/api/shared/estadisticas/materia/${codigoMateria}/periodo`,
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
      console.log("Obteniendo estadísticas generales completas...");
      const response = await api.get(API_ROUTES.SHARED.ESTADISTICAS_GENERALES);
      console.log("✅ Estadísticas generales completas obtenidas exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error al obtener estadísticas generales:", error);
      throw error;
    }
  },

  obtenerEstadisticasMateriaRapido: (codigoMateria) =>
    fetchWithFallback(
      `${API_ROUTES.SHARED.ESTADISTICAS_MATERIA_RAPIDO}/${codigoMateria}`,
      `${API_ROUTES.SHARED.ESTADISTICAS_MATERIA}/${codigoMateria}`,
      `estadísticas de materia ${codigoMateria}`
    ),

  obtenerEstadisticasMateria: async (codigoMateria) => {
    try {
      console.log(
        `Obteniendo estadísticas completas para materia: ${codigoMateria}`
      );
      const response = await api.get(
        `${API_ROUTES.SHARED.ESTADISTICAS_MATERIA}/${codigoMateria}`
      );
      console.log(
        `✅ Estadísticas completas de materia ${codigoMateria} obtenidas exitosamente`
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error al obtener estadísticas de materia ${codigoMateria}:`,
        error
      );
      throw error;
    }
  },
};

export default estadisticasService;
