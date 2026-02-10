import { API_ROUTES } from "@/lib/config";
import api from "./api";

export interface MateriaEstadistica {
  nombre: string;
  porcentaje: number;
  codigoMateria?: string;
}

export interface EstadisticasGeneralesDTO {
  estudiantesActivos: number;
  totalMaterias: number;
  totalExamenesRendidos: number;
  porcentajeAprobadosGeneral: number;
  promedioGeneral: number;
  materiaMasRendida: {
    nombre: string;
    porcentaje: number;
  };
  cantidadMateriaMasRendida: number;
  distribucionEstudiantesPorCarrera: Record<string, number>;
  distribucionExamenesPorMateria: Record<string, number>;
  promedioNotasPorMateria: Record<string, number>;
  top5Aprobadas: MateriaEstadistica[];
  top5Reprobadas: MateriaEstadistica[];
}

export interface EstadisticasCarreraDTO extends EstadisticasGeneralesDTO {
  planCodigo: string;
}

export interface EstadisticasMateriaDTO {
  nombreMateria: string;
  codigoMateria: string;
  totalRendidos: number;
  aprobados: number;
  reprobados: number;
  porcentajeAprobados: number;
  promedioNotas: number;
  promedioDiasEstudio: number;
  promedioHorasDiarias: number;
  promedioDificultad: number;
  distribucionModalidad: Record<string, number>;
  distribucionRecursos: Record<string, number>;
  distribucionDificultad: Record<string, number>;
}

const estadisticasService = {
  /**
   * Obtiene estadísticas globales del sistema
   */
  obtenerEstadisticasGenerales: async (): Promise<EstadisticasGeneralesDTO> => {
    try {
      const response = await api.get(API_ROUTES.SHARED.ESTADISTICAS_GENERALES);
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas generales:", error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas filtradas por carrera y período
   */
  obtenerEstadisticasPorCarrera: async (
    codigoPlan: string,
    periodo: string
  ): Promise<EstadisticasCarreraDTO> => {
    try {
      const response = await api.get(
        API_ROUTES.SHARED.ESTADISTICAS_POR_CARRERA,
        {
          params: { plan: codigoPlan, periodo },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas por carrera:", error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de una materia específica
   */
  obtenerEstadisticasMateriaPorPeriodo: async (
    codigoMateria: string,
    periodo: string
  ): Promise<EstadisticasMateriaDTO> => {
    try {
      const response = await api.get(
        `${API_ROUTES.SHARED.ESTADISTICAS_MATERIA}${codigoMateria}`,
        {
          params: { periodo },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas de materia:", error);
      throw error;
    }
  },

  /**
   * Fuerza el recálculo de estadísticas (Admin)
   */
  recalcularEstadisticas: async (): Promise<{ mensaje: string }> => {
    try {
      const response = await api.get(API_ROUTES.SHARED.RECALCULAR_ESTADISTICAS);
      return response.data;
    } catch (error) {
      console.error("Error al recalcular estadísticas:", error);
      throw error;
    }
  },
};

export default estadisticasService;
