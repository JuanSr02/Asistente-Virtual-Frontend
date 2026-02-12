import { API_ROUTES } from "@/lib/config";
import api from "./api";

export interface MateriaParaInscripcion {
  codigo: string;
  nombre: string;
}

export interface RegistroInscripcionDTO {
  turno: string;
  anio: number;
  materiaCodigo: string;
  materiaPlan: string;
  estudianteId: number;
}

export interface InscripcionResponseDTO {
  id: number;
  turno: string;
  anio: number;
  materiaNombre: string;
  materiaCodigo: string;
  materiaPlan: string;
  estudianteNombre: string;
  estudianteId: number;
  estudianteEmail: string;
}

const inscripcionService = {
  /**
   * Obtiene las materias que puede rendir un estudiante para inscribirse
   */
  obtenerMateriasParaInscripcion: async (
    estudianteId: number,
  ): Promise<MateriaParaInscripcion[]> => {
    try {
      const response = await api.get(
        API_ROUTES.ESTUDIANTE.OBTENER_INSCRIPCIONES_POSIBLES +
          estudianteId +
          "/inscripciones",
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener materias para inscripción:", error);
      throw error;
    }
  },

  /**
   * Crea una nueva inscripción
   */
  crearInscripcion: async (
    dto: RegistroInscripcionDTO,
  ): Promise<InscripcionResponseDTO> => {
    try {
      const response = await api.post(API_ROUTES.SHARED.INSCRIPCIONES, dto);
      return response.data;
    } catch (error) {
      console.error("Error al crear inscripción:", error);
      throw error;
    }
  },

  /**
   * Elimina una inscripción existente
   */
  eliminarInscripcion: async (id: number): Promise<void> => {
    try {
      await api.delete(API_ROUTES.SHARED.INSCRIPCIONES + "/" + id);
    } catch (error) {
      console.error("Error al eliminar inscripción:", error);
      throw error;
    }
  },

  /**
   * Obtiene los inscriptos a una materia específica
   */
  obtenerInscriptos: async (
    codigoMateria: string,
    anio: number,
    turno: string,
  ): Promise<InscripcionResponseDTO[]> => {
    try {
      const response = await api.get(API_ROUTES.SHARED.INSCRIPCIONES, {
        params: { codigoMateria, anio, turno },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener inscriptos:", error);
      throw error;
    }
  },

  /**
   * Obtiene las inscripciones de un estudiante específico
   */
  obtenerInscripcionesEstudiante: async (
    estudianteId: number,
  ): Promise<InscripcionResponseDTO[]> => {
    try {
      const response = await api.get(
        `${API_ROUTES.SHARED.INSCRIPCIONES}/estudiante/${estudianteId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener inscripciones:", error);
      throw error;
    }
  },
};

export default inscripcionService;
