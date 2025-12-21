import api from "./api";
import { API_ROUTES } from "@/lib/config";

export interface PlanEstudio {
  codigo: string;
  propuesta: string;
  cantidadMaterias: number;
}

export interface CargaPlanResponse {
  codigo: string;
  propuesta: string;
  cantidadMaterias: number;
}

const planesEstudioService = {
  obtenerPlanes: async (): Promise<PlanEstudio[]> => {
    try {
      const response = await api.get(API_ROUTES.SHARED.PLANES_ESTUDIO);
      return response.data;
    } catch (error) {
      console.error("Error al obtener planes de estudio:", error);
      throw error;
    }
  },

  cargarPlan: async (file: File): Promise<CargaPlanResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Axios gestiona el boundary automáticamente al no setear Content-Type
      const response = await api.post(API_ROUTES.ADMIN.CARGAR_PLAN, formData);
      return response.data;
    } catch (error) {
      console.error("Error al cargar plan de estudio:", error);
      throw error;
    }
  },

  eliminarPlan: async (codigoPlan: string): Promise<void> => {
    try {
      await api.delete(
        `${API_ROUTES.ADMIN.ELIMINAR_PLAN}?codigo=${codigoPlan}`
      );
    } catch (error) {
      console.error("Error al eliminar plan de estudio:", error);
      throw error;
    }
  },

  // Usado por el modal de materias
  obtenerMateriasPorPlan: async (codigoPlan: string): Promise<any[]> => {
    try {
      const response = await api.get(
        `${API_ROUTES.SHARED.MATERIAS_POR_PLAN}?codigoPlan=${codigoPlan}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener materias por plan:", error);
      throw error;
    }
  },
};

export default planesEstudioService;
