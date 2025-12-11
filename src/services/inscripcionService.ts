import { API_ROUTES } from "@/lib/config";
import api from "./api";
import { supabase } from "@/supabaseClient";

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
}

export interface InscriptoConEmail {
  id: number;
  turno: string;
  anio: number;
  materiaNombre: string;
  materiaCodigo: string;
  materiaPlan: string;
  estudianteNombre: string;
  estudianteId: number;
  email?: string;
}

const inscripcionService = {
  /**
   * Obtiene las materias que puede rendir un estudiante para inscribirse
   */
  obtenerMateriasParaInscripcion: async (
    estudianteId: number
  ): Promise<MateriaParaInscripcion[]> => {
    try {
      const response = await api.get(
        API_ROUTES.ESTUDIANTE.OBTENER_INSCRIPCIONES_POSIBLES +
          estudianteId +
          "/inscripciones"
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
    dto: RegistroInscripcionDTO
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
    turno: string
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
    estudianteId: number
  ): Promise<InscripcionResponseDTO[]> => {
    try {
      // Obtener inscripciones desde Supabase
      const { data, error } = await supabase
        .from("registro_inscripcion")
        .select(
          `
          id,
          anio,
          turno,
          materia_codigo,
          materia_plan_codigo
        `
        )
        .eq("persona_id_estudiante", estudianteId);

      if (error) {
        throw error;
      }

      // Transformar los datos al formato esperado
      return data.map((inscripcion: any) => ({
        id: inscripcion.id,
        turno: inscripcion.turno,
        anio: inscripcion.anio,
        materiaNombre: inscripcion.materiaNombre,
        materiaCodigo: inscripcion.materia_codigo,
        materiaPlan: inscripcion.materia_plan_codigo,
        estudianteNombre: "", // No necesario para las propias inscripciones
        estudianteId: estudianteId,
      }));
    } catch (error) {
      console.error("Error al obtener inscripciones del estudiante:", error);
      throw error;
    }
  },

  /**
   * Obtiene inscriptos con sus emails desde Supabase
   */
  obtenerInscriptosConEmails: async (
    codigoMateria: string,
    anio: number,
    turno: string
  ): Promise<InscriptoConEmail[]> => {
    try {
      // Primero obtener los inscriptos del backend
      const inscriptos = await inscripcionService.obtenerInscriptos(
        codigoMateria,
        anio,
        turno
      );

      // Luego obtener los emails desde Supabase
      const inscriptosConEmails: InscriptoConEmail[] = [];

      for (const inscripto of inscriptos) {
        try {
          const { data, error } = await supabase
            .rpc("obtener_email_estudiante", { id_buscado: inscripto.estudianteId })
            .single();

          inscriptosConEmails.push({
            ...inscripto,
            email: error ? undefined : data?.mail,
          });
        } catch (emailError) {
          console.warn(
            `No se pudo obtener email para estudiante ${inscripto.estudianteId}:`,
            emailError
          );
          inscriptosConEmails.push(inscripto);
        }
      }

      return inscriptosConEmails;
    } catch (error) {
      console.error("Error al obtener inscriptos con emails:", error);
      throw error;
    }
  },
};

export default inscripcionService;
